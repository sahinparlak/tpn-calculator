import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStrings } from '../lib/i18n';

export default function TermsScreen() {
  const s = useStrings();
  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-row items-center justify-between border-b border-slate-100 px-5 py-4">
          <Text className="font-inter-bold text-[15px] text-ink">{s.terms.title}</Text>
          <Pressable onPress={() => router.back()} accessibilityRole="button">
            <Text className="font-inter-semibold text-sm text-accent-700">{s.common.close}</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerClassName="gap-4 px-5 py-4" showsVerticalScrollIndicator={false}>
          {s.terms.sections.map((sec) => (
            <View key={sec.h}>
              <Text className="font-inter-semibold text-[13px] text-ink">{sec.h}</Text>
              <Text className="mt-0.5 font-inter text-[13px] leading-relaxed text-slate-600">{sec.p}</Text>
            </View>
          ))}
          <Text className="font-inter text-[11px] leading-relaxed text-slate-400">{s.terms.footer}</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
