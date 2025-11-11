import { TranscriptionSegment, CaptionSettings } from '@/types/transcription';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface CaptionDisplayProps {
  segments: TranscriptionSegment[];
  settings: CaptionSettings;
  className?: string;
}

export const CaptionDisplay = ({ segments, settings, className }: CaptionDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [segments]);

  const renderSegment = (segment: TranscriptionSegment) => {
    const { layout, showOriginal, showTranslation } = settings;

    if (layout === 'translation-only' && segment.translation) {
      return (
        <div className="caption-translation" style={{ color: settings.translationColor }}>
          {segment.translation}
        </div>
      );
    }

    if (layout === 'original-only') {
      return (
        <div className="caption-original" style={{ color: settings.textColor }}>
          {segment.text}
        </div>
      );
    }

    if (layout === 'stacked') {
      return (
        <>
          {showOriginal && (
            <div className="caption-original" style={{ color: settings.textColor }}>
              {segment.text}
            </div>
          )}
          {showTranslation && segment.translation && (
            <div className="caption-translation mt-2" style={{ color: settings.translationColor }}>
              {segment.translation}
            </div>
          )}
        </>
      );
    }

    if (layout === 'side-by-side') {
      return (
        <div className="grid grid-cols-2 gap-4">
          {showOriginal && (
            <div className="caption-original" style={{ color: settings.textColor }}>
              {segment.text}
            </div>
          )}
          {showTranslation && segment.translation && (
            <div className="caption-translation" style={{ color: settings.translationColor }}>
              {segment.translation}
            </div>
          )}
        </div>
      );
    }
  };

  const visibleSegments = segments.slice(-settings.maxLines);

  return (
    <div
      ref={containerRef}
      className={cn('caption-container overflow-auto', className)}
      style={{
        fontFamily: settings.fontFamily,
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineHeight,
        textAlign: settings.textAlign,
        backgroundColor: settings.backgroundColor,
      }}
    >
      <div className="space-y-4 p-6">
        {visibleSegments.map((segment) => (
          <div
            key={segment.id}
            className={cn(
              'caption-segment transition-opacity duration-300',
              segment.isFinal ? 'opacity-100' : 'opacity-75'
            )}
          >
            {renderSegment(segment)}
          </div>
        ))}
      </div>
    </div>
  );
};
