import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { cn } from '../../lib/cn';
import { NumberField } from './NumberField';

/** Display a numeric value as editable text; non-finite (unset) shows empty. */
function numToStr(value: number): string {
  return Number.isFinite(value) ? String(value) : '';
}

/** Parse field text to a number; empty/invalid yields NaN so validation flags it. */
function parseNum(text: string): number {
  if (text.trim() === '') return Number.NaN;
  return Number(text);
}

interface EditNumProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  unit?: string;
  hint?: string;
}

/**
 * Numeric editor field. Keeps a local string while typing (so "1." or a cleared
 * field survive) and propagates the parsed number up; the parent stores numbers
 * and validates them.
 */
export function EditNum({ label, value, onChange, error, unit, hint }: EditNumProps) {
  const [text, setText] = useState(() => numToStr(value));
  return (
    <NumberField
      label={label}
      hint={hint}
      unit={unit}
      decimal
      value={text}
      error={error}
      onChangeText={(t) => {
        setText(t);
        onChange(parseNum(t));
      }}
    />
  );
}

interface EditTextProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  hint?: string;
}

/** Labeled free-text editor field with an inline error. */
export function EditText({ label, value, onChange, error, placeholder, hint }: EditTextProps) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 font-inter-semibold text-[13px] text-slate-600">
        {label}
        {hint ? <Text className="font-inter text-slate-400"> ({hint})</Text> : null}
      </Text>
      <View className={cn('rounded-2xl border bg-white px-4 py-3', error ? 'border-red-300' : 'border-slate-200')}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#d6d1c6"
          accessibilityLabel={[label, error].filter(Boolean).join(', ')}
          className="font-inter-semibold text-lg text-ink"
        />
      </View>
      {error ? <Text className="mt-1 font-inter text-xs text-red-600">{error}</Text> : null}
    </View>
  );
}
