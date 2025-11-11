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
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Live Transcription & Translation
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Control Panel - Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ControlPanel
                isRecording={isRecording}
                audioLevel={audioLevel}
                devices={devices}
                selectedDevice={selectedDevice}
                onDeviceChange={setSelectedDevice}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
              />
            </div>

            <div className="lg:col-span-1">
              <Tabs defaultValue="settings" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="settings">Display</TabsTrigger>
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
                    <h3 className="font-semibold text-lg">การใช้งาน</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>ตั้งค่า API Key ของ Typhoon ASR</li>
                      <li>เลือกอุปกรณ์เสียงที่ต้องการ</li>
                      <li>กดปุ่ม Start เพื่อเริ่มบันทึกและถ่ายทอดสด</li>
                      <li>ใช้ Browser Source ใน OBS/VMIX เพื่อแสดงผล</li>
                    </ol>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Caption Display - Full Width */}
          <div className="w-full">
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg">
              <div className="bg-secondary px-6 py-3 border-b border-border">
                <h3 className="font-semibold">Live Caption Preview</h3>
              </div>
              <CaptionDisplay
                segments={segments}
                settings={captionSettings}
                className="min-h-[400px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
