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
    </Card>
  );
};
