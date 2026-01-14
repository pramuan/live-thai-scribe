import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export const useLocalASR = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [partialTranscript, setPartialTranscript] = useState('');
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startRecording = useCallback(async () => {
        try {
            const socket = new WebSocket('ws://localhost:8000/ws');
            wsRef.current = socket;

            socket.onopen = async () => {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;

                const audioContext = new AudioContext({ sampleRate: 16000 });
                audioContextRef.current = audioContext;

                const source = audioContext.createMediaStreamSource(stream);
                const analyserNode = audioContext.createAnalyser();
                analyserNode.fftSize = 256;
                setAnalyser(analyserNode);
                source.connect(analyserNode);

                // Add AudioWorklet module
                try {
                    await audioContext.audioWorklet.addModule('/audio-processor.js');
                } catch (e) {
                    console.error("Failed to load audio-processor.js", e);
                    throw new Error("Failed to load audio processor worklet");
                }

                const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');
                processorRef.current = workletNode as unknown as ScriptProcessorNode; // Type casting for compatibility

                source.connect(workletNode);
                workletNode.connect(audioContext.destination);

                workletNode.port.onmessage = (e) => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(e.data);
                    }
                };

                setIsRecording(true);
                toast.success('Started recording locally');
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'partial') {
                    setPartialTranscript(data.text);
                } else if (data.type === 'transcript') {
                    setTranscript(data.text);
                    setPartialTranscript('');
                }
            };

            socket.onclose = () => {
                stopRecording();
            };

            socket.onerror = (error) => {
                console.error('WebSocket Error:', error);
                toast.error('Could not connect to local ASR server. Make sure server.py is running.');
                stopRecording();
            };

        } catch (err) {
            console.error('Failed to start recording:', err);
            toast.error('Microphone access denied or connection failed');
        }
    }, []);

    const stopRecording = useCallback(() => {
        setIsRecording(false);
        if (wsRef.current) wsRef.current.close();
        if (processorRef.current) processorRef.current.disconnect();
        if (audioContextRef.current) audioContextRef.current.close();
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());

        wsRef.current = null;
        processorRef.current = null;
        audioContextRef.current = null;
        streamRef.current = null;
        setAnalyser(null);
    }, []);

    return {
        isRecording,
        transcript,
        partialTranscript,
        analyser,
        startRecording,
        stopRecording
    };
};
