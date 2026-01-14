import { useState, useEffect } from 'react';
import { useLocalASR } from '@/hooks/useLocalASR';
import { useAudioDevices } from '@/hooks/useAudioDevices';
import { CaptionDisplay } from '@/components/CaptionDisplay';
import { CaptionSettingsPanel } from '@/components/CaptionSettings';
import { TranscriptionSegment, CaptionSettings } from '@/types/transcription';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AudioDeviceSelector } from '@/components/AudioDeviceSelector';
import WaveformVisualizer from '@/components/WaveformVisualizer';
import { Mic, Square, Settings, ChevronDown, Copy, ExternalLink, Activity } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast as sonnerToast } from 'sonner';

const Index = () => {
  const { toast } = useToast();
  const {
    isRecording,
    transcript,
    partialTranscript,
    analyser,
    startRecording,
    stopRecording
  } = useLocalASR();
  const { devices, selectedDevice, setSelectedDevice } = useAudioDevices();

  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);

  useEffect(() => {
    // Poll for backend readiness
    const checkBackend = async () => {
      try {
        // Use relative path to work on any IP/Port
        const response = await fetch('/api/health');
        if (response.ok) {
          const data = await response.json();
          if (data.model_loaded) {
            sonnerToast.success("Application Typhoon ASR Model startup complete.");
            return true; // Stop polling
          }
        }
      } catch (error) {
        // Ignore errors, keep polling
      }
      return false;
    };

    const pollInterval = setInterval(async () => {
      const isReady = await checkBackend();
      if (isReady) {
        clearInterval(pollInterval);
      }
    }, 1000);

    // Initial check immediately
    checkBackend().then(isReady => {
      if (isReady) clearInterval(pollInterval);
    });

    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    // Update segments when transcript changes
    const newSegments: TranscriptionSegment[] = [];

    if (transcript.trim()) {
      newSegments.push({
        id: 'final',
        text: transcript,
        timestamp: Date.now(),
        isFinal: true,
      });
    }

    if (partialTranscript.trim()) {
      newSegments.push({
        id: 'partial',
        text: partialTranscript,
        timestamp: Date.now(),
        isFinal: false,
      });
    }

    setSegments(newSegments);
  }, [transcript, partialTranscript]);

  const [captionSettings, setCaptionSettings] = useState<CaptionSettings>(() => {
    const saved = localStorage.getItem('captionSettings');
    return saved ? JSON.parse(saved) : {
      fontSize: 32,
      lineHeight: 1.5,
      maxLines: 3,
      showOriginal: true,
      showTranslation: false,
      layout: 'stacked',
      fontFamily: "'Sarabun', sans-serif", // Changed to match font in Display
      textAlign: 'center',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      translationColor: '#1e40af',
      apiKey: '',
    };
  });

  useEffect(() => {
    localStorage.setItem('captionSettings', JSON.stringify(captionSettings));
  }, [captionSettings]);

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const copyObsLink = () => {
    const link = `${window.location.origin}/display`;
    navigator.clipboard.writeText(link);
    sonnerToast.success('OBS Link copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6">
        <h1 className="text-xl font-semibold">Thai STT - Typhoon ASR Real-time</h1>
        <Button variant="outline" size="sm" onClick={copyObsLink} className="gap-2">
          <Copy className="h-4 w-4" />
          VMIX/OBS Link
        </Button>
      </div>

      <div className="flex" style={{ height: 'calc(100vh - 4rem)' }}>
        {/* Left Panel - Settings */}
        {/* Left Panel - Settings */}
        <div className="w-[400px] bg-card border-r border-border flex flex-col">
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Audio Input Device */}
            <AudioDeviceSelector
              devices={devices}
              selectedDevice={selectedDevice}
              onDeviceChange={setSelectedDevice}
              disabled={isRecording}
            />

            {/* Waveform Visualization */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Activity className="h-4 w-4 text-primary" />
                Audio Waveform
              </Label>
              <WaveformVisualizer analyser={analyser} />
            </div>

            {/* Configuration Collapsible */}
            <Collapsible open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Caption Settings
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isConfigOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <CaptionSettingsPanel
                  settings={captionSettings}
                  onChange={setCaptionSettings}
                />
              </CollapsibleContent>
            </Collapsible>

            {/* Start Recording Button */}
            <div className="pt-2">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  Start transcription
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  <Square className="mr-2 h-5 w-5" />
                  Stop Recording
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground pt-4 p-2 bg-muted/50 rounded-lg">
              <p className="font-semibold mb-1">How to use with OBS:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click "VMIX/OBS Link" above</li>
                <li>In OBS, add a "Browser Source"</li>
                <li>Paste the link and set width/height</li>
                <li>Toggle "Transparent background" in source settings</li>
              </ol>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 text-center text-xs text-muted-foreground bg-muted/20 border-t border-border font-medium">
            Powered by 3PT Live Streaming
          </div>
        </div>

        {/* Right Panel - Caption Display */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <CaptionDisplay
            segments={segments}
            settings={captionSettings}
            className="w-full max-w-4xl"
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
