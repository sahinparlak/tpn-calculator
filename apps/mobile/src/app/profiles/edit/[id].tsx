import { type ElectrolyteUnit, type EnergyUnit, type TPNProfile, validateProfile } from '@tpn/engine';
import { router, useLocalSearchParams } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card } from '../../../components/ui/Card';
import { EditNum, EditText } from '../../../components/ui/EditField';
import { Screen } from '../../../components/ui/Screen';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { ToggleRow } from '../../../components/ui/Toggle';
import { useStrings } from '../../../lib/i18n';
import { useProfilesStore } from '../../../store/profiles';

const IONS = ['sodium', 'potassium', 'calcium', 'magnesium', 'phosphate', 'chloride'] as const;
const ADDITIVES = ['traceElements', 'vitamins', 'heparin'] as const;

// Stable React keys for editable array rows, so a row's local input state stays
// attached to the right entry across add/remove (an array index would not).
let uidCounter = 0;
const nextUid = () => ++uidCounter;

export default function ProfileEditScreen() {
  const s = useStrings();
  const { id } = useLocalSearchParams<{ id: string }>();
  const stored = useProfilesStore((st) => st.profiles.find((p) => p.id === id));
  const update = useProfilesStore((st) => st.update);

  const [draft, setDraft] = useState<TPNProfile | null>(() => (stored ? structuredClone(stored.profile) : null));
  const [fluidKeys, setFluidKeys] = useState<number[]>(() =>
    stored ? stored.profile.fluid.schedulePerKg.map(nextUid) : [],
  );
  const [stockKeys, setStockKeys] = useState<number[]>(() =>
    stored ? stored.profile.glucose.stockConcentrations.map(nextUid) : [],
  );
  const [ruleKeys, setRuleKeys] = useState<number[]>(() => (stored ? stored.profile.safety.rules.map(nextUid) : []));

  if (!stored || !draft) {
    return (
      <Screen>
        <Header title={s.editor.title} />
        <Card className="mt-4">
          <Text className="font-inter text-slate-600">{s.profiles.notFound}</Text>
        </Card>
      </Screen>
    );
  }

  if (stored.source === 'builtin') {
    return (
      <Screen>
        <Header title={s.editor.title} />
        <Card className="mt-4">
          <Text className="font-inter text-slate-600">{s.editor.readonly}</Text>
        </Card>
      </Screen>
    );
  }

  const profileId = stored.id;
  const edit = (mutate: (d: TPNProfile) => void) =>
    setDraft((prev) => {
      const next = structuredClone(prev as TPNProfile);
      mutate(next);
      return next;
    });
  const removeAt = (keys: number[], setKeys: (k: number[]) => void, i: number) =>
    setKeys(keys.filter((_, idx) => idx !== i));

  const validation = validateProfile(draft);
  const errors: Record<string, string> = validation.valid
    ? {}
    : Object.fromEntries(validation.errors.map((e) => [e.path, e.message]));
  const err = (path: string) => errors[path];

  function onSave() {
    if (!validation.valid) return;
    update(profileId, draft as TPNProfile);
    router.back();
  }

  return (
    <Screen>
      <Header title={s.editor.title} />

      {/* meta */}
      <Section title={s.editor.sections.meta}>
        <EditText
          label="Name"
          value={draft.meta.name}
          onChange={(v) => edit((d) => (d.meta.name = v))}
          error={err('meta.name')}
        />
        <EditText
          label="Version"
          hint="x.y.z"
          value={draft.meta.version}
          onChange={(v) => edit((d) => (d.meta.version = v))}
          error={err('meta.version')}
        />
        <EditText
          label="Locale"
          value={draft.meta.locale}
          onChange={(v) => edit((d) => (d.meta.locale = v))}
          error={err('meta.locale')}
        />
        <EditText
          label="Last reviewed"
          hint="YYYY-MM-DD"
          value={draft.meta.lastReviewed}
          onChange={(v) => edit((d) => (d.meta.lastReviewed = v))}
          error={err('meta.lastReviewed')}
        />
        <EditText
          label="Reviewed by"
          value={draft.meta.reviewedBy}
          onChange={(v) => edit((d) => (d.meta.reviewedBy = v))}
          error={err('meta.reviewedBy')}
        />
      </Section>

      {/* units */}
      <Section title={s.editor.sections.units}>
        <Field label="Energy">
          <SegmentedControl
            value={draft.units.energy}
            onChange={(v) => edit((d) => (d.units.energy = v as EnergyUnit))}
            options={[
              { label: 'kcal', value: 'kcal' },
              { label: 'kJ', value: 'kJ' },
            ]}
          />
        </Field>
        <Field label="Electrolyte">
          <SegmentedControl
            value={draft.units.electrolyte}
            onChange={(v) => edit((d) => (d.units.electrolyte = v as ElectrolyteUnit))}
            options={[
              { label: 'mmol', value: 'mmol' },
              { label: 'mEq', value: 'mEq' },
            ]}
          />
        </Field>
      </Section>

      {/* patient */}
      <Section title={s.editor.sections.patient}>
        <Field label="Age basis">
          <SegmentedControl
            value={draft.patient.ageBasis}
            onChange={(v) => edit((d) => (d.patient.ageBasis = v as TPNProfile['patient']['ageBasis']))}
            options={[
              { label: 'Day of life', value: 'dayOfLife' },
              { label: 'PMA', value: 'postmenstrualAge' },
            ]}
          />
        </Field>
        <ToggleRow
          label="Uses gestational age"
          value={draft.patient.usesGestationalAge}
          onValueChange={(v) => edit((d) => (d.patient.usesGestationalAge = v))}
        />
      </Section>

      {/* fluid */}
      <Section title={s.editor.sections.fluid}>
        {draft.fluid.schedulePerKg.map((step, i) => {
          const base = `fluid.schedulePerKg[${i}]`;
          const openEnded = step.dayTo === null;
          return (
            <View key={fluidKeys[i]} className="mb-3 rounded-2xl border border-slate-200 bg-white p-3">
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="font-inter-semibold text-[12px] uppercase tracking-wide text-slate-400">
                  Step {i + 1}
                </Text>
                {draft.fluid.schedulePerKg.length > 1 ? (
                  <RemoveButton
                    label={s.editor.remove}
                    onPress={() => {
                      edit((d) => d.fluid.schedulePerKg.splice(i, 1));
                      removeAt(fluidKeys, setFluidKeys, i);
                    }}
                  />
                ) : null}
              </View>
              <EditNum
                label="Day from"
                value={step.dayFrom}
                onChange={(v) => edit((d) => (d.fluid.schedulePerKg[i].dayFrom = v))}
                error={err(`${base}.dayFrom`)}
              />
              <ToggleRow
                label={s.editor.openEnded}
                value={openEnded}
                onValueChange={(on) => edit((d) => (d.fluid.schedulePerKg[i].dayTo = on ? null : step.dayFrom))}
              />
              {!openEnded ? (
                <EditNum
                  label="Day to"
                  value={step.dayTo as number}
                  onChange={(v) => edit((d) => (d.fluid.schedulePerKg[i].dayTo = v))}
                  error={err(`${base}.dayTo`)}
                />
              ) : null}
              <EditNum
                label="mL/kg"
                unit="mL/kg"
                value={step.mlPerKg}
                onChange={(v) => edit((d) => (d.fluid.schedulePerKg[i].mlPerKg = v))}
                error={err(`${base}.mlPerKg`)}
              />
            </View>
          );
        })}
        <AddButton
          label={s.editor.addStep}
          onPress={() => {
            edit((d) => {
              const last = d.fluid.schedulePerKg[d.fluid.schedulePerKg.length - 1];
              const from = last && last.dayTo !== null ? last.dayTo + 1 : 1;
              d.fluid.schedulePerKg.push({ dayFrom: from, dayTo: from, mlPerKg: 0 });
            });
            setFluidKeys([...fluidKeys, nextUid()]);
          }}
        />
        {err('fluid.schedulePerKg') ? <ErrText msg={err('fluid.schedulePerKg') as string} /> : null}
        <EditNum
          label="Phototherapy adjustment"
          unit="mL/kg"
          value={draft.fluid.phototherapyAdjMlPerKg}
          onChange={(v) => edit((d) => (d.fluid.phototherapyAdjMlPerKg = v))}
          error={err('fluid.phototherapyAdjMlPerKg')}
        />
        <EditNum
          label="Radiant warmer adjustment"
          unit="mL/kg"
          value={draft.fluid.radiantWarmerAdjMlPerKg}
          onChange={(v) => edit((d) => (d.fluid.radiantWarmerAdjMlPerKg = v))}
          error={err('fluid.radiantWarmerAdjMlPerKg')}
        />
        <EditNum
          label="Max volume"
          unit="mL/kg"
          value={draft.fluid.maxVolumePerKg}
          onChange={(v) => edit((d) => (d.fluid.maxVolumePerKg = v))}
          error={err('fluid.maxVolumePerKg')}
        />
      </Section>

      {/* energy */}
      <Section title={s.editor.sections.energy}>
        <EditNum
          label="Target min"
          unit="/kg"
          value={draft.energy.targetKcalPerKg.min}
          onChange={(v) => edit((d) => (d.energy.targetKcalPerKg.min = v))}
          error={err('energy.targetKcalPerKg.min')}
        />
        <EditNum
          label="Target max"
          unit="/kg"
          value={draft.energy.targetKcalPerKg.max}
          onChange={(v) => edit((d) => (d.energy.targetKcalPerKg.max = v))}
          error={err('energy.targetKcalPerKg.max')}
        />
        <EditNum
          label="kcal/g carbohydrate"
          value={draft.energy.kcalPerGram.carbohydrate}
          onChange={(v) => edit((d) => (d.energy.kcalPerGram.carbohydrate = v))}
          error={err('energy.kcalPerGram.carbohydrate')}
        />
        <EditNum
          label="kcal/g protein"
          value={draft.energy.kcalPerGram.protein}
          onChange={(v) => edit((d) => (d.energy.kcalPerGram.protein = v))}
          error={err('energy.kcalPerGram.protein')}
        />
        <EditNum
          label="kcal/g fat"
          value={draft.energy.kcalPerGram.fat}
          onChange={(v) => edit((d) => (d.energy.kcalPerGram.fat = v))}
          error={err('energy.kcalPerGram.fat')}
        />
      </Section>

      {/* glucose */}
      <Section title={s.editor.sections.glucose}>
        <EditNum
          label="GIR start"
          unit="mg/kg/min"
          value={draft.glucose.girStart}
          onChange={(v) => edit((d) => (d.glucose.girStart = v))}
          error={err('glucose.girStart')}
        />
        <EditNum
          label="GIR advance"
          unit="mg/kg/min"
          value={draft.glucose.girAdvance}
          onChange={(v) => edit((d) => (d.glucose.girAdvance = v))}
          error={err('glucose.girAdvance')}
        />
        <EditNum
          label="GIR max"
          unit="mg/kg/min"
          value={draft.glucose.girMax}
          onChange={(v) => edit((d) => (d.glucose.girMax = v))}
          error={err('glucose.girMax')}
        />
        <EditNum
          label="Max dextrose (peripheral)"
          unit="%"
          value={draft.glucose.maxConcPeripheral}
          onChange={(v) => edit((d) => (d.glucose.maxConcPeripheral = v))}
          error={err('glucose.maxConcPeripheral')}
        />
        <EditNum
          label="Max dextrose (central)"
          unit="%"
          value={draft.glucose.maxConcCentral}
          onChange={(v) => edit((d) => (d.glucose.maxConcCentral = v))}
          error={err('glucose.maxConcCentral')}
        />
        <Text className="mb-1.5 font-inter-semibold text-[13px] text-slate-600">Stock concentrations (%)</Text>
        {draft.glucose.stockConcentrations.map((c, i) => (
          <View key={stockKeys[i]} className="flex-row items-start gap-2">
            <View className="flex-1">
              <EditNum
                label={`Stock ${i + 1}`}
                unit="%"
                value={c}
                onChange={(v) => edit((d) => (d.glucose.stockConcentrations[i] = v))}
                error={err(`glucose.stockConcentrations[${i}]`)}
              />
            </View>
            {draft.glucose.stockConcentrations.length > 1 ? (
              <View className="mt-7">
                <RemoveButton
                  label={s.editor.remove}
                  onPress={() => {
                    edit((d) => d.glucose.stockConcentrations.splice(i, 1));
                    removeAt(stockKeys, setStockKeys, i);
                  }}
                />
              </View>
            ) : null}
          </View>
        ))}
        <AddButton
          label={s.editor.addStock}
          onPress={() => {
            edit((d) => d.glucose.stockConcentrations.push(0));
            setStockKeys([...stockKeys, nextUid()]);
          }}
        />
      </Section>

      {/* macronutrients */}
      <MacroSection title={s.editor.sections.aminoAcid} keyName="aminoAcid" draft={draft} edit={edit} err={err} />
      <MacroSection title={s.editor.sections.lipid} keyName="lipid" draft={draft} edit={edit} err={err} />

      {/* electrolytes */}
      <Section title={s.editor.sections.electrolytes}>
        {IONS.map((ion) => (
          <View key={ion} className="mb-3">
            <Text className="mb-1 font-inter-semibold text-[12px] uppercase tracking-wide text-slate-400">{ion}</Text>
            <EditNum
              label="Dose /kg"
              value={draft.electrolytes[ion].dosePerKg}
              onChange={(v) => edit((d) => (d.electrolytes[ion].dosePerKg = v))}
              error={err(`electrolytes.${ion}.dosePerKg`)}
            />
            <EditNum
              label="Stock concentration"
              unit="/mL"
              value={draft.electrolytes[ion].stockConcentration}
              onChange={(v) => edit((d) => (d.electrolytes[ion].stockConcentration = v))}
              error={err(`electrolytes.${ion}.stockConcentration`)}
            />
          </View>
        ))}
      </Section>

      {/* additives */}
      <Section title={s.editor.sections.additives}>
        {ADDITIVES.map((key) => (
          <View key={key} className="mb-3">
            <ToggleRow
              label={key}
              value={draft.additives[key].enabled}
              onValueChange={(v) => edit((d) => (d.additives[key].enabled = v))}
            />
            <EditNum
              label="Dose /kg"
              unit="mL/kg"
              value={draft.additives[key].dosePerKg}
              onChange={(v) => edit((d) => (d.additives[key].dosePerKg = v))}
              error={err(`additives.${key}.dosePerKg`)}
            />
          </View>
        ))}
      </Section>

      {/* osmolarity */}
      <Section title={s.editor.sections.osmolarity}>
        <EditNum
          label="Dextrose mOsm/g"
          value={draft.osmolarity.dextroseMOsmPerGram}
          onChange={(v) => edit((d) => (d.osmolarity.dextroseMOsmPerGram = v))}
          error={err('osmolarity.dextroseMOsmPerGram')}
        />
        <EditNum
          label="Amino acid mOsm/g"
          value={draft.osmolarity.aminoAcidMOsmPerGram}
          onChange={(v) => edit((d) => (d.osmolarity.aminoAcidMOsmPerGram = v))}
          error={err('osmolarity.aminoAcidMOsmPerGram')}
        />
        {IONS.map((ion) => (
          <EditNum
            key={ion}
            label={`${ion} mOsm/unit`}
            value={draft.osmolarity.electrolyteMOsmPerUnit[ion]}
            onChange={(v) => edit((d) => (d.osmolarity.electrolyteMOsmPerUnit[ion] = v))}
            error={err(`osmolarity.electrolyteMOsmPerUnit.${ion}`)}
          />
        ))}
        <EditNum
          label="Peripheral max"
          unit="mOsm/L"
          value={draft.osmolarity.peripheralMaxMOsmPerL}
          onChange={(v) => edit((d) => (d.osmolarity.peripheralMaxMOsmPerL = v))}
          error={err('osmolarity.peripheralMaxMOsmPerL')}
        />
      </Section>

      {/* caPhosphate */}
      <Section title={s.editor.sections.caPhosphate}>
        <EditNum
          label="Max solubility product"
          value={draft.caPhosphate.maxSolubilityProduct}
          onChange={(v) => edit((d) => (d.caPhosphate.maxSolubilityProduct = v))}
          error={err('caPhosphate.maxSolubilityProduct')}
        />
      </Section>

      {/* safety */}
      <Section title={s.editor.sections.safety}>
        <Field label="Default line">
          <SegmentedControl
            value={draft.safety.defaultLine}
            onChange={(v) => edit((d) => (d.safety.defaultLine = v as TPNProfile['safety']['defaultLine']))}
            options={[
              { label: 'Peripheral', value: 'peripheral' },
              { label: 'Central', value: 'central' },
            ]}
          />
        </Field>
        {draft.safety.rules.map((rule, i) => {
          const base = `safety.rules[${i}]`;
          return (
            <View key={ruleKeys[i]} className="mb-3 rounded-2xl border border-slate-200 bg-white p-3">
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="font-inter-semibold text-[12px] uppercase tracking-wide text-slate-400">
                  Rule {i + 1}
                </Text>
                <RemoveButton
                  label={s.editor.remove}
                  onPress={() => {
                    edit((d) => d.safety.rules.splice(i, 1));
                    removeAt(ruleKeys, setRuleKeys, i);
                  }}
                />
              </View>
              <EditText
                label="Id"
                value={rule.id}
                onChange={(v) => edit((d) => (d.safety.rules[i].id = v))}
                error={err(`${base}.id`)}
              />
              <Field label="Level">
                <SegmentedControl
                  value={rule.level}
                  onChange={(v) =>
                    edit((d) => (d.safety.rules[i].level = v as TPNProfile['safety']['rules'][number]['level']))
                  }
                  options={[
                    { label: 'Hard', value: 'hard' },
                    { label: 'Soft', value: 'soft' },
                  ]}
                />
              </Field>
              <EditText
                label="Ref"
                hint="profile path, e.g. glucose.girMax"
                value={rule.ref ?? ''}
                onChange={(v) => edit((d) => (d.safety.rules[i].ref = v || undefined))}
                error={err(`${base}.ref`)}
              />
              <EditText
                label="Message"
                value={rule.message ?? ''}
                onChange={(v) => edit((d) => (d.safety.rules[i].message = v || undefined))}
              />
              {err(base) ? <ErrText msg={err(base) as string} /> : null}
            </View>
          );
        })}
        <AddButton
          label={s.editor.addRule}
          onPress={() => {
            edit((d) => d.safety.rules.push({ id: '', level: 'soft', ref: '' }));
            setRuleKeys([...ruleKeys, nextUid()]);
          }}
        />
      </Section>

      {/* save */}
      <View className="mt-2">
        {!validation.valid ? (
          <Text className="mb-2 text-center font-inter text-[13px] text-red-600">{s.editor.invalid}</Text>
        ) : null}
        <Pressable
          onPress={onSave}
          disabled={!validation.valid}
          accessibilityRole="button"
          accessibilityState={{ disabled: !validation.valid }}
          className={`w-full items-center rounded-2xl py-4 active:opacity-90 ${validation.valid ? 'bg-accent-600' : 'bg-slate-300'}`}
        >
          <Text className="font-inter-semibold text-[15px] text-white">{s.editor.save}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

type EditFn = (mutate: (d: TPNProfile) => void) => void;

function MacroSection({
  title,
  keyName,
  draft,
  edit,
  err,
}: {
  title: string;
  keyName: 'aminoAcid' | 'lipid';
  draft: TPNProfile;
  edit: EditFn;
  err: (path: string) => string | undefined;
}) {
  const macro = draft[keyName];
  return (
    <Section title={title}>
      <EditText
        label="Product name"
        value={macro.product.name}
        onChange={(v) => edit((d) => (d[keyName].product.name = v))}
        error={err(`${keyName}.product.name`)}
      />
      <EditNum
        label="Concentration"
        unit="%"
        value={macro.product.concentrationPct}
        onChange={(v) => edit((d) => (d[keyName].product.concentrationPct = v))}
        error={err(`${keyName}.product.concentrationPct`)}
      />
      <EditNum
        label="Dose start"
        unit="g/kg"
        value={macro.doseStart}
        onChange={(v) => edit((d) => (d[keyName].doseStart = v))}
        error={err(`${keyName}.doseStart`)}
      />
      <EditNum
        label="Dose advance"
        unit="g/kg"
        value={macro.doseAdvance}
        onChange={(v) => edit((d) => (d[keyName].doseAdvance = v))}
        error={err(`${keyName}.doseAdvance`)}
      />
      <EditNum
        label="Dose max"
        unit="g/kg"
        value={macro.doseMax}
        onChange={(v) => edit((d) => (d[keyName].doseMax = v))}
        error={err(`${keyName}.doseMax`)}
      />
    </Section>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mb-5">
      <Text className="mb-2 font-inter-semibold text-[11px] uppercase tracking-wide text-slate-400">{title}</Text>
      {children}
    </View>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 font-inter-semibold text-[13px] text-slate-600">{label}</Text>
      {children}
    </View>
  );
}

function AddButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="mb-2 w-full items-center rounded-2xl border border-accent-100 bg-accent-50 py-3 active:opacity-90"
    >
      <Text className="font-inter-semibold text-[14px] text-accent-700">{label}</Text>
    </Pressable>
  );
}

function RemoveButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={8}>
      <Text className="font-inter-semibold text-[12px] text-red-600">{label}</Text>
    </Pressable>
  );
}

function ErrText({ msg }: { msg: string }) {
  return <Text className="mb-2 font-inter text-xs text-red-600">{msg}</Text>;
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
