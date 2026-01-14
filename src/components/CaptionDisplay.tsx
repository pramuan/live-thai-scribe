import { TranscriptionSegment, CaptionSettings } from '@/types/transcription';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface CaptionDisplayProps {
  segments: TranscriptionSegment[];
  settings: CaptionSettings;
  className?: string;
  showPlaceholder?: boolean;
}

export const CaptionDisplay = ({
  segments,
  settings,
  className,
  showPlaceholder = true
}: CaptionDisplayProps) => {
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

  const PADDING_Y = 48; // p-6 = 24px * 2
  const contentHeight = settings.fontSize * settings.lineHeight * settings.maxLines;
  const calculatedMaxHeight = contentHeight + PADDING_Y;

  return (
    <div
      ref={containerRef}
      // Change overflow-auto to overflow-hidden to enforce strict visual max lines
      // We rely on the useEffect scrolling to bottom to show the latest text
      className={cn('caption-container overflow-hidden', className)}
      style={{
        fontFamily: settings.fontFamily,
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineHeight,
        textAlign: settings.textAlign,
        backgroundColor: settings.backgroundColor,
        height: `${calculatedMaxHeight}px`, // Enforce fixed height
      }}
    >
      <div className="space-y-4 p-6">
        {visibleSegments.length === 0 && showPlaceholder ? (
          <div className="text-gray-400 text-lg font-normal text-center py-10">
            Waiting for transcription...
          </div>
        ) : (
          visibleSegments.map((segment) => (
            <div
              key={segment.id}
              className={cn(
                'caption-segment transition-opacity duration-300',
                segment.isFinal ? 'opacity-100' : 'opacity-75'
              )}
            >
              {renderSegment(segment)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
