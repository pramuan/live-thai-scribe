import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Mic } from 'lucide-react';

interface AudioDeviceSelectorProps {
  devices: MediaDeviceInfo[];
  selectedDevice: string;
  onDeviceChange: (deviceId: string) => void;
  disabled?: boolean;
}

export const AudioDeviceSelector = ({
  devices,
  selectedDevice,
  onDeviceChange,
  disabled,
}: AudioDeviceSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Mic className="h-4 w-4 text-primary" />
        Audio Input Device
      </Label>
      <Select value={selectedDevice} onValueChange={onDeviceChange} disabled={disabled}>
        <SelectTrigger className="bg-secondary border-border">
          <SelectValue placeholder="Select microphone" />
        </SelectTrigger>
        <SelectContent>
          {devices.map((device) => (
            <SelectItem key={device.deviceId} value={device.deviceId}>
              {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
