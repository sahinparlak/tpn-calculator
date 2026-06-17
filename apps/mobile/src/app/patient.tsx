import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../components/ui/Button';
import { NumberField } from '../components/ui/NumberField';
import { Screen } from '../components/ui/Screen';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { ToggleRow } from '../components/ui/Toggle';
import { useStrings } from '../lib/i18n';
import { type FieldErrors, toPatientInput, usePatientStore } from '../store/patient';
import { useActiveStoredProfile } from '../store/profiles';

export default function PatientScreen() {
  const s = useStrings();
  const form = usePatientStore();
  const active = useActiveStoredProfile();
  const isBuiltin = active.source === 'builtin';
  const [errors, setErrors] = useState<FieldErrors>({});

  function onCalculate() {
    const result = toPatientInput(form, s.patient.errors);
    if ('errors' in result) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    router.push('/result');
  }

  return (
    <Screen>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="font-display text-2xl tracking-tight text-ink">{s.patient.title}</Text>
        <Pressable
          onPress={() => router.push('/profiles')}
          accessibilityRole="button"
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
        >
          <Text className="font-inter-medium text-sm text-accent-700">{s.common.profile} ›</Text>
        </Pressable>
      </View>

      {/* active profile chip */}
      <Pressable
        onPress={() => router.push('/profiles')}
        accessibilityRole="button"
        className="mb-5 flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
      >
        <View className="flex-1">
          <Text className="font-inter-semibold text-[11px] uppercase tracking-wide text-slate-400">
            {s.patient.activeProfile}
          </Text>
          <Text className="mt-0.5 font-inter-semibold text-[15px] text-ink">{active.profile.meta.name}</Text>
          <Text className={`mt-0.5 font-inter text-xs ${isBuiltin ? 'text-amber-700' : 'text-slate-400'}`}>
            {isBuiltin ? s.patient.profileNote : s.profiles.centerProfile}
          </Text>
        </View>
        <Text className="font-inter text-slate-300">›</Text>
      </Pressable>

      <NumberField
        label={s.patient.weight}
        hint="kg"
        unit="kg"
        decimal
        big
        value={form.weight}
        onChangeText={(t) => form.set({ weight: t })}
        error={errors.weight}
      />
      <NumberField
        label={s.patient.age}
        hint="days"
        unit="days"
        big
        value={form.age}
        onChangeText={(t) => form.set({ age: t })}
        error={errors.age}
      />

      <View className="mb-5">
        <Text className="mb-1.5 font-inter-semibold text-[13px] text-slate-600">{s.patient.lineType}</Text>
        <SegmentedControl
          value={form.line}
          onChange={(line) => form.set({ line })}
          options={[
            { label: s.patient.peripheral, value: 'peripheral' },
            { label: s.patient.central, value: 'central' },
          ]}
        />
        <Text className="mt-1.5 font-inter text-xs text-slate-400">{s.patient.lineHint}</Text>
      </View>

      <Text className="mb-3 font-inter-semibold text-[11px] uppercase tracking-wide text-slate-400">
        {s.patient.optional}
      </Text>

      <NumberField
        label={s.patient.gestationalAge}
        hint={s.patient.optionalTag}
        unit={s.patient.weeks}
        placeholder="—"
        value={form.gestationalAge}
        onChangeText={(t) => form.set({ gestationalAge: t })}
        error={errors.gestationalAge}
      />

      <ToggleRow
        label={s.patient.phototherapy}
        value={form.phototherapy}
        onValueChange={(v) => form.set({ phototherapy: v })}
      />
      <ToggleRow
        label={s.patient.radiantWarmer}
        value={form.radiantWarmer}
        onValueChange={(v) => form.set({ radiantWarmer: v })}
      />

      <View className="mb-6 mt-1">
        <NumberField
          label={s.patient.fluidRestriction}
          hint="%"
          unit="%"
          placeholder="0"
          value={form.fluidRestriction}
          onChangeText={(t) => form.set({ fluidRestriction: t })}
          error={errors.fluidRestriction}
        />
      </View>

      <Button label={s.common.calculate} onPress={onCalculate} />
    </Screen>
  );
}
