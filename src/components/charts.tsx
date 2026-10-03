"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatBRLCompact } from "@/lib/format";
import type { MonthlyBucket } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */
/* Funil                                                               */
/* ------------------------------------------------------------------ */
export interface FunnelStage {
  label: string;
  value: number;
  color: string;
  hint?: string;
}

export function Funnel({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const prev = i > 0 ? stages[i - 1].value : null;
        const rate = prev ? Math.round((stage.value / prev) * 100) : null;
        return (
          <div key={stage.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="text-xs font-medium text-zinc-400">{stage.label}</span>
              <span className="font-display text-sm font-bold text-white">
                {stage.value}
                {rate !== null && i > 0 && (
                  <span className="ml-2 text-[10px] font-medium text-zinc-500">{rate}% da etapa anterior</span>
                )}
              </span>
            </div>
            <div className="relative h-9 overflow-hidden rounded-lg bg-white/[0.04]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max((stage.value / max) * 100, 4)}%` }}
                transition={{ duration: 0.9, delay: 0.12 * i, ease: EASE }}
                className="absolute inset-y-0 left-0 rounded-lg"
                style={{
                  background: `linear-gradient(90deg, ${stage.color}33, ${stage.color})`,
                  boxShadow: `0 0 24px ${stage.color}44`,
                }}
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-[10px] font-semibold text-zinc-500">
                {stage.hint}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Donut                                                               */
/* ------------------------------------------------------------------ */
export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export function Donut({ slices, centerLabel, centerValue }: { slices: DonutSlice[]; centerLabel: string; centerValue: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const total = slices.reduce((acc, s) => acc + s.value, 0) || 1;
  const R = 54;
  const C = 2 * Math.PI * R;

  let offset = 0;
  const segments = slices.map((s) => {
    const frac = s.value / total;
    const seg = { ...s, dash: frac * C, start: offset };
    offset += frac * C;
    return seg;
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
          {segments.map((seg) => (
            <circle
              key={seg.label}
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth="14"
              strokeLinecap="butt"
              strokeDasharray={`${mounted ? Math.max(seg.dash - 2, 0) : 0} ${C}`}
              strokeDashoffset={-seg.start}
              className="donut-segment"
            />
          ))}
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-white">{centerValue}</p>
            <p className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">{centerLabel}</p>
          </div>
        </div>
      </div>

      <ul className="flex-1 space-y-2.5">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}66` }} />
            <span className="text-zinc-400">{s.label}</span>
            <span className="ml-auto font-semibold text-zinc-200">{s.value}</span>
            <span className="w-9 text-right text-xs text-zinc-600">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Barras mensais de receita                                           */
/* ------------------------------------------------------------------ */
export function RevenueBars({ data }: { data: MonthlyBucket[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div>
      <div className="flex h-44 items-end gap-3 sm:gap-4">
        {data.map((d, i) => (
          <div key={d.key} className="group relative flex h-full flex-1 flex-col justify-end">
            {/* Tooltip */}
            <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-white/10 bg-panel2 px-2.5 py-1.5 text-center whitespace-nowrap opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
              <p className="text-xs font-bold text-white">{formatBRLCompact(d.revenue)}</p>
              <p className="text-[10px] text-zinc-500">
                {d.won} {d.won === 1 ? "venda" : "vendas"} · {d.total} leads
              </p>
            </div>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max((d.revenue / max) * 100, d.revenue > 0 ? 6 : 2)}%` }}
              transition={{ duration: 0.9, delay: 0.08 * i, ease: EASE }}
              className={`w-full rounded-t-lg transition-colors ${
                d.revenue > 0
                  ? "bg-gradient-to-t from-accent/25 via-accent/60 to-accent group-hover:brightness-125"
                  : "bg-white/[0.06]"
              }`}
              style={d.revenue > 0 ? { boxShadow: "0 -6px 30px rgba(249,115,22,0.2)" } : undefined}
            />
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex gap-3 sm:gap-4">
        {data.map((d) => (
          <div key={d.key} className="flex-1 text-center text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Barras de origem                                                    */
/* ------------------------------------------------------------------ */
export function SourceBars({ sources }: { sources: { name: string; count: number }[] }) {
  const max = Math.max(...sources.map((s) => s.count), 1);

  if (!sources.length) {
    return <p className="text-sm text-zinc-600">Sem dados de origem ainda.</p>;
  }

  return (
    <ul className="space-y-3.5">
      {sources.slice(0, 6).map((s, i) => (
        <li key={s.name}>
          <div className="mb-1.5 flex items-baseline justify-between text-xs">
            <span className="font-medium text-zinc-300">{s.name}</span>
            <span className="text-zinc-500">
              {s.count} {s.count === 1 ? "lead" : "leads"}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(s.count / max) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.07 * i, ease: EASE }}
              className="h-full rounded-full bg-gradient-to-r from-zinc-500 to-zinc-300"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
