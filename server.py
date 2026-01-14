import os
import sys
import time
import tempfile
import json
import asyncio

import logging

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        # logging.FileHandler("server.log", encoding='utf-8') # Uncomment to save logs
    ]
)
logger = logging.getLogger(__name__)

# Force UTF-8 encoding for stdout/stderr on Windows to prevent UnicodeEncodeError
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# Hack for Windows editdistance dependency
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
# Add typhoon-asr source package to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "typhoon-asr", "packages", "typhoon_asr"))

print("--- Script Started ---")
print(f"Python: {sys.version}")

try:
    print("Loading dependencies...")
    import numpy as np
    from fastapi import FastAPI, WebSocket, WebSocketDisconnect
    from fastapi.middleware.cors import CORSMiddleware
    import torch
    import soundfile as sf
    print("Core dependencies loaded.")
    
    print("Loading Typhoon ASR (this will take a while for the first run)...")
    from typhoon_asr import transcribe
    print("Typhoon ASR Engine Loaded.")
    
    from functools import partial # For in-memory fallback

except Exception as e:
    print(f"Error during import: {e}")
    # If typhoon-asr fails, try to provide more info
    import traceback
    traceback.print_exc()
    sys.exit(1)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000", "http://localhost:5173"], # Restrict to local dev/prod urls
    allow_methods=["GET", "POST", "HEAD"],
    allow_headers=["*"],
)

# Global lock for inference to prevent concurrency crashes
inference_lock = asyncio.Lock()

@app.on_event("startup")
async def startup_event():
    global asr_model, device # Expose device globally
    print("Initializing Typhoon ASR Model...")
    try:
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"Loading model on {device.upper()}...")
        
        # Optimize CPU threads if running on CPU
        if device == 'cpu':
            torch.set_num_threads(4)

        # Load the model directly using NeMo
        import nemo.collections.asr as nemo_asr
        asr_model = nemo_asr.models.ASRModel.from_pretrained(model_name="scb10x/typhoon-asr-realtime", map_location=device)
        print("[OK] Typhoon ASR Model Loaded Successfully!")
        # Warmup
        print("Warming up model...")
        # Create a silent audio file for warmup
        dummy_audio = np.zeros(16000, dtype=np.float32)
        temp_wav_path = ""
        try:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_wav:
                temp_wav_path = temp_wav.name
                sf.write(temp_wav_path, dummy_audio, 16000)
            
            # File is closed here, safe to read
            asr_model.transcribe(audio=[temp_wav_path])
        finally:
            if temp_wav_path and os.path.exists(temp_wav_path):
                try:
                    os.remove(temp_wav_path)
                except Exception:
                    pass  # Ignore cleanup errors on Windows warmup
        print("Model warmup complete.")
    except Exception as e:
        print(f"[ERROR] Failed to load model: {e}")
        import traceback
        traceback.print_exc()

    # Serve Static Files (React Build)
    from fastapi.staticfiles import StaticFiles
    from starlette.responses import FileResponse

    # Mount static assets (JS, CSS, Media)
    if os.path.exists("dist"):
        app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")
        # Mount other typical static folders if they exist
        for folder in ["public", "images", "Audio"]:
             if os.path.exists(f"dist/{folder}"):
                 app.mount(f"/{folder}", StaticFiles(directory=f"dist/{folder}"), name=folder)

    # API Health Check (Head/Get)
    @app.get("/api/health")
    @app.head("/api/health")
    async def health_check():
         return {
            "status": "ASR Backend is running", 
            "model_loaded": asr_model is not None
        }

    # Explicit HEAD handler for root (used by frontend polling)
    @app.head("/")
    async def root_head():
        return {"status": "ok"}

    # Catch-all for SPA (React Router)
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API calls to pass through
        if full_path.startswith("api/") or full_path.startswith("ws"):
             return {"error": "Not Found"}
        
        # Check if file exists in dist (e.g. favicon.ico, manifest.json)
        possible_file = os.path.join("dist", full_path)
        if os.path.exists(possible_file) and os.path.isfile(possible_file):
            return FileResponse(possible_file)

        # Otherwise serve index.html
        if os.path.exists("dist/index.html"):
            return FileResponse("dist/index.html")
        
        return {"error": "Frontend build not found. Run 'npm run build' first."}


