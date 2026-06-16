import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { cn } from '../../lib/cn';

interface ScreenProps {
  children: ReactNode;
  /** When true, content scrolls; otherwise it fills the screen. */
  scroll?: boolean;
  edges?: readonly Edge[];
  contentClassName?: string;
}

/** Warm-ground screen wrapper with safe-area insets. */
export function Screen({ children, scroll = true, edges = ['top', 'bottom'], contentClassName }: ScreenProps) {
  return (
    <View className="flex-1 bg-ground">
      <SafeAreaView className="flex-1" edges={edges}>
        {scroll ? (
          <ScrollView
            contentContainerClassName={cn('px-6 pb-12 pt-4', contentClassName)}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View className={cn('flex-1 px-6 pb-8 pt-8', contentClassName)}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}
