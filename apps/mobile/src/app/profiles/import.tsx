import { type ProfileError, type TPNProfile, validateProfile } from '@tpn/engine';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { useStrings } from '../../lib/i18n';
import { useProfilesStore } from '../../store/profiles';

export default function ImportProfileScreen() {
  const s = useStrings();
  const add = useProfilesStore((st) => st.add);
  const [text, setText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [problems, setProblems] = useState<ProfileError[]>([]);

  async function onPaste() {
    const clip = await Clipboard.getStringAsync();
    if (clip) setText(clip);
  }

  function onImport() {
    setJsonError(null);
    setProblems([]);

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setJsonError(s.io.invalidJson);
      return;
    }

    const result = validateProfile(parsed);
    if (!result.valid) {
      setProblems(result.errors);
      return;
    }

    const id = add(parsed as TPNProfile, { activate: false });
    router.replace(`/profiles/${id}`);
  }

  return (
    <Screen>
      <View className="mb-4 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text className="font-inter-medium text-sm text-accent-700">‹ {s.common.back}</Text>
        </Pressable>
        <Text className="font-display text-xl tracking-tight text-ink">{s.io.importTitle}</Text>
      </View>

      <Text className="mb-3 font-inter text-[13px] leading-relaxed text-slate-500">{s.io.importHint}</Text>

      <Pressable
        onPress={onPaste}
        accessibilityRole="button"
        className="mb-3 self-start rounded-2xl border border-accent-100 bg-accent-50 px-4 py-2.5 active:opacity-90"
      >
        <Text className="font-inter-semibold text-[13px] text-accent-700">{s.io.paste}</Text>
      </Pressable>

      <View className="rounded-2xl border border-slate-200 bg-white p-3">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={'{ "meta": { ... }, ... }'}
          placeholderTextColor="#d6d1c6"
          multiline
          textAlignVertical="top"
          accessibilityLabel={s.io.importTitle}
          className="min-h-[180px] font-inter text-[13px] text-ink"
        />
      </View>

      {jsonError ? <Text className="mt-2 font-inter text-[13px] text-red-600">{jsonError}</Text> : null}

      {problems.length > 0 ? (
        <Card className="mt-3 border border-red-200 bg-red-50">
          <Text className="font-inter-semibold text-[13px] text-red-700">{s.io.invalidProfile}</Text>
          <View className="mt-2 gap-1">
            {problems.slice(0, 12).map((p) => (
              <Text key={`${p.path}:${p.message}`} className="font-inter text-[12px] text-red-700">
                <Text className="font-inter-semibold">{p.path}</Text> — {p.message}
              </Text>
            ))}
            {problems.length > 12 ? (
              <Text className="font-inter text-[12px] text-red-500">+{problems.length - 12} more…</Text>
            ) : null}
          </View>
        </Card>
      ) : null}

      <Pressable
        onPress={onImport}
        disabled={text.trim() === ''}
        accessibilityRole="button"
        accessibilityState={{ disabled: text.trim() === '' }}
        className={`mt-4 w-full items-center rounded-2xl py-4 active:opacity-90 ${
          text.trim() === '' ? 'bg-slate-300' : 'bg-accent-600'
        }`}
      >
        <Text className="font-inter-semibold text-[15px] text-white">{s.io.importButton}</Text>
      </Pressable>
    </Screen>
  );
}
