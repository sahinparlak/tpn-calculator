import type { ReactNode } from 'react';
import { View } from 'react-native';
import { cn } from '../../lib/cn';

/** White card with a warm hairline border. */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <View className={cn('rounded-2xl border border-slate-200 bg-white p-4', className)}>{children}</View>;
}
