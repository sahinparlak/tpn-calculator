// Phase 2A smoke screen.
//
// Purpose: prove the monorepo wiring works end to end inside the Metro bundle —
// the workspace package `@tpn/engine` resolves to its built `dist/`, the embedded
// ESPGHAN reference profile bundles, and `calculateTPN` runs on-device. This is
// NOT the real UI; the clinical screens replace it in Phase 2D. No clinical logic
// lives here — every value below comes straight from the engine.
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { calculateTPN, type PatientInput, type TPNProfile } from '@tpn/engine';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

// Single embedded profile (Phase 2 scope). Source of truth lives at the repo root.
import espghanProfile from '../../../../profiles/espghan-2018-reference.json';

const profile = espghanProfile as unknown as TPNProfile;

// Plan smoke scenario: preterm 1.8 kg, day of life 5, peripheral line.
// Expected: hard warnings (osmolarity / dextrose peripheral max).
const samplePatient: PatientInput = {
  weightKg: 1.8,
  ageDays: 5,
  line: 'peripheral',
};

const result = calculateTPN(samplePatient, profile);

export default function SmokeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title">TPN engine — smoke</ThemedText>
          <ThemedText type="small">{profile.meta.name}</ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Patient</ThemedText>
            <ThemedText type="default">
              {samplePatient.weightKg} kg · day {samplePatient.ageDays} · {samplePatient.line}
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Result</ThemedText>
            <ThemedText type="default">Total volume: {result.totalVolumeMl} mL</ThemedText>
            <ThemedText type="default">GIR: {result.glucose.gir} mg/kg/min</ThemedText>
            <ThemedText type="default">
              Final dextrose: {result.glucose.finalConcentrationPct}%
            </ThemedText>
            <ThemedText type="default">
              Osmolarity: {result.osmolarityMOsmPerL} mOsm/L
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Warnings ({result.warnings.length})</ThemedText>
            {result.warnings.map((w) => (
              <ThemedText key={w.ruleId} type="default">
                [{w.level}] {w.ruleId}
              </ThemedText>
            ))}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
});
