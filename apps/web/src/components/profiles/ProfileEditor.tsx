import { type ElectrolyteUnit, type EnergyUnit, type TPNProfile, validateProfile } from '@tpn/engine';
import { type ReactNode, useState } from 'react';
import { useNav } from '../../store/nav';
import { useProfilesStore } from '../../store/profiles';
import { strings } from '../../lib/strings';
import { AddButton, EditNum, EditText, ErrText, RemoveButton, Section } from '../fields';
import { Card, Segmented, Toggle } from '../ui';

const s = strings.editor;
const IONS = ['sodium', 'potassium', 'calcium', 'magnesium', 'phosphate', 'chloride'] as const;
const ADDITIVES = ['traceElements', 'vitamins', 'heparin'] as const;

let uidCounter = 0;
const nextUid = () => ++uidCounter;

export function ProfileEditor({ id }: { id: string }) {
  const back = useNav((n) => n.back);
  const stored = useProfilesStore((st) => st.profiles.find((p) => p.id === id));
  const update = useProfilesStore((st) => st.update);

  const [draft, setDraft] = useState<TPNProfile | null>(() => (stored ? structuredClone(stored.profile) : null));
  const [fluidKeys, setFluidKeys] = useState<number[]>(() =>
    (stored?.profile.fluid.schedulePerKg ?? []).map(() => nextUid()),
  );
  const [stockKeys, setStockKeys] = useState<number[]>(() =>
    (stored?.profile.glucose.stockConcentrations ?? []).map(() => nextUid()),
  );
  const [ruleKeys, setRuleKeys] = useState<number[]>(() => (stored?.profile.safety.rules ?? []).map(() => nextUid()));

  if (!stored || !draft) {
    return (
      <Shell onBack={back}>
        <Card>
          <p className="text-[14px] text-slate-500">{strings.profiles.notFound}</p>
        </Card>
      </Shell>
    );
  }

  if (stored.source === 'builtin') {
    return (
      <Shell onBack={back}>
        <Card>
          <p className="text-[14px] text-slate-600">{s.readonly}</p>
        </Card>
      </Shell>
    );
  }

  const d = draft;
  const edit = (mutate: (next: TPNProfile) => void) =>
    setDraft((prev) => {
      const next = structuredClone(prev as TPNProfile);
      mutate(next);
      return next;
    });

  const validation = validateProfile(d);
  const errors: Record<string, string> = validation.valid
    ? {}
    : Object.fromEntries(validation.errors.map((e) => [e.path, e.message]));
  const err = (path: string): string | undefined => errors[path];

  const removeAt = (keys: number[], setKeys: (k: number[]) => void, i: number) =>
    setKeys(keys.filter((_, idx) => idx !== i));

  function onSave() {
    if (!validation.valid) {
      return;
    }
    update(id, d);
    back();
  }

  return (
    <Shell onBack={back} onSave={onSave} canSave={validation.valid}>
      <div className="space-y-4">
        {/* meta */}
        <Section title={s.sections.meta}>
          <EditText
            label="Name"
            value={d.meta.name}
            onChange={(v) => edit((n) => (n.meta.name = v))}
            error={err('meta.name')}
          />
          <EditText
            label="Version"
            hint="x.y.z"
            value={d.meta.version}
            onChange={(v) => edit((n) => (n.meta.version = v))}
            error={err('meta.version')}
          />
          <EditText
            label="Locale"
            value={d.meta.locale}
            onChange={(v) => edit((n) => (n.meta.locale = v))}
            error={err('meta.locale')}
          />
          <EditText
            label="Last reviewed"
            hint="YYYY-MM-DD"
            value={d.meta.lastReviewed}
            onChange={(v) => edit((n) => (n.meta.lastReviewed = v))}
            error={err('meta.lastReviewed')}
          />
          <EditText
            label="Reviewed by"
            value={d.meta.reviewedBy}
            onChange={(v) => edit((n) => (n.meta.reviewedBy = v))}
            error={err('meta.reviewedBy')}
          />
        </Section>

        {/* units */}
        <Section title={s.sections.units}>
          <Labeled label="Energy">
            <Segmented<EnergyUnit>
              value={d.units.energy}
              onChange={(v) => edit((n) => (n.units.energy = v))}
              options={[
                { label: 'kcal', value: 'kcal' },
                { label: 'kJ', value: 'kJ' },
              ]}
            />
          </Labeled>
          <Labeled label="Electrolyte">
            <Segmented<ElectrolyteUnit>
              value={d.units.electrolyte}
              onChange={(v) => edit((n) => (n.units.electrolyte = v))}
              options={[
                { label: 'mmol', value: 'mmol' },
                { label: 'mEq', value: 'mEq' },
              ]}
            />
          </Labeled>
        </Section>

        {/* patient */}
        <Section title={s.sections.patient}>
          <Labeled label="Age basis">
            <Segmented
              value={d.patient.ageBasis}
              onChange={(v) => edit((n) => (n.patient.ageBasis = v))}
              options={[
                { label: 'Day of life', value: 'dayOfLife' },
                { label: 'PMA', value: 'postmenstrualAge' },
              ]}
            />
          </Labeled>
          <Toggle
            label="Uses gestational age"
            value={d.patient.usesGestationalAge}
            onChange={(v) => edit((n) => (n.patient.usesGestationalAge = v))}
          />
        </Section>

        {/* fluid */}
        <Section title={s.sections.fluid}>
          {d.fluid.schedulePerKg.map((step, i) => {
            const openEnded = step.dayTo === null;
            return (
              <div key={fluidKeys[i]} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">Step {i + 1}</span>
                  {d.fluid.schedulePerKg.length > 1 ? (
                    <RemoveButton
                      label={s.remove}
                      onClick={() => {
                        edit((n) => n.fluid.schedulePerKg.splice(i, 1));
                        removeAt(fluidKeys, setFluidKeys, i);
                      }}
                    />
                  ) : null}
                </div>
                <div className="space-y-3">
                  <EditNum
                    label="Day from"
                    value={step.dayFrom}
                    onChange={(v) =>
                      edit((n) => {
                        const st = n.fluid.schedulePerKg[i];
                        if (st) st.dayFrom = v;
                      })
                    }
                    error={err(`fluid.schedulePerKg[${i}].dayFrom`)}
                  />
                  <Toggle
                    label={s.openEnded}
                    value={openEnded}
                    onChange={(on) =>
                      edit((n) => {
                        const st = n.fluid.schedulePerKg[i];
                        if (st) st.dayTo = on ? null : st.dayFrom;
                      })
                    }
                  />
                  {openEnded ? null : (
                    <EditNum
                      label="Day to"
                      value={step.dayTo ?? 0}
                      onChange={(v) =>
                        edit((n) => {
                          const st = n.fluid.schedulePerKg[i];
                          if (st) st.dayTo = v;
                        })
                      }
                      error={err(`fluid.schedulePerKg[${i}].dayTo`)}
                    />
                  )}
                  <EditNum
                    label="mL/kg"
                    unit="mL/kg"
                    value={step.mlPerKg}
                    onChange={(v) =>
                      edit((n) => {
                        const st = n.fluid.schedulePerKg[i];
                        if (st) st.mlPerKg = v;
                      })
                    }
                    error={err(`fluid.schedulePerKg[${i}].mlPerKg`)}
                  />
                </div>
              </div>
            );
          })}
          {err('fluid.schedulePerKg') ? <ErrText>{err('fluid.schedulePerKg')}</ErrText> : null}
          <AddButton
            label={s.addStep}
            onClick={() => {
              edit((n) => {
                const last = n.fluid.schedulePerKg[n.fluid.schedulePerKg.length - 1];
                const from = last && last.dayTo !== null ? last.dayTo + 1 : 1;
                n.fluid.schedulePerKg.push({ dayFrom: from, dayTo: from, mlPerKg: 0 });
              });
              setFluidKeys([...fluidKeys, nextUid()]);
            }}
          />
          <EditNum
            label="Phototherapy adjustment"
            unit="mL/kg"
            value={d.fluid.phototherapyAdjMlPerKg}
            onChange={(v) => edit((n) => (n.fluid.phototherapyAdjMlPerKg = v))}
            error={err('fluid.phototherapyAdjMlPerKg')}
          />
          <EditNum
            label="Radiant warmer adjustment"
            unit="mL/kg"
            value={d.fluid.radiantWarmerAdjMlPerKg}
            onChange={(v) => edit((n) => (n.fluid.radiantWarmerAdjMlPerKg = v))}
            error={err('fluid.radiantWarmerAdjMlPerKg')}
          />
          <EditNum
            label="Max volume"
            unit="mL/kg"
            value={d.fluid.maxVolumePerKg}
            onChange={(v) => edit((n) => (n.fluid.maxVolumePerKg = v))}
            error={err('fluid.maxVolumePerKg')}
          />
        </Section>

        {/* energy */}
        <Section title={s.sections.energy}>
          <EditNum
            label="Target min"
            unit="/kg"
            value={d.energy.targetKcalPerKg.min}
            onChange={(v) => edit((n) => (n.energy.targetKcalPerKg.min = v))}
            error={err('energy.targetKcalPerKg.min')}
          />
          <EditNum
            label="Target max"
            unit="/kg"
            value={d.energy.targetKcalPerKg.max}
            onChange={(v) => edit((n) => (n.energy.targetKcalPerKg.max = v))}
            error={err('energy.targetKcalPerKg.max')}
          />
          <EditNum
            label="kcal/g carbohydrate"
            value={d.energy.kcalPerGram.carbohydrate}
            onChange={(v) => edit((n) => (n.energy.kcalPerGram.carbohydrate = v))}
            error={err('energy.kcalPerGram.carbohydrate')}
          />
          <EditNum
            label="kcal/g protein"
            value={d.energy.kcalPerGram.protein}
            onChange={(v) => edit((n) => (n.energy.kcalPerGram.protein = v))}
            error={err('energy.kcalPerGram.protein')}
          />
          <EditNum
            label="kcal/g fat"
            value={d.energy.kcalPerGram.fat}
            onChange={(v) => edit((n) => (n.energy.kcalPerGram.fat = v))}
            error={err('energy.kcalPerGram.fat')}
          />
        </Section>

        {/* glucose */}
        <Section title={s.sections.glucose}>
          <EditNum
            label="GIR start"
            unit="mg/kg/min"
            value={d.glucose.girStart}
            onChange={(v) => edit((n) => (n.glucose.girStart = v))}
            error={err('glucose.girStart')}
          />
          <EditNum
            label="GIR advance"
            unit="mg/kg/min"
            value={d.glucose.girAdvance}
            onChange={(v) => edit((n) => (n.glucose.girAdvance = v))}
            error={err('glucose.girAdvance')}
          />
          <EditNum
            label="GIR max"
            unit="mg/kg/min"
            value={d.glucose.girMax}
            onChange={(v) => edit((n) => (n.glucose.girMax = v))}
            error={err('glucose.girMax')}
          />
          <EditNum
            label="Max dextrose (peripheral)"
            unit="%"
            value={d.glucose.maxConcPeripheral}
            onChange={(v) => edit((n) => (n.glucose.maxConcPeripheral = v))}
            error={err('glucose.maxConcPeripheral')}
          />
          <EditNum
            label="Max dextrose (central)"
            unit="%"
            value={d.glucose.maxConcCentral}
            onChange={(v) => edit((n) => (n.glucose.maxConcCentral = v))}
            error={err('glucose.maxConcCentral')}
          />
          <p className="pt-1 text-[12px] font-semibold uppercase tracking-wide text-slate-400">
            Stock concentrations (%)
          </p>
          {d.glucose.stockConcentrations.map((stock, i) => (
            <div key={stockKeys[i]} className="flex items-end gap-2">
              <div className="flex-1">
                <EditNum
                  label={`Stock ${i + 1}`}
                  unit="%"
                  value={stock}
                  onChange={(v) => edit((n) => (n.glucose.stockConcentrations[i] = v))}
                  error={err(`glucose.stockConcentrations[${i}]`)}
                />
              </div>
              {d.glucose.stockConcentrations.length > 1 ? (
                <div className="pb-2.5">
                  <RemoveButton
                    label={s.remove}
                    onClick={() => {
                      edit((n) => n.glucose.stockConcentrations.splice(i, 1));
                      removeAt(stockKeys, setStockKeys, i);
                    }}
                  />
                </div>
              ) : null}
            </div>
          ))}
          <AddButton
            label={s.addStock}
            onClick={() => {
              edit((n) => n.glucose.stockConcentrations.push(0));
              setStockKeys([...stockKeys, nextUid()]);
            }}
          />
        </Section>

        {/* amino acid + lipid */}
        <MacroSection title={s.sections.aminoAcid} keyName="aminoAcid" d={d} edit={edit} err={err} />
        <MacroSection title={s.sections.lipid} keyName="lipid" d={d} edit={edit} err={err} />

        {/* electrolytes */}
        <Section title={s.sections.electrolytes}>
          {IONS.map((ion) => (
            <div key={ion} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-slate-500">{ion}</p>
              <div className="space-y-3">
                <EditNum
                  label="Dose /kg"
                  value={d.electrolytes[ion].dosePerKg}
                  onChange={(v) => edit((n) => (n.electrolytes[ion].dosePerKg = v))}
                  error={err(`electrolytes.${ion}.dosePerKg`)}
                />
                <EditNum
                  label="Stock concentration"
                  unit="/mL"
                  value={d.electrolytes[ion].stockConcentration}
                  onChange={(v) => edit((n) => (n.electrolytes[ion].stockConcentration = v))}
                  error={err(`electrolytes.${ion}.stockConcentration`)}
                />
              </div>
            </div>
          ))}
        </Section>

        {/* additives */}
        <Section title={s.sections.additives}>
          {ADDITIVES.map((key) => (
            <div key={key} className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <Toggle
                label={key}
                value={d.additives[key].enabled}
                onChange={(v) => edit((n) => (n.additives[key].enabled = v))}
              />
              <EditNum
                label="Dose /kg"
                unit="mL/kg"
                value={d.additives[key].dosePerKg}
                onChange={(v) => edit((n) => (n.additives[key].dosePerKg = v))}
                error={err(`additives.${key}.dosePerKg`)}
              />
            </div>
          ))}
        </Section>

        {/* osmolarity */}
        <Section title={s.sections.osmolarity}>
          <EditNum
            label="Dextrose mOsm/g"
            value={d.osmolarity.dextroseMOsmPerGram}
            onChange={(v) => edit((n) => (n.osmolarity.dextroseMOsmPerGram = v))}
            error={err('osmolarity.dextroseMOsmPerGram')}
          />
          <EditNum
            label="Amino acid mOsm/g"
            value={d.osmolarity.aminoAcidMOsmPerGram}
            onChange={(v) => edit((n) => (n.osmolarity.aminoAcidMOsmPerGram = v))}
            error={err('osmolarity.aminoAcidMOsmPerGram')}
          />
          {IONS.map((ion) => (
            <EditNum
              key={ion}
              label={`${ion} mOsm/unit`}
              value={d.osmolarity.electrolyteMOsmPerUnit[ion]}
              onChange={(v) => edit((n) => (n.osmolarity.electrolyteMOsmPerUnit[ion] = v))}
              error={err(`osmolarity.electrolyteMOsmPerUnit.${ion}`)}
            />
          ))}
          <EditNum
            label="Peripheral max"
            unit="mOsm/L"
            value={d.osmolarity.peripheralMaxMOsmPerL}
            onChange={(v) => edit((n) => (n.osmolarity.peripheralMaxMOsmPerL = v))}
            error={err('osmolarity.peripheralMaxMOsmPerL')}
          />
        </Section>

        {/* ca-phosphate */}
        <Section title={s.sections.caPhosphate}>
          <EditNum
            label="Max solubility product"
            value={d.caPhosphate.maxSolubilityProduct}
            onChange={(v) => edit((n) => (n.caPhosphate.maxSolubilityProduct = v))}
            error={err('caPhosphate.maxSolubilityProduct')}
          />
        </Section>

        {/* safety */}
        <Section title={s.sections.safety}>
          <Labeled label="Default line">
            <Segmented
              value={d.safety.defaultLine}
              onChange={(v) => edit((n) => (n.safety.defaultLine = v))}
              options={[
                { label: 'Peripheral', value: 'peripheral' },
                { label: 'Central', value: 'central' },
              ]}
            />
          </Labeled>
          {d.safety.rules.map((rule, i) => (
            <div key={ruleKeys[i]} className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">Rule {i + 1}</span>
                <RemoveButton
                  label={s.remove}
                  onClick={() => {
                    edit((n) => n.safety.rules.splice(i, 1));
                    removeAt(ruleKeys, setRuleKeys, i);
                  }}
                />
              </div>
              <EditText
                label="Id"
                value={rule.id}
                onChange={(v) =>
                  edit((n) => {
                    const r = n.safety.rules[i];
                    if (r) r.id = v;
                  })
                }
                error={err(`safety.rules[${i}].id`)}
              />
              <Labeled label="Level">
                <Segmented
                  value={rule.level}
                  onChange={(v) =>
                    edit((n) => {
                      const r = n.safety.rules[i];
                      if (r) r.level = v;
                    })
                  }
                  options={[
                    { label: 'Hard', value: 'hard' },
                    { label: 'Soft', value: 'soft' },
                  ]}
                />
              </Labeled>
              <EditText
                label="Ref"
                hint="profile path, e.g. glucose.girMax"
                value={rule.ref ?? ''}
                onChange={(v) =>
                  edit((n) => {
                    const r = n.safety.rules[i];
                    if (!r) return;
                    if (v) r.ref = v;
                    else delete r.ref;
                  })
                }
              />
              <EditText
                label="Message"
                value={rule.message ?? ''}
                onChange={(v) =>
                  edit((n) => {
                    const r = n.safety.rules[i];
                    if (!r) return;
                    if (v) r.message = v;
                    else delete r.message;
                  })
                }
              />
              {err(`safety.rules[${i}]`) ? <ErrText>{err(`safety.rules[${i}]`)}</ErrText> : null}
            </div>
          ))}
          <AddButton
            label={s.addRule}
            onClick={() => {
              edit((n) => n.safety.rules.push({ id: '', level: 'soft', ref: '' }));
              setRuleKeys([...ruleKeys, nextUid()]);
            }}
          />
        </Section>
      </div>
    </Shell>
  );
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-semibold text-slate-600">{label}</span>
      {children}
    </div>
  );
}

