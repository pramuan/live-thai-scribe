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
  const getBarHeight = (index: number) => {
    const baseHeight = 20;
    const maxHeight = 100;
    const bars = 5;
    
    // Create wave pattern
    const normalizedLevel = Math.min(level * 1.5, 1);
    const centerBar = Math.floor(bars / 2);
    const distance = Math.abs(index - centerBar);
    const heightMultiplier = 1 - (distance * 0.2);
    
    return baseHeight + (maxHeight - baseHeight) * normalizedLevel * heightMultiplier;
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-end gap-1 h-[100px]">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={cn(
              'w-2 rounded-full transition-all duration-100',
              isActive ? 'bg-active' : 'bg-muted'
            )}
            style={{
              height: `${isActive ? getBarHeight(index) : 20}%`,
            }}
          />
        ))}
      </div>
      <div className="text-sm text-muted-foreground">
        {isActive ? 'Active' : 'Inactive'}
      </div>
    </div>
  );
};
