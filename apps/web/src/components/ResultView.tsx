import type { TPNProfile, TPNResult, Warning } from '@tpn/engine';
import { r1 } from '../lib/format';
import { strings } from '../lib/strings';
import { unitLabels } from '../lib/units';
import { Card, CardTitle, KV } from './ui';

const s = strings.result;

function num(v: number | string | undefined): number {
  return typeof v === 'number' ? v : Number(v ?? 0);
}

function HardBanner({ warnings }: { warnings: Warning[] }) {
  return (
    <div className="rounded-2xl bg-[#7f1d1d] p-4" role="alert">
      <p className="font-display text-[16px] text-white">⛔ {s.mustNotUse}</p>
      <p className="mt-1 text-[13px] text-red-100">
        {warnings.length} {s.hardExceeded}:
      </p>
      <div className="mt-2 space-y-1.5">
        {warnings.map((w) => (
          <div key={w.ruleId}>
            <span className="inline-block rounded bg-white/15 px-1.5 py-0.5 text-[11px] font-medium text-white">
              {w.ruleId}
            </span>
            <p className="mt-0.5 pl-1 text-[13px] text-red-50">{w.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResultView({ result, profile }: { result: TPNResult; profile: TPNProfile }) {
  const units = unitLabels(profile);
  const hard = result.warnings.filter((w) => w.level === 'hard');
  const soft = result.warnings.filter((w) => w.level === 'soft');
  const osmolarityWarn = result.warnings.some((w) => w.ruleId.includes('osmolarity'));
  const dist = result.energy.distribution;

  return (
    <div className="space-y-3">
      {/* warnings */}
      {hard.length > 0 ? (
        <HardBanner warnings={hard} />
      ) : (
        <Card>
          <p className="text-[14px] font-semibold text-ink">✓ {s.noWarnings}</p>
          <p className="mt-0.5 text-[13px] text-slate-500">{s.noWarningsNote}</p>
        </Card>
      )}
      {soft.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-[13px] font-semibold text-amber-800">
            {soft.length} {s.softNote}
          </p>
          {soft.map((w) => (
            <p key={w.ruleId} className="mt-1 text-[13px] text-amber-800">
              {w.message}
            </p>
          ))}
        </div>
      ) : null}

      {/* hero */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[2px] text-slate-400">{s.totalVolume}</p>
        <div className="mt-1 flex items-baseline">
          <span className="font-display text-[52px] leading-none text-ink">{r1(result.totalVolumeMl)}</span>
          <span className="ml-2 text-lg font-medium text-slate-400">mL</span>
          <span className="ml-auto font-display text-lg text-accent-600">
            {r1(result.derived.prescribedMlPerKg)} <span className="text-sm text-slate-400">mL/kg</span>
          </span>
        </div>
      </div>

      {/* glucose */}
      <Card>
        <CardTitle>{s.glucose}</CardTitle>
        <KV k={s.gir} v={`${r1(result.glucose.gir)} mg/kg/min`} />
        <KV k={s.finalDextrose} v={`${r1(result.glucose.finalConcentrationPct)}%`} />
        <KV k={s.amount} v={`${r1(num(result.glucose.detail?.glucoseGrams))} g`} />
        <KV k={s.dextroseVolume} v={`${r1(result.glucose.volumeMl)} mL`} />
      </Card>

      {/* amino acid + lipid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardTitle>{s.aminoAcid}</CardTitle>
          <p className="font-display text-3xl text-ink">
            {r1(result.aminoAcid.gPerKg)} <span className="text-sm text-slate-400">g/kg</span>
          </p>
          <p className="mt-1 text-[13px] text-slate-500">
            {r1(num(result.aminoAcid.detail?.totalGrams))} g · {r1(result.aminoAcid.volumeMl)} mL
          </p>
        </Card>
        <Card>
          <CardTitle>{s.lipid}</CardTitle>
          <p className="font-display text-3xl text-ink">
            {r1(result.lipid.gPerKg)} <span className="text-sm text-slate-400">g/kg</span>
          </p>
          <p className="mt-1 text-[13px] text-slate-500">
            {r1(num(result.lipid.detail?.totalGrams))} g · {r1(result.lipid.volumeMl)} mL
          </p>
        </Card>
      </div>

      {/* electrolytes */}
      <Card>
        <CardTitle>{s.electrolytes}</CardTitle>
        <div className="flex border-b border-slate-100 pb-1.5 text-[11px] font-semibold uppercase text-slate-400">
          <span className="flex-1">{s.ion}</span>
          <span className="w-20 text-right">{units.electrolytePerKg}</span>
          <span className="w-14 text-right">{s.total}</span>
          <span className="w-16 text-right">{s.volume}</span>
        </div>
        {result.electrolytes.map((e) => (
          <div key={e.label} className="flex border-b border-slate-100 py-1.5 text-[13px]">
            <span className="flex-1 font-medium text-slate-600">{e.label}</span>
            <span className="w-20 text-right text-ink">{r1(num(e.detail?.dosePerKg))}</span>
            <span className="w-14 text-right text-ink">{r1(num(e.detail?.totalDose))}</span>
            <span className="w-16 text-right text-slate-500">{r1(e.volumeMl)} mL</span>
          </div>
        ))}
      </Card>

      {/* additives */}
      <Card>
        <CardTitle>{s.additives}</CardTitle>
        <div className="flex gap-2">
          {result.additives.map((a) => {
            const off = a.volumeMl <= 0 || a.detail?.enabled === 'no';
            return (
              <div key={a.label} className="flex-1 rounded-xl bg-slate-50 py-2 text-center">
                <p className="text-[12px] text-slate-500">{a.label}</p>
                <p className={`text-[13px] font-semibold ${off ? 'text-slate-400' : 'text-ink'}`}>
                  {off ? s.off : `${r1(a.volumeMl)} mL`}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* energy */}
      <Card>
        <CardTitle>{s.energy}</CardTitle>
        <div className="mb-3 flex items-baseline">
          <span className="font-display text-3xl text-ink">{r1(result.energy.kcalPerKg)}</span>
          <span className="ml-1 text-sm text-slate-400">{units.energyPerKg}</span>
          <span className="ml-auto text-[13px] text-slate-500">
            {s.total} {r1(result.energy.totalKcal)} {units.energy}
          </span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full">
          <span style={{ width: `${dist.carbsPct}%`, backgroundColor: '#1d3a6e' }} />
          <span style={{ width: `${dist.proteinPct}%`, backgroundColor: '#7c97bf' }} />
          <span style={{ width: `${dist.fatPct}%`, backgroundColor: '#c3cfe0' }} />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-slate-500">
          <span>
            <span className="font-semibold text-accent-600">{s.carb}</span> {r1(dist.carbsPct)}%
          </span>
          <span>
            <span className="font-semibold" style={{ color: '#5f7aa6' }}>
              {s.protein}
            </span>{' '}
            {r1(dist.proteinPct)}%
          </span>
          <span>
            <span className="font-semibold text-slate-500">{s.fat}</span> {r1(dist.fatPct)}%
          </span>
        </div>
      </Card>

      {/* osmolarity */}
      <div
        className={`rounded-2xl border-2 p-4 ${
          osmolarityWarn ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex items-center justify-between">
          <CardTitle danger={osmolarityWarn}>{s.osmolarity}</CardTitle>
          <span className={`font-display text-3xl ${osmolarityWarn ? 'text-red-700' : 'text-ink'}`}>
            {r1(result.osmolarityMOsmPerL)} <span className="text-sm">mOsm/L</span>
          </span>
        </div>
        {osmolarityWarn ? <p className="mt-1 text-xs text-red-500">{s.osmolarityNote}</p> : null}
      </div>

      {/* derived */}
      <Card>
        <CardTitle>{s.derived}</CardTitle>
        <KV k={s.aqueousVolume} v={`${r1(result.derived.aqueousVolumeMl)} mL`} />
        <KV k={s.lipidVolume} v={`${r1(result.derived.lipidVolumeMl)} mL`} />
        <KV k={s.caPProduct} v={`${r1(result.derived.caPhosphateProduct)} ${units.caPhosphateProduct}`} />
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{s.caPProductNote}</p>
      </Card>

      {/* color key */}
      <Card>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{s.colorKey}</p>
        <div className="flex gap-2">
          <span className="flex-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-center text-[12px] font-semibold text-red-700">
            {s.hardKey}
          </span>
          <span className="flex-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-center text-[12px] font-semibold text-amber-700">
            {s.softKey}
          </span>
        </div>
      </Card>

      {/* footer */}
      <div className="rounded-2xl bg-slate-100 p-4">
        <p className="text-[12px] leading-relaxed text-slate-500">{s.footer}</p>
      </div>
    </div>
  );
}
