# Thai STT - Live Transcription & Translation System
**Powered by 3PT Live Streaming**

A professional, real-time Speech-to-Text (STT) application designed for live broadcasting. It utilizes the **Typhoon ASR** model from SCB10X for high-accuracy Thai transcription and integrates seamlessly with OBS/vMix via a transparent browser source.

## 🚀 Key Features

*   **Real-time Thai Transcription**: Low-latency ASR using the `scb10x/typhoon-asr-realtime` model.
*   **OBS & vMix Integration**: Dedicated `/display` page with transparent background for overlaying captions on live streams.
*   **Smart Silence Detection**: Automatically clears the screen when the speaker stops talking (VAD - Voice Activity Detection).
*   **Customizable Appearance**: Real-time adjustment of font size, color, background, and alignment.
*   **Dual-View Sync**: Settings changed on the control panel immediately propagate to the OBS display view.
*   **Optimized Performance**:
    *   **Low Latency**: Tuned audio buffer (2048 samples) for rapid feedback (~128ms chunking).
    *   **Non-blocking Inference**: ASR processing runs on separate threads to keep the UI and WebSocket responsive.
    *   **Resource Management**: Optimized CPU thread usage `torch.set_num_threads(4)`.

## 🛠 Tech Stack

### Frontend
*   **Framework**: React (Vite) + TypeScript
*   **UI Library**: Shadcn/UI + Tailwind CSS
*   **State Management**: React Hooks + LocalStorage (for cross-tab sync)
*   **Communication**: WebSockets (Real-time audio streaming & text broadcasting)

### Backend
*   **Server**: Python FastAPI
*   **ASR Engine**: [Typhoon ASR](https://github.com/scb10x/typhoon-asr) (SCB10X) + NVIDIA NeMo Toolkit
*   **Processing**: PyTorch, NumPy, SoundFile
*   **Concurrency**: `asyncio` for WebSocket handling + `run_in_executor` for blocking model inference.

## 📦 Installation & Setup

### 1. Backend Setup (Python)
Ensure you have Python 3.10+ and CUDA installed (recommended for GPU acceleration).

```bash
# Create and activate virtual environment
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

# Install dependencies (see requirements.txt for full list)
pip install fastapi uvicorn websockets numpy torch soundfile librosa
# Note: typhoon-asr and nemo-toolkit installation might require specific steps depending on your OS/CUDA version.
```

**Running the Server:**
```bash
python server.py
# Server will start on http://localhost:8000
```

### 2. Frontend Setup (React)
```bash
# Install Node.js dependencies
npm install

# Run Development Server
npm run dev
# App will open at http://localhost:8080
```

## 🎬 Usage Guide

1.  **Start the System**: Ensure both `server.py` and `npm run dev` are running.
2.  **Open Control Panel**: Go to `http://localhost:8080`.
3.  **Select Audio Source**: Choose your microphone from the dropdown list.
4.  **Start Transcription**: Click **"Start transcription"**.
5.  **Customize Style**: Open "Caption Settings" to adjust text size, colors, or layout.
6.  **Connect to OBS**:
    *   Click the **"VMIX/OBS Link"** button to copy the URL.
    *   In OBS, create a **Browser Source**.
    *   Paste the URL (`http://localhost:8080/display`).
    *   Set Width/Height (e.g., 1920x200).
    *   **Important**: Enable "Refresh browser when scene becomes active" if needed.
    *   The background is transparent by default.

## ⚙️ Configuration Notes

*   **Silence Detection**: The server monitors audio energy (RMS). If silence persists for >3 seconds, the caption is cleared.
*   **Model Loading**: The model loads once at startup (`startup_event`). The first request might have a slight warmup delay.

## 📝 License
Internal project for **3PT Live Streaming**.
