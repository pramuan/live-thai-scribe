import { useState } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioDevices } from '@/hooks/useAudioDevices';
import { CaptionDisplay } from '@/components/CaptionDisplay';
import { CaptionSettingsPanel } from '@/components/CaptionSettings';
import { TranscriptionSegment, CaptionSettings } from '@/types/transcription';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Left Sidebar - Configuration */}
      <div className="w-[400px] bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Configuration</h2>
        </div>
        
        <Tabs defaultValue="transcription" className="flex-1 flex flex-col">
          <TabsList className="mx-6 mt-4">
            <TabsTrigger value="transcription" className="flex-1">Transcription</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transcription" className="flex-1 flex flex-col mt-0">
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* API Key */}
              <div className="space-y-2">
                <Label>Model</Label>
                <Select defaultValue="typhoon-asr-realtime">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="typhoon-asr-realtime">typhoon-asr-realtime</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mode Tabs */}
              <div className="space-y-2">
                <Tabs defaultValue="realtime">
                  <TabsList className="w-full">
                    <TabsTrigger value="realtime" className="flex-1">Realtime</TabsTrigger>
                    <TabsTrigger value="upload" className="flex-1">Upload</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* API Key Input */}
              <div className="space-y-2">
                <Label htmlFor="api-key">Typhoon ASR API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="ใส่ API Key ของคุณ"
                  value={captionSettings.apiKey}
                  onChange={(e) => setCaptionSettings({ ...captionSettings, apiKey: e.target.value })}
                />
              </div>

              {/* Audio Input Device */}
              <div className="space-y-2">
                <Label>Audio Input Device</Label>
                <AudioDeviceSelector
                  devices={devices}
                  selectedDevice={selectedDevice}
                  onDeviceChange={setSelectedDevice}
                  disabled={isRecording}
                />
              </div>

              {/* Voice Activity */}
              <div className="space-y-2">
                <Label>Voice Activity</Label>
                <VoiceActivityIndicator level={audioLevel} isActive={isRecording && audioLevel > 0.1} />
              </div>

              {/* Time Remaining */}
              <div className="text-sm text-muted-foreground">
                Time Remaining: 5:00
              </div>
            </div>

            {/* Start Recording Button - Fixed at bottom */}
            <div className="p-6 border-t border-border">
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

          <TabsContent value="settings" className="flex-1 mt-0 overflow-y-auto">
            <div className="p-6">
              <CaptionSettingsPanel
                settings={captionSettings}
                onChange={setCaptionSettings}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Side - Response */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Response</h2>
        </div>
        <div className="flex-1">
          <CaptionDisplay
            segments={segments}
            settings={captionSettings}
            className="min-h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
