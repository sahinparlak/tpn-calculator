import { calculateTPN, type TPNResult, type Warning } from '@tpn/engine';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card } from '../components/ui/Card';
import { Screen } from '../components/ui/Screen';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { r1 } from '../lib/format';
import { useStrings } from '../lib/i18n';
import { activeProfile } from '../lib/profile';
import { toPatientInput, usePatientStore } from '../store/patient';

function num(v: number | string | undefined): number {
  return typeof v === 'number' ? v : Number(v ?? 0);
}

function CardTitle({ children, tone = 'ink' }: { children: ReactNode; tone?: 'ink' | 'danger' }) {
  return (
    <Text className={`mb-2 font-display text-[13px] ${tone === 'danger' ? 'text-red-700' : 'text-slate-700'}`}>
      {children}
    </Text>
  );
}

function KV({ k, v, danger }: { k: string; v: string; danger?: boolean }) {
  return (
    <View className="flex-row justify-between py-1">
      <Text className="font-inter text-[13px] text-slate-500">{k}</Text>
      <Text className={`font-inter-semibold text-[13px] ${danger ? 'text-red-700' : 'text-ink'}`}>{v}</Text>
    </View>
  );
}

function HardBanner({ warnings, title, countLabel }: { warnings: Warning[]; title: string; countLabel: string }) {
  return (
    <View className="mb-4 rounded-2xl bg-[#7f1d1d] p-4">
      <Text className="font-display text-[16px] text-white">⛔ {title}</Text>
      <Text className="mt-1 font-inter text-[13px] text-red-100">
        {warnings.length} {countLabel}
      </Text>
      <View className="mt-2 gap-1.5">
        {warnings.map((w) => (
          <View key={w.ruleId}>
            <Text className="self-start rounded bg-white/15 px-1.5 py-0.5 font-inter-medium text-[11px] text-white">
              {w.ruleId}
            </Text>
            <Text className="mt-0.5 pl-1 font-inter text-[13px] text-red-50">{w.message}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ResultScreen() {
  const s = useStrings();
  const form = usePatientStore();
  const parsed = toPatientInput(form, s.patient.errors);

  if ('errors' in parsed) {
    return (
      <Screen>
        <Text className="font-display text-2xl text-ink">{s.result.title}</Text>
        <Card className="mt-4">
          <Text className="font-inter text-slate-600">Please complete the patient form first.</Text>
        </Card>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="font-inter-semibold text-accent-700">‹ {s.common.edit}</Text>
        </Pressable>
      </Screen>
    );
  }

  let result: TPNResult;
  try {
    result = calculateTPN(parsed.input, activeProfile);
  } catch (e) {
    return (
      <Screen>
        <Text className="font-display text-2xl text-ink">{s.result.title}</Text>
        <Card className="mt-4">
          <Text className="font-inter text-red-700">{(e as Error).message}</Text>
        </Card>
      </Screen>
    );
  }

  const hard = result.warnings.filter((w) => w.level === 'hard');
  const soft = result.warnings.filter((w) => w.level === 'soft');
  const osmolarityWarn = result.warnings.some((w) => w.ruleId.includes('osmolarity'));
  const dist = result.energy.distribution;

  return (
    <Screen>
      {/* header */}
      <View className="mb-3 flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text className="font-inter-medium text-sm text-accent-700">‹ {s.common.edit}</Text>
        </Pressable>
        <Text className="font-display text-xl tracking-tight text-ink">{s.result.title}</Text>
        <Pressable onPress={() => router.push('/profile')} accessibilityRole="button">
          <Text className="font-inter-medium text-sm text-accent-700">{s.common.profile} ›</Text>
        </Pressable>
      </View>

      {/* line switch */}
      <View className="mb-4">
        <SegmentedControl
          value={form.line}
          onChange={(line) => form.set({ line })}
          options={[
            { label: s.patient.peripheral, value: 'peripheral' },
            { label: s.patient.central, value: 'central' },
          ]}
        />
      </View>

      {/* warnings */}
      {hard.length > 0 ? (
        <HardBanner warnings={hard} title={s.result.mustNotUse} countLabel={s.result.hardExceeded} />
      ) : (
        <Card className="mb-4">
          <Text className="font-inter-semibold text-[14px] text-ink">✓ {s.result.noWarnings}</Text>
          <Text className="mt-0.5 font-inter text-[13px] text-slate-500">{s.result.noWarningsNote}</Text>
        </Card>
      )}
      {soft.length > 0 ? (
        <View className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Text className="font-inter-semibold text-[13px] text-amber-800">
            {soft.length} {s.result.softNote}
          </Text>
          {soft.map((w) => (
            <Text key={w.ruleId} className="mt-1 font-inter text-[13px] text-amber-800">
              {w.message}
            </Text>
          ))}
        </View>
      ) : null}

      {/* hero */}
      <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-5">
        <Text className="font-inter-semibold text-[11px] uppercase tracking-[2px] text-slate-400">
          {s.result.totalVolume}
        </Text>
        <View className="mt-1 flex-row items-baseline">
          <Text className="font-display text-[52px] leading-none text-ink">{r1(result.totalVolumeMl)}</Text>
          <Text className="ml-2 font-inter-medium text-lg text-slate-400">mL</Text>
          <Text className="ml-auto font-display text-lg text-accent-600">
            {r1(result.derived.prescribedMlPerKg)} <Text className="font-inter text-sm text-slate-400">mL/kg</Text>
          </Text>
        </View>
      </View>

      <View className="gap-3">
        {/* glucose */}
        <Card>
          <CardTitle>{s.result.glucose}</CardTitle>
          <KV k={s.result.gir} v={`${r1(result.glucose.gir)} mg/kg/min`} />
          <KV k={s.result.finalDextrose} v={`${r1(result.glucose.finalConcentrationPct)}%`} />
          <KV k={s.result.amount} v={`${r1(num(result.glucose.detail?.glucoseGrams))} g`} />
          <KV k={s.result.dextroseVolume} v={`${r1(result.glucose.volumeMl)} mL`} />
        </Card>

        {/* amino acid + lipid */}
        <View className="flex-row gap-3">
          <Card className="flex-1">
            <CardTitle>{s.result.aminoAcid}</CardTitle>
            <Text className="font-display text-3xl text-ink">
              {r1(result.aminoAcid.gPerKg)} <Text className="font-inter text-sm text-slate-400">g/kg</Text>
            </Text>
            <Text className="mt-1 font-inter text-[13px] text-slate-500">
              {r1(num(result.aminoAcid.detail?.totalGrams))} g · {r1(result.aminoAcid.volumeMl)} mL
            </Text>
          </Card>
          <Card className="flex-1">
            <CardTitle>{s.result.lipid}</CardTitle>
            <Text className="font-display text-3xl text-ink">
              {r1(result.lipid.gPerKg)} <Text className="font-inter text-sm text-slate-400">g/kg</Text>
            </Text>
            <Text className="mt-1 font-inter text-[13px] text-slate-500">
              {r1(num(result.lipid.detail?.totalGrams))} g · {r1(result.lipid.volumeMl)} mL
            </Text>
          </Card>
        </View>

        {/* electrolytes */}
        <Card>
          <CardTitle>{s.result.electrolytes}</CardTitle>
          <View className="flex-row border-b border-slate-100 pb-1.5">
            <Text className="flex-1 font-inter-semibold text-[11px] uppercase text-slate-400">{s.result.ion}</Text>
            <Text className="w-16 text-right font-inter-semibold text-[11px] uppercase text-slate-400">
              {s.result.perKg}
            </Text>
            <Text className="w-12 text-right font-inter-semibold text-[11px] uppercase text-slate-400">
              {s.result.total}
            </Text>
            <Text className="w-16 text-right font-inter-semibold text-[11px] uppercase text-slate-400">
              {s.result.volume}
            </Text>
          </View>
          {result.electrolytes.map((e) => (
            <View key={e.label} className="flex-row border-b border-slate-100 py-1.5">
              <Text className="flex-1 font-inter-medium text-[13px] text-slate-600">{e.label}</Text>
              <Text className="w-16 text-right font-inter text-[13px] text-ink">{r1(num(e.detail?.dosePerKg))}</Text>
              <Text className="w-12 text-right font-inter text-[13px] text-ink">{r1(num(e.detail?.totalDose))}</Text>
              <Text className="w-16 text-right font-inter text-[13px] text-slate-500">{r1(e.volumeMl)} mL</Text>
            </View>
          ))}
        </Card>

        {/* additives */}
        <Card>
          <CardTitle>{s.result.additives}</CardTitle>
          <View className="flex-row gap-2">
            {result.additives.map((a) => {
              const off = a.volumeMl <= 0 || a.detail?.enabled === 'no';
              return (
                <View key={a.label} className="flex-1 items-center rounded-xl bg-slate-50 py-2">
                  <Text className="font-inter text-[12px] text-slate-500">{a.label}</Text>
                  <Text className={`font-inter-semibold text-[13px] ${off ? 'text-slate-400' : 'text-ink'}`}>
                    {off ? s.result.off : `${r1(a.volumeMl)} mL`}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* energy */}
        <Card>
          <CardTitle>{s.result.energy}</CardTitle>
          <View className="mb-3 flex-row items-baseline">
            <Text className="font-display text-3xl text-ink">{r1(result.energy.kcalPerKg)}</Text>
            <Text className="ml-1 font-inter text-sm text-slate-400">kcal/kg</Text>
            <Text className="ml-auto font-inter text-[13px] text-slate-500">
              total {r1(result.energy.totalKcal)} kcal
            </Text>
          </View>
          <View className="h-3 flex-row overflow-hidden rounded-full">
            <View style={{ width: `${dist.carbsPct}%`, backgroundColor: '#1d3a6e' }} />
            <View style={{ width: `${dist.proteinPct}%`, backgroundColor: '#7c97bf' }} />
            <View style={{ width: `${dist.fatPct}%`, backgroundColor: '#c3cfe0' }} />
          </View>
          <View className="mt-2 flex-row justify-between">
            <Text className="font-inter text-[11px] text-slate-500">
              <Text className="font-inter-semibold text-accent-600">{s.result.carb}</Text> {r1(dist.carbsPct)}%
            </Text>
            <Text className="font-inter text-[11px] text-slate-500">
              <Text className="font-inter-semibold" style={{ color: '#5f7aa6' }}>
                {s.result.protein}
              </Text>{' '}
              {r1(dist.proteinPct)}%
            </Text>
            <Text className="font-inter text-[11px] text-slate-500">
              <Text className="font-inter-semibold text-slate-500">{s.result.fat}</Text> {r1(dist.fatPct)}%
            </Text>
          </View>
        </Card>

        {/* osmolarity */}
        <View
          className={`rounded-2xl border-2 p-4 ${
            osmolarityWarn ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'
          }`}
        >
          <View className="flex-row items-center justify-between">
            <CardTitle tone={osmolarityWarn ? 'danger' : 'ink'}>{s.result.osmolarity}</CardTitle>
            <Text className={`font-display text-3xl ${osmolarityWarn ? 'text-red-700' : 'text-ink'}`}>
              {r1(result.osmolarityMOsmPerL)} <Text className="font-inter text-sm">mOsm/L</Text>
            </Text>
          </View>
          {osmolarityWarn ? (
            <Text className="mt-1 font-inter text-xs text-red-500">{s.result.osmolarityNote}</Text>
          ) : null}
        </View>

        {/* derived */}
        <Card>
          <CardTitle>{s.result.derived}</CardTitle>
          <KV k={s.result.aqueousVolume} v={`${r1(result.derived.aqueousVolumeMl)} mL`} />
          <KV k={s.result.lipidVolume} v={`${r1(result.derived.lipidVolumeMl)} mL`} />
          <KV k={s.result.caPProduct} v={r1(result.derived.caPhosphateProduct)} />
        </Card>

        {/* color key */}
        <Card>
          <Text className="mb-2 font-inter-semibold text-[11px] uppercase tracking-wide text-slate-400">
            {s.result.colorKey}
          </Text>
          <View className="flex-row gap-2">
            <Text className="flex-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-center font-inter-semibold text-[12px] text-red-700">
              {s.result.hardKey}
            </Text>
            <Text className="flex-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-center font-inter-semibold text-[12px] text-amber-700">
              {s.result.softKey}
            </Text>
          </View>
        </Card>

        {/* footer */}
        <View className="rounded-2xl bg-slate-100 p-4">
          <Text className="font-inter text-[12px] leading-relaxed text-slate-500">{s.result.footer}</Text>
          <Pressable onPress={() => router.push('/profile')} className="mt-2">
            <Text className="font-inter-semibold text-[12px] text-accent-700">{s.result.profileLink} ›</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
