import { Pressable, Text, View } from 'react-native';
import { cn } from '../../lib/cn';

interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/** Labeled row with a pill switch (navy when on). */
export function ToggleRow({ label, value, onValueChange }: ToggleRowProps) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      className="mb-3 flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5"
    >
      <Text className="font-inter-medium text-[15px] text-slate-700">{label}</Text>
      <View className={cn('h-7 w-12 justify-center rounded-full px-0.5', value ? 'bg-accent-600' : 'bg-slate-300')}>
        <View className={cn('h-6 w-6 rounded-full bg-white shadow', value && 'self-end')} />
      </View>
    </Pressable>
  );
}
