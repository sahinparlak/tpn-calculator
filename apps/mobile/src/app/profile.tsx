import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Card } from '../components/ui/Card';
import { Screen } from '../components/ui/Screen';
import { useStrings } from '../lib/i18n';
import { activeProfile, provenanceDosing } from '../lib/profile';

export default function ProfileScreen() {
  const s = useStrings();
  const meta = activeProfile.meta;

  return (
    <Screen>
      <View className="mb-4 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text className="font-inter-medium text-sm text-accent-700">‹ {s.common.back}</Text>
        </Pressable>
        <Text className="font-display text-xl tracking-tight text-ink">{s.profile.title}</Text>
      </View>

      <Card className="p-5">
        <Text className="font-display text-xl tracking-tight text-ink">ESPGHAN 2018 Reference</Text>
        <Text className="font-inter text-[13px] text-slate-500">{s.profile.subtitle}</Text>
        <View className="mt-3 self-start rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
          <Text className="font-inter-semibold text-[12px] text-amber-700">{s.profile.tag}</Text>
        </View>
        <View className="mt-4 border-t border-slate-100 pt-4">
          <Row k={s.profile.version} v={meta.version} />
          <Row k={s.profile.lastReviewed} v={meta.lastReviewed} />
          <Row k={s.profile.reviewedBy} v={meta.reviewedBy} />
        </View>
      </Card>

      <Text className="mb-2 mt-5 font-inter-semibold text-[11px] uppercase tracking-wide text-slate-400">
        {s.profile.dosingTitle}
      </Text>
      <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {provenanceDosing.map((d, i) => (
          <View key={d.label} className={`flex-row items-center px-3 py-2 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
            <Text className="flex-1 font-inter text-[12.5px] text-slate-600">{d.label}</Text>
            <Text className="font-inter-semibold text-[12.5px] text-ink">{d.value}</Text>
            <Text className="ml-3 w-16 text-right font-inter text-[11px] text-slate-400">{d.ref}</Text>
          </View>
        ))}
      </View>

      <Card className="mt-4">
        <Text className="font-inter-semibold text-[11px] uppercase tracking-wide text-slate-400">
          {s.profile.representativeTitle}
        </Text>
        <Text className="mt-1 font-inter text-[13px] leading-relaxed text-slate-600">
          {s.profile.representativeBody}
        </Text>
      </Card>

      <Text className="mt-4 text-center font-inter text-[12px] text-slate-400">
        {s.profile.sourceList} espghan-2018-reference.sources.md
      </Text>
    </Screen>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View className="flex-row justify-between py-1">
      <Text className="font-inter text-[13px] text-slate-500">{k}</Text>
      <Text className="ml-4 flex-1 text-right font-inter-semibold text-[13px] text-ink">{v}</Text>
    </View>
  );
}
