import { CaptionSettings } from '@/types/transcription';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface CaptionSettingsProps {
  settings: CaptionSettings;
  onChange: (settings: CaptionSettings) => void;
}

export const CaptionSettingsPanel = ({ settings, onChange }: CaptionSettingsProps) => {
  const updateSetting = <K extends keyof CaptionSettings>(
    key: K,
    value: CaptionSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <Card className="p-6 space-y-6 bg-card border-border">
      <div>
        <h3 className="text-lg font-semibold mb-4">ตั้งค่า</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Typhoon ASR API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="ใส่ API Key ของคุณ"
              value={settings.apiKey}
              onChange={(e) => updateSetting('apiKey', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Layout</Label>
            <Select
              value={settings.layout}
              onValueChange={(value) => updateSetting('layout', value as CaptionSettings['layout'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stacked">Stacked (Original / Translation)</SelectItem>
                <SelectItem value="side-by-side">Side by Side</SelectItem>
                <SelectItem value="original-only">Original Only</SelectItem>
                <SelectItem value="translation-only">Translation Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Font Size: {settings.fontSize}px</Label>
            <Slider
              value={[settings.fontSize]}
              onValueChange={([value]) => updateSetting('fontSize', value)}
              min={16}
              max={72}
              step={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Line Height: {settings.lineHeight.toFixed(1)}</Label>
            <Slider
              value={[settings.lineHeight]}
              onValueChange={([value]) => updateSetting('lineHeight', value)}
              min={1}
              max={2.5}
              step={0.1}
            />
          </div>

          <div className="space-y-2">
            <Label>Max Lines: {settings.maxLines}</Label>
            <Slider
              value={[settings.maxLines]}
              onValueChange={([value]) => updateSetting('maxLines', value)}
              min={1}
              max={10}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Text Alignment</Label>
            <Select
              value={settings.textAlign}
              onValueChange={(value) => updateSetting('textAlign', value as CaptionSettings['textAlign'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-original">Show Original Text</Label>
            <Switch
              id="show-original"
              checked={settings.showOriginal}
              onCheckedChange={(checked) => updateSetting('showOriginal', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-translation">Show Translation</Label>
            <Switch
              id="show-translation"
              checked={settings.showTranslation}
              onCheckedChange={(checked) => updateSetting('showTranslation', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select
              value={settings.fontFamily}
              onValueChange={(value) => updateSetting('fontFamily', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system-ui, sans-serif">System (Default)</SelectItem>
                <SelectItem value="'Sarabun', sans-serif">Sarabun (Thai)</SelectItem>
                <SelectItem value="'Prompt', sans-serif">Prompt (Thai)</SelectItem>
                <SelectItem value="'Noto Sans Thai', sans-serif">Noto Sans Thai</SelectItem>
                <SelectItem value="monospace">Monospace</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
};
