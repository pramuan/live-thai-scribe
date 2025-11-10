import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AudioDeviceSelector } from './AudioDeviceSelector';
import { VoiceActivityIndicator } from './VoiceActivityIndicator';
import { Play, Square, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ControlPanelProps {
  isRecording: boolean;
  audioLevel: number;
  devices: MediaDeviceInfo[];
  selectedDevice: string;
  onDeviceChange: (deviceId: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export const ControlPanel = ({
  isRecording,
  audioLevel,
  devices,
  selectedDevice,
  onDeviceChange,
  onStartRecording,
  onStopRecording,
}: ControlPanelProps) => {
  return (
    <Card className="p-6 space-y-6 bg-card border-border">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Live Transcription Control</h2>
        {isRecording && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-live/10 border border-live">
            <Radio className="h-4 w-4 text-live animate-pulse" />
            <span className="text-sm font-medium text-live">LIVE</span>
          </div>
        )}
      </div>

      <AudioDeviceSelector
        devices={devices}
        selectedDevice={selectedDevice}
        onDeviceChange={onDeviceChange}
        disabled={isRecording}
      />

      <div className="space-y-2">
        <div className="text-sm font-medium">Voice Activity</div>
        <VoiceActivityIndicator level={audioLevel} isActive={isRecording && audioLevel > 0.1} />
      </div>

      <div className="flex gap-3">
        {!isRecording ? (
          <Button
            onClick={onStartRecording}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Transcription
          </Button>
        ) : (
          <Button
            onClick={onStopRecording}
            variant="destructive"
            className="flex-1"
            size="lg"
          >
            <Square className="mr-2 h-5 w-5" />
            Stop Transcription
          </Button>
        )}
      </div>

      <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-border">
        <p>• For OBS/VMIX: Use Browser Source with the caption display URL</p>
        <p>• Powered by Typhoon ASR Real-Time</p>
      </div>
    </Card>
  );
};