# Connection Manager for broadcasting
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        # Check if websocket is still in the list before removing
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        # Create a copy of the list to iterate over safely
        for connection in self.active_connections[:]:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Error sending to client: {e}")
                self.disconnect(connection)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    print(f"WebSocket connected (Total: {len(manager.active_connections)})")
    
    if asr_model is None:
        try:
            await websocket.close(reason="Model not loaded")
        except:
            pass
        return

    # Connection-specific buffer
    all_audio_data = np.array([], dtype=np.float32)
    
    # Silence detection parameters
    SILENCE_THRESHOLD = 0.03  # Increased from 0.01 to be less sensitive to background noise
    SILENCE_DURATION_SECONDS = 3.0 # How long to wait before clearing
    CHUNK_DURATION = 4096 / 16000 # Approx 0.256s
    MAX_SILENCE_CHUNKS = int(SILENCE_DURATION_SECONDS / CHUNK_DURATION)
    silence_chunk_count = 0

    print(f"Silence Detection Config: Threshold={SILENCE_THRESHOLD}, MaxChunks={MAX_SILENCE_CHUNKS}")

    # Create a persistent temp file for this connection
    temp_wav = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    temp_wav.close()
    temp_wav_path = temp_wav.name

    try:
        while True:
            data = await websocket.receive_bytes()
            # Convert bytes to numpy array
            audio_chunk = np.frombuffer(data, dtype=np.int16).astype(np.float32) / 32768.0
            
            # Calculate energy (RMS)
            rms = np.sqrt(np.mean(audio_chunk**2))
            
            if rms < SILENCE_THRESHOLD:
                silence_chunk_count += 1
            else:
                silence_chunk_count = 0
                
            # Check for extended silence
            if silence_chunk_count > MAX_SILENCE_CHUNKS:
                # If we have been silent for a while, clear the buffer and the screen
                if len(all_audio_data) > 0:
                    print(f"Silence detected (Chunks: {silence_chunk_count}). Clearing buffer and screen.")
                    all_audio_data = np.array([], dtype=np.float32)
                    # Broadcast clear command (empty text)
                    await manager.broadcast(json.dumps({
                        "type": "transcript",
                        "text": "" 
                    }))
                # Keep discarding new silent chunks until speech resumes
                continue

            # Accumulate audio
            all_audio_data = np.concatenate((all_audio_data, audio_chunk))
            
            # --- Transcription Logic ---
            try:
                # Protect with lock to prevent "Cannot unfreeze partially" error
                async with inference_lock:
                    result = None
                    loop = asyncio.get_event_loop()

                    # -- Attempt 1: In-Memory Processing (Faster) --
                    try:
                        # Convert to tensor
                        audio_tensor = torch.from_numpy(all_audio_data).unsqueeze(0)
                        audio_len = torch.tensor([len(all_audio_data)])
                        
                        if device == 'cuda':
                            audio_tensor = audio_tensor.cuda()
                            audio_len = audio_len.cuda()

                        # Try passing tensor directly
                        result = await loop.run_in_executor(
                            None, 
                            partial(asr_model.transcribe, audio_signal=audio_tensor, length=audio_len)
                        )
                    except Exception as mem_err:
                        # logger.warning(f"In-memory transcription failed, falling back to disk: {mem_err}")
                        
                        # -- Attempt 2: Disk Fallback (Slower but reliable) --
                        # Save accumulated audio to temp file
                        sf.write(temp_wav_path, all_audio_data, 16000)
                        result = await loop.run_in_executor(
                            None, 
                            lambda: asr_model.transcribe(audio=[temp_wav_path])
                        )
                
                # Process Result
                text = ""
                if result and len(result) > 0:
                    first_result = result[0]
                    if hasattr(first_result, 'text'):
                        text = first_result.text
                    else:
                        text = str(first_result)
                
                if text.strip():
                    print(f"Typhoon: {text}")
                    # Broadcast to ALL connected clients (Sender + Display Page)
                    await manager.broadcast(json.dumps({
                        "type": "transcript",
                        "text": text
                    }))

            except Exception as e:
                print(f"Transcription error: {e}")

    except WebSocketDisconnect:
        print("WebSocket disconnected")
        manager.disconnect(websocket)
    except Exception as e:
        print(f"Socket error: {e}")
        manager.disconnect(websocket)
    finally:
        # Cleanup temp file
        if os.path.exists(temp_wav_path):
            try:
                os.remove(temp_wav_path)
            except:
                pass

if __name__ == "__main__":
    import uvicorn
    print("Launching Uvicorn on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
