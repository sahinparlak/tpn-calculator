import { Pressable, Text, View } from 'react-native';
import { cn } from '../../lib/cn';

interface Option<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Two-or-more option segmented control on a warm track. */
export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View className="flex-row rounded-2xl bg-slate-200/70 p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={cn('flex-1 items-center rounded-xl py-2.5', active && 'bg-white')}
          >
            <Text className={cn('font-inter-semibold text-sm', active ? 'text-accent-700' : 'text-slate-500')}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
