import { Text, TextInput, View } from 'react-native';
import { cn } from '../../lib/cn';

interface NumberFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  /** Muted parenthetical after the label, e.g. "kg" or "optional". */
  hint?: string;
  /** Suffix shown inside the field, e.g. "kg". */
  unit?: string;
  placeholder?: string;
  error?: string;
  decimal?: boolean;
  /** Large display (weight/age) vs. regular (optional fields). */
  big?: boolean;
}

/** Labeled numeric input with a unit suffix and inline error. */
export function NumberField({
  label,
  value,
  onChangeText,
  hint,
  unit,
  placeholder,
  error,
  decimal,
  big,
}: NumberFieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 font-inter-semibold text-[13px] text-slate-600">
        {label}
        {hint ? <Text className="font-inter text-slate-400"> ({hint})</Text> : null}
      </Text>
      <View
        className={cn(
          'flex-row items-center rounded-2xl border bg-white px-4 py-3',
          error ? 'border-red-300' : 'border-slate-200',
        )}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#d6d1c6"
          keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
          accessibilityLabel={[label, hint, unit ? `in ${unit}` : null, error].filter(Boolean).join(', ')}
          className={cn('flex-1 font-inter-semibold text-ink', big ? 'text-2xl' : 'text-lg')}
        />
        {unit ? <Text className="font-inter-medium text-sm text-slate-400">{unit}</Text> : null}
      </View>
      {error ? <Text className="mt-1 font-inter text-xs text-red-600">{error}</Text> : null}
    </View>
  );
}
