import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { useStrings } from '../../lib/i18n';
import { profileDosingSummary, provenanceDosing } from '../../lib/profile';
import { useProfilesStore } from '../../store/profiles';

export default function ProfileDetailScreen() {
  const s = useStrings();
  const { id } = useLocalSearchParams<{ id: string }>();
  const stored = useProfilesStore((st) => st.profiles.find((p) => p.id === id));
  const activeProfileId = useProfilesStore((st) => st.activeProfileId);
  const setActive = useProfilesStore((st) => st.setActive);
  const clone = useProfilesStore((st) => st.clone);
  const remove = useProfilesStore((st) => st.remove);

  if (!stored) {
    return (
      <Screen>
        <Header title={s.profiles.title} />
        <Card className="mt-4">
          <Text className="font-inter text-slate-600">{s.profiles.notFound}</Text>
        </Card>
      </Screen>
    );
  }

  const { profile, source, id: profileId } = stored;
  const meta = profile.meta;
  const isBuiltin = source === 'builtin';
  const isActive = profileId === activeProfileId;

  function onClone() {
    const newId = clone(profileId);
    if (newId) router.replace(`/profiles/${newId}`);
  }

  async function onExport() {
    await Clipboard.setStringAsync(JSON.stringify(profile, null, 2));
    Alert.alert(s.io.exportedTitle, s.io.exportedBody);
  }

  function onDelete() {
    Alert.alert(s.profiles.deleteTitle, s.profiles.deleteConfirm, [
      { text: s.common.cancel, style: 'cancel' },
      {
        text: s.common.delete,
        style: 'destructive',
        onPress: () => {
          remove(profileId);
          router.back();
        },
      },
    ]);
  }

  return (
    <Screen>
      <Header title={s.profiles.title} />

      <Card className="p-5">
        <Text className="font-display text-xl tracking-tight text-ink">{meta.name}</Text>
        <View className="mt-2 flex-row items-center gap-2">
          <Text
            className={`rounded-full border px-2.5 py-1 font-inter-semibold text-[11px] ${
              isBuiltin
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-accent-100 bg-accent-50 text-accent-700'
            }`}
          >
            {isBuiltin ? s.profiles.reference : s.profiles.custom}
          </Text>
          {isActive ? (
            <Text className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-inter-semibold text-[11px] text-slate-500">
              {s.profiles.activeBadge}
            </Text>
          ) : null}
        </View>
        <Text className="mt-2 font-inter text-[12px] text-amber-700">
          {isBuiltin ? s.profiles.notCenterValidated : s.profiles.centerProfile}
        </Text>
        <View className="mt-4 border-t border-slate-100 pt-4">
          <Row k={s.profile.version} v={meta.version} />
          <Row k={s.profile.lastReviewed} v={meta.lastReviewed} />
          <Row k={s.profile.reviewedBy} v={meta.reviewedBy} />
          <Row k={s.profiles.energyLabel} v={profile.units.energy} />
          <Row k={s.profiles.electrolyteLabel} v={profile.units.electrolyte} />
          <Row k={s.profiles.defaultLineLabel} v={profile.safety.defaultLine} />
        </View>
      </Card>

      {/* actions */}
      <View className="mt-4 gap-2">
        {!isActive ? (
          <Pressable
            onPress={() => {
              setActive(profileId);
              router.back();
            }}
            accessibilityRole="button"
            className="w-full items-center rounded-2xl bg-accent-600 py-3.5 active:opacity-90"
          >
            <Text className="font-inter-semibold text-[15px] text-white">{s.profiles.setActive}</Text>
          </Pressable>
        ) : (
          <View className="w-full items-center rounded-2xl border border-slate-200 bg-white py-3.5">
            <Text className="font-inter-semibold text-[14px] text-slate-500">✓ {s.profiles.isActive}</Text>
          </View>
        )}
        <View className="flex-row gap-2">
          {!isBuiltin ? (
            <Pressable
              onPress={() => router.push(`/profiles/edit/${profileId}`)}
              accessibilityRole="button"
              className="flex-1 items-center rounded-2xl border border-slate-200 bg-white py-3.5 active:opacity-90"
            >
              <Text className="font-inter-semibold text-[14px] text-accent-700">{s.profiles.edit}</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={onClone}
            accessibilityRole="button"
            className="flex-1 items-center rounded-2xl border border-slate-200 bg-white py-3.5 active:opacity-90"
          >
            <Text className="font-inter-semibold text-[14px] text-accent-700">{s.profiles.clone}</Text>
          </Pressable>
          {!isBuiltin ? (
            <Pressable
              onPress={onDelete}
              accessibilityRole="button"
              className="flex-1 items-center rounded-2xl border border-red-200 bg-red-50 py-3.5 active:opacity-90"
            >
              <Text className="font-inter-semibold text-[14px] text-red-700">{s.common.delete}</Text>
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={onExport}
          accessibilityRole="button"
          className="w-full items-center rounded-2xl border border-slate-200 bg-white py-3.5 active:opacity-90"
        >
          <Text className="font-inter-semibold text-[14px] text-accent-700">{s.profiles.exportAction}</Text>
        </Pressable>
      </View>

      {/* dosing summary */}
      <Text className="mb-2 mt-5 font-inter-semibold text-[11px] uppercase tracking-wide text-slate-400">
        {isBuiltin ? s.profile.dosingTitle : s.profiles.dosingTitle}
      </Text>
      <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {isBuiltin
          ? provenanceDosing.map((d, i) => (
              <View
                key={d.label}
                className={`flex-row items-center px-3 py-2 ${i > 0 ? 'border-t border-slate-100' : ''}`}
              >
                <Text className="flex-1 font-inter text-[12.5px] text-slate-600">{d.label}</Text>
                <Text className="font-inter-semibold text-[12.5px] text-ink">{d.value}</Text>
                <Text className="ml-3 w-16 text-right font-inter text-[11px] text-slate-400">{d.ref}</Text>
              </View>
            ))
          : profileDosingSummary(profile).map((d, i) => (
              <View
                key={d.label}
                className={`flex-row items-center px-3 py-2 ${i > 0 ? 'border-t border-slate-100' : ''}`}
              >
                <Text className="flex-1 font-inter text-[12.5px] text-slate-600">{d.label}</Text>
                <Text className="font-inter-semibold text-[12.5px] text-ink">{d.value}</Text>
              </View>
            ))}
      </View>

      {isBuiltin ? (
        <>
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
        </>
      ) : null}
    </Screen>
  );
}

function Header({ title }: { title: string }) {
  const s = useStrings();
  return (
    <View className="mb-4 flex-row items-center gap-3">
      <Pressable onPress={() => router.back()} accessibilityRole="button">
        <Text className="font-inter-medium text-sm text-accent-700">‹ {s.common.back}</Text>
      </Pressable>
      <Text className="font-display text-xl tracking-tight text-ink">{title}</Text>
    </View>
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