function MacroSection({
  title,
  keyName,
  d,
  edit,
  err,
}: {
  title: string;
  keyName: 'aminoAcid' | 'lipid';
  d: TPNProfile;
  edit: (mutate: (next: TPNProfile) => void) => void;
  err: (path: string) => string | undefined;
}) {
  const m = d[keyName];
  return (
    <Section title={title}>
      <EditText
        label="Product name"
        value={m.product.name}
        onChange={(v) => edit((n) => (n[keyName].product.name = v))}
        error={err(`${keyName}.product.name`)}
      />
      <EditNum
        label="Concentration"
        unit="%"
        value={m.product.concentrationPct}
        onChange={(v) => edit((n) => (n[keyName].product.concentrationPct = v))}
        error={err(`${keyName}.product.concentrationPct`)}
      />
      <EditNum
        label="Dose start"
        unit="g/kg"
        value={m.doseStart}
        onChange={(v) => edit((n) => (n[keyName].doseStart = v))}
        error={err(`${keyName}.doseStart`)}
      />
      <EditNum
        label="Dose advance"
        unit="g/kg"
        value={m.doseAdvance}
        onChange={(v) => edit((n) => (n[keyName].doseAdvance = v))}
        error={err(`${keyName}.doseAdvance`)}
      />
      <EditNum
        label="Dose max"
        unit="g/kg"
        value={m.doseMax}
        onChange={(v) => edit((n) => (n[keyName].doseMax = v))}
        error={err(`${keyName}.doseMax`)}
      />
    </Section>
  );
}

function Shell({
  children,
  onBack,
  onSave,
  canSave,
}: {
  children: ReactNode;
  onBack: () => void;
  onSave?: (() => void) | undefined;
  canSave?: boolean | undefined;
}) {
  return (
    <div>
      <div className="sticky top-0 z-10 mb-4 flex items-center justify-between border-b border-slate-200 bg-slate-50/90 py-3 backdrop-blur">
        <button type="button" onClick={onBack} className="text-[14px] font-medium text-accent-700">
          ‹ {strings.common.back}
        </button>
        <span className="font-display text-[15px] text-ink">{strings.editor.title}</span>
        {onSave ? (
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold text-white ${
              canSave ? 'bg-accent-600 hover:bg-accent-700' : 'cursor-not-allowed bg-slate-300'
            }`}
          >
            {strings.common.save}
          </button>
        ) : (
          <span className="w-10" />
        )}
      </div>
      {onSave && !canSave ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] font-semibold text-amber-800">
          {strings.editor.invalid}
        </div>
      ) : null}
      {children}
    </div>
  );
}
