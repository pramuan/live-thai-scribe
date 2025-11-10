export interface TranscriptionSegment {
  id: string;
  text: string;
  translation?: string;
  timestamp: number;
  duration?: number;
  isFinal: boolean;
}

export interface CaptionSettings {
  fontSize: number;
  lineHeight: number;
  maxLines: number;
  showOriginal: boolean;
  showTranslation: boolean;
  layout: 'stacked' | 'side-by-side' | 'translation-only' | 'original-only';
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  backgroundColor: string;
  textColor: string;
  translationColor: string;
}

export interface AudioSettings {
  deviceId: string;
  voiceActivity: boolean;
  responseType: 'partial' | 'final' | 'both';
}
