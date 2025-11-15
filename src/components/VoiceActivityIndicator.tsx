import { cn } from '@/lib/utils';

interface VoiceActivityIndicatorProps {
  level: number;
  isActive: boolean;
  className?: string;
}

export const VoiceActivityIndicator = ({
  level,
  isActive,
  className,
}: VoiceActivityIndicatorProps) => {
  const bars = 20;
  
  const getBarHeight = (index: number) => {
    const baseHeight = 10;
    const maxHeight = 100;
    
    // Create wave pattern with more bars
    const normalizedLevel = Math.min(level * 2, 1);
    const centerBar = Math.floor(bars / 2);
    const distance = Math.abs(index - centerBar);
    const heightMultiplier = 1 - (distance * 0.05);
    
    return baseHeight + (maxHeight - baseHeight) * normalizedLevel * heightMultiplier;
  };

  return (
    <div className={cn('flex items-end justify-center gap-1 h-32 w-full', className)}>
      {Array.from({ length: bars }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'flex-1 rounded-full transition-all duration-75',
            isActive ? 'bg-primary' : 'bg-muted'
          )}
          style={{
            height: `${isActive ? getBarHeight(index) : 10}%`,
          }}
        />
      ))}
    </div>
  );
};
