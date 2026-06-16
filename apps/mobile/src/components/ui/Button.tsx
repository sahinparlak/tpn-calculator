import { Pressable, Text } from 'react-native';
import { cn } from '../../lib/cn';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
}

/** Primary navy action button. */
export function Button({ label, onPress, disabled, className }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className={cn(
        'w-full items-center rounded-2xl py-4 active:opacity-90',
        disabled ? 'bg-slate-300' : 'bg-accent-600',
        className,
      )}
    >
      <Text className="font-inter-semibold text-[15px] text-white">{label}</Text>
    </Pressable>
  );
}
