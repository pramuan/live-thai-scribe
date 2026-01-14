import React, { useState, useEffect } from 'react';
import { CaptionSettings, TranscriptionSegment } from '@/types/transcription';
import { CaptionDisplay } from '@/components/CaptionDisplay';

const Display = () => {
    const [transcript, setTranscript] = useState('');
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [settings, setSettings] = useState<CaptionSettings | null>(() => {
        const saved = localStorage.getItem('captionSettings');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('captionSettings');
            if (saved) {
                setSettings(JSON.parse(saved));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        let socket: WebSocket | null = null;
        let reconnectTimeout: NodeJS.Timeout;

        const connect = () => {
            socket = new WebSocket('ws://localhost:8000/ws');

            socket.onopen = () => {
                console.log('Connected to WebSocket');
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'transcript') {
                        setTranscript(data.text);
                    } else if (data.type === 'transcript_clear') { // Handled by sending empty string in existing logic
                        setTranscript("");
                    }
                } catch (e) {
                    console.error('Error parsing message', e);
                }
            };

            socket.onclose = () => {
                console.log('WebSocket closed, reconnecting in 3s...');
                socket = null;
                reconnectTimeout = setTimeout(connect, 3000);
            };

            socket.onerror = (error) => {
                console.log('WebSocket connection error, will retry...');
            };

            setWs(socket);
        };

        connect();

        return () => {
            if (socket) socket.close();
            clearTimeout(reconnectTimeout);
        };
    }, []);

    // Construct segments from transcript for CaptionDisplay compatibility
    const segments: TranscriptionSegment[] = transcript ? [{
        id: 'display-segment',
        text: transcript,
        timestamp: Date.now(),
        isFinal: true
    }] : [];

    // Fallback settings if localStorage is empty (should match Index default)
    const activeSettings: CaptionSettings = settings || {
        fontSize: 32,
        lineHeight: 1.5,
        maxLines: 3,
        showOriginal: true,
        showTranslation: false,
        layout: 'stacked',
        fontFamily: "'Sarabun', sans-serif",
        textAlign: 'center',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        translationColor: '#1e40af',
        apiKey: '',
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-end pb-20 px-10" style={{ backgroundColor: 'transparent' }}>
            <CaptionDisplay
                segments={segments}
                settings={activeSettings}
                className="w-full max-w-4xl"
                showPlaceholder={false}
            />
        </div>
    );
};

export default Display;
