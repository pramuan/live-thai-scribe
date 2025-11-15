import { useState } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioDevices } from '@/hooks/useAudioDevices';
import { CaptionDisplay } from '@/components/CaptionDisplay';
import { CaptionSettingsPanel } from '@/components/CaptionSettings';
import { TranscriptionSegment, CaptionSettings } from '@/types/transcription';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AudioDeviceSelector } from '@/components/AudioDeviceSelector';
import { VoiceActivityIndicator } from '@/components/VoiceActivityIndicator';
import { Mic, Square, Settings } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const Index = () => {
  const { toast } = useToast();
  const { isRecording, audioLevel, startRecording, stopRecording } = useAudioRecorder();
  const { devices, selectedDevice, setSelectedDevice } = useAudioDevices();

  const [segments, setSegments] = useState<TranscriptionSegment[]>([
    {
      id: '1',
      text: 'ยินดีต้อนรับสู่ระบบถ่ายทอดสดคำบรรยาย',
      translation: 'Welcome to Live Caption System',
      timestamp: Date.now(),
      isFinal: true,
    },
  ]);

  const [captionSettings, setCaptionSettings] = useState<CaptionSettings>({
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
  });

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleStartRecording = async () => {
    try {
      await startRecording(selectedDevice, async (blob) => {
        // TODO: Send audio blob to Typhoon ASR API
        // For now, we'll add a demo segment
        const demoSegment: TranscriptionSegment = {
          id: Date.now().toString(),
          text: 'กำลังบันทึกเสียง...',
          translation: 'Recording audio...',
          timestamp: Date.now(),
          isFinal: false,
        };
        
        setSegments((prev) => [...prev, demoSegment]);
      });

      toast({
        title: 'Recording Started',
        description: 'Live transcription is now active',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start recording. Please check microphone permissions.',
        variant: 'destructive',
      });
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    toast({
      title: 'Recording Stopped',
      description: 'Transcription has been stopped',
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6">
        <h1 className="text-xl font-semibold">Speech to Text - Live Transcribe</h1>
      </div>

      <div className="flex" style={{ height: 'calc(100vh - 4rem)' }}>
        {/* Left Panel - Settings */}
        <div className="w-[400px] bg-card border-r border-border p-4 space-y-4 overflow-y-auto">
          {/* Audio Input Device */}
          <AudioDeviceSelector
            devices={devices}
            selectedDevice={selectedDevice}
            onDeviceChange={setSelectedDevice}
            disabled={isRecording}
          />

          {/* Configuration Collapsible */}
          <Collapsible open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuration
                </span>
                <span className="text-xs text-muted-foreground">
                  {isConfigOpen ? 'Hide' : 'Show'}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <CaptionSettingsPanel
                settings={captionSettings}
                onChange={setCaptionSettings}
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Voice Activity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Voice Activity</Label>
              <span className="text-sm text-muted-foreground">
                {isRecording && audioLevel > 0.1 ? 'Active' : 'Inactive'}
              </span>
            </div>
            <VoiceActivityIndicator level={audioLevel} isActive={isRecording && audioLevel > 0.1} />
          </div>

          {/* Start Recording Button */}
          <div className="pt-2">
            {!isRecording ? (
              <Button
                onClick={handleStartRecording}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                <Mic className="mr-2 h-5 w-5" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={handleStopRecording}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                <Square className="mr-2 h-5 w-5" />
                Stop Recording
              </Button>
            )}
          </div>
        </div>

        {/* Right Panel - Caption Display */}
        <div className="flex-1 flex items-center justify-center p-8">
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
