import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon, type IconName } from '../components/ui/Icon';
import { Screen } from '../components/ui/Screen';
import { useStrings } from '../lib/i18n';

const ACCEPTED_KEY = 'tpn.disclaimerAccepted';

function TrustCell({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View className="flex-1 items-center gap-1.5 px-2 py-3.5">
      <Icon name={icon} />
      <Text className="font-inter-medium text-[11px] text-slate-600">{label}</Text>
    </View>
  );
}

export default function DisclaimerScreen() {
  const s = useStrings();
  const [checked, setChecked] = useState(false);
  const [ready, setReady] = useState(false);

  // Accept-once gate: if already accepted, skip straight to the patient form.
  useEffect(() => {
    AsyncStorage.getItem(ACCEPTED_KEY).then((v) => {
      if (v === 'true') router.replace('/patient');
      else setReady(true);
    });
  }, []);

  async function accept() {
    await AsyncStorage.setItem(ACCEPTED_KEY, 'true');
    router.replace('/patient');
  }

  if (!ready) return <View className="flex-1 bg-ground" />;

  return (
    <Screen scroll={false}>
      <View className="mb-10 flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-xl bg-accent-600">
          <Text className="font-inter-bold text-sm text-white">T</Text>
        </View>
        <Text className="font-inter-semibold text-sm tracking-tight text-slate-700">{s.app.name}</Text>
      </View>

      <View className="flex-1">
        <Text className="font-display text-[28px] leading-tight tracking-tight text-ink">{s.disclaimer.title}</Text>
        <Text className="mt-3 font-inter text-[16px] leading-relaxed text-slate-600">{s.disclaimer.intro}</Text>

        <View className="mt-5 flex-row items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <TrustCell icon="book" label={s.disclaimer.trust.guideline} />
          <View className="w-px bg-slate-100" />
          <TrustCell icon="link" label={s.disclaimer.trust.traceable} />
          <View className="w-px bg-slate-100" />
          <TrustCell icon="shield" label={s.disclaimer.trust.safety} />
        </View>

        <View className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <Text className="font-inter text-[14px] leading-relaxed text-amber-800">{s.disclaimer.profileNote}</Text>
        </View>
      </View>

      <View className="mt-8">
        <View className="flex-row items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5">
          <Pressable
            onPress={() => setChecked((c) => !c)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            className={`mt-0.5 h-5 w-5 items-center justify-center rounded-md border ${
              checked ? 'border-accent-600 bg-accent-600' : 'border-slate-300 bg-white'
            }`}
          >
            {checked ? <Icon name="check" size={13} color="#ffffff" strokeWidth={2.5} /> : null}
          </Pressable>
          <Text className="flex-1 font-inter-medium text-[14px] leading-snug text-slate-700">
            {s.disclaimer.consentBefore}
            <Text onPress={() => router.push('/terms')} className="font-inter-semibold text-accent-700 underline">
              {s.disclaimer.consentLink}
            </Text>
            {s.disclaimer.consentAfter}
          </Text>
        </View>

        <Pressable
          onPress={accept}
          disabled={!checked}
          accessibilityRole="button"
          className={`mt-3 w-full items-center rounded-2xl py-4 active:opacity-90 ${
            checked ? 'bg-accent-600' : 'bg-slate-300'
          }`}
        >
          <Text className="font-inter-semibold text-[15px] text-white">{s.common.continue}</Text>
        </Pressable>

        <Text className="mt-3 text-center font-inter text-xs text-slate-400">{s.disclaimer.footnote}</Text>
      </View>
    </Screen>
  );
}
