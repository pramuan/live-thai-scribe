import { useState } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioDevices } from '@/hooks/useAudioDevices';
import { CaptionDisplay } from '@/components/CaptionDisplay';
import { CaptionSettingsPanel } from '@/components/CaptionSettings';
import { TranscriptionSegment, CaptionSettings } from '@/types/transcription';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AudioDeviceSelector } from '@/components/AudioDeviceSelector';
import { VoiceActivityIndicator } from '@/components/VoiceActivityIndicator';
import { Mic, Square } from 'lucide-react';

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
        <div className="w-[360px] bg-card border-r border-border flex flex-col">
          <Tabs defaultValue="transcription" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-4">
              <TabsTrigger value="transcription" className="flex-1">Transcription</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
            </TabsList>
          <TabsContent value="transcription" className="flex-1 flex flex-col mt-0">
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {/* Audio Input Device */}
              <AudioDeviceSelector
                devices={devices}
                selectedDevice={selectedDevice}
                onDeviceChange={setSelectedDevice}
                disabled={isRecording}
              />

              {/* Voice Activity */}
              <div className="space-y-2">
                <Label>Voice Activity</Label>
                <VoiceActivityIndicator level={audioLevel} isActive={isRecording && audioLevel > 0.1} />
              </div>
            </div>

            {/* Start Recording Button - Fixed at bottom */}
            <div className="p-4 border-t border-border">
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
          </TabsContent>
          <TabsContent value="settings" className="flex-1 mt-0">
            <div className="p-4 h-full overflow-y-auto">
              <CaptionSettingsPanel
                settings={captionSettings}
                onChange={setCaptionSettings}
              />
            </div>
          </TabsContent>
        </Tabs>
        </div>

        {/* Right Panel - Caption Display */}
        <div className="flex-1 flex flex-col">
          <CaptionDisplay
            segments={segments}
            settings={captionSettings}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
