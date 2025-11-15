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
  const bars = 40; // More bars for smoother wave
  
  const getBarHeight = (index: number) => {
    const baseHeight = 5;
    const maxHeight = 100;
    
    // Create wave spectrum frequency pattern
    const normalizedLevel = Math.min(level * 2, 1);
    
    // Create a smooth wave pattern across the spectrum
    // Lower frequencies on the left, higher on the right
    const frequency = (index / bars) * Math.PI * 4;
    const wave = Math.sin(frequency + Date.now() / 200) * 0.5 + 0.5;
    
    // Combine wave with audio level
    const heightMultiplier = wave * normalizedLevel;
    
    return baseHeight + (maxHeight - baseHeight) * heightMultiplier;
  };

  return (
    <div className={cn('flex items-end justify-center gap-0.5 h-32 w-full bg-card rounded-md p-2', className)}>
      {Array.from({ length: bars }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'flex-1 rounded-sm transition-all duration-100',
            isActive ? 'bg-primary' : 'bg-muted'
          )}
          style={{
            height: `${isActive ? getBarHeight(index) : 5}%`,
          }}
        />
      ))}
    </div>
  );
};
