import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '../../components/ui/Icon';
import { Screen } from '../../components/ui/Screen';
import { useStrings } from '../../lib/i18n';
import { type StoredProfile, useProfilesStore } from '../../store/profiles';

export default function ProfilesListScreen() {
  const s = useStrings();
  const profiles = useProfilesStore((st) => st.profiles);
  const activeProfileId = useProfilesStore((st) => st.activeProfileId);
  const clone = useProfilesStore((st) => st.clone);

  function onNew() {
    // Cloning the active profile is how a center starts its own; the editor opens
    // on the new copy.
    const id = clone(activeProfileId);
    if (id) router.push(`/profiles/edit/${id}`);
  }

  return (
    <Screen>
      <View className="mb-4 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text className="font-inter-medium text-sm text-accent-700">‹ {s.common.back}</Text>
        </Pressable>
        <Text className="font-display text-xl tracking-tight text-ink">{s.profiles.title}</Text>
      </View>

      <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {profiles.map((p, i) => (
          <ProfileRow key={p.id} profile={p} active={p.id === activeProfileId} first={i === 0} />
        ))}
      </View>

      <Pressable
        onPress={onNew}
        accessibilityRole="button"
        className="mt-4 w-full flex-row items-center justify-center gap-1.5 rounded-2xl border border-accent-100 bg-accent-50 py-3.5 active:opacity-90"
      >
        <Text className="font-inter-semibold text-[15px] text-accent-700">+ {s.profiles.newProfile}</Text>
      </Pressable>
    </Screen>
  );
}

function ProfileRow({ profile, active, first }: { profile: StoredProfile; active: boolean; first: boolean }) {
  const s = useStrings();
  const isBuiltin = profile.source === 'builtin';
  return (
    <Pressable
      onPress={() => router.push(`/profiles/${profile.id}`)}
      accessibilityRole="button"
      className={`flex-row items-center px-4 py-3.5 active:bg-slate-50 ${first ? '' : 'border-t border-slate-100'}`}
    >
      <View className="flex-1">
        <Text className="font-inter-semibold text-[15px] text-ink">{profile.profile.meta.name}</Text>
        <View className="mt-1 flex-row items-center gap-2">
          <Text
            className={`rounded-full border px-2 py-0.5 font-inter-semibold text-[10px] ${
              isBuiltin
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-accent-100 bg-accent-50 text-accent-700'
            }`}
          >
            {isBuiltin ? s.profiles.reference : s.profiles.custom}
          </Text>
          <Text className="font-inter text-[11px] text-slate-400">v{profile.profile.meta.version}</Text>
        </View>
      </View>
      {active ? (
        <View className="mr-2 flex-row items-center gap-1">
          <Icon name="check" size={15} color="#1d3a6e" strokeWidth={2.5} />
          <Text className="font-inter-semibold text-[11px] text-accent-700">{s.profiles.activeBadge}</Text>
        </View>
      ) : null}
      <Text className="font-inter text-slate-300">›</Text>
    </Pressable>
  );
}
