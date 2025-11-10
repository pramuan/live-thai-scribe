import { useState } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioDevices } from '@/hooks/useAudioDevices';
import { ControlPanel } from '@/components/ControlPanel';
import { CaptionDisplay } from '@/components/CaptionDisplay';
import { CaptionSettingsPanel } from '@/components/CaptionSettings';
import { TranscriptionSegment, CaptionSettings } from '@/types/transcription';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

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
    showTranslation: true,
    layout: 'stacked',
    fontFamily: "'Sarabun', sans-serif",
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    textColor: '#ffffff',
    translationColor: '#4ade80',
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
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Live Transcription & Translation
          </h1>
          <p className="text-muted-foreground">
            Professional live caption system for broadcasting and streaming
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <ControlPanel
              isRecording={isRecording}
              audioLevel={audioLevel}
              devices={devices}
              selectedDevice={selectedDevice}
              onDeviceChange={setSelectedDevice}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
            />

            <Tabs defaultValue="settings" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="settings">Display Settings</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>
              <TabsContent value="settings">
                <CaptionSettingsPanel
                  settings={captionSettings}
                  onChange={setCaptionSettings}
                />
              </TabsContent>
              <TabsContent value="info">
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg">How to Use with OBS/VMIX</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Start transcription from the control panel</li>
                    <li>Copy the browser URL for caption display</li>
                    <li>In OBS/VMIX, add a Browser Source</li>
                    <li>Paste the URL and set dimensions</li>
                    <li>Position the caption overlay on your stream</li>
                  </ol>
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Powered by Typhoon ASR Real-Time - Thai speech recognition
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="bg-secondary px-6 py-3 border-b border-border">
                <h3 className="font-semibold">Live Caption Preview</h3>
              </div>
              <CaptionDisplay
                segments={segments}
                settings={captionSettings}
                className="min-h-[600px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
