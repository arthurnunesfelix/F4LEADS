"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CircleDollarSign,
  Clock3,
  Target,
  Users,
  UserX,
} from "lucide-react";
import { PageHeader } from "./page-header";
import { StatusBadge } from "./status";
import { Donut, Funnel, RevenueBars, SourceBars } from "./charts";
import { avatarGradient, formatBRL, formatBRLCompact, initials, timeAgo } from "@/lib/format";
import { STATUS_META, type Stats } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;

function StatCard({
  index,
  icon,
  label,
  value,
  hint,
  accent,
}: {
  index: number;
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.08 * index, ease: EASE }}
      className={`card card-hover relative overflow-hidden p-5 ${
        accent ? "border-accent/25 bg-gradient-to-br from-accent/[0.09] to-transparent" : ""
      }`}
    >
      {accent && <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-accent/15 blur-3xl" />}
      <div className="flex items-start justify-between">
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl border ${
            accent ? "border-accent/30 bg-accent/15 text-accent" : "border-white/10 bg-white/[0.05] text-zinc-300"
          }`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-4 text-xs font-medium text-zinc-500">{label}</p>
      <p className={`font-display mt-1 text-2xl font-bold tracking-tight sm:text-[1.7rem] ${accent ? "text-accent" : "text-white"}`}>
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-medium text-zinc-600">{hint}</p>
    </motion.div>
  );
}

function Panel({
  index,
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  index: number;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1 + 0.06 * index, ease: EASE }}
      className={`card p-5 sm:p-6 ${className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-white">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card h-36 animate-pulse bg-white/[0.02] p-5" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card h-64 animate-pulse bg-white/[0.02]" />
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setStats(await res.json());
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener("leadflow:refresh", onRefresh);
    return () => window.removeEventListener("leadflow:refresh", onRefresh);
  }, [load]);

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Visão Geral"
        subtitle="Acompanhe em tempo real os leads pendentes, os que já compraram e os recusados."
        onLeadSaved={load}
      />

      {error && (
        <div className="card mb-6 border-rose-400/25 p-5 text-sm text-rose-300">
          Não foi possível carregar os dados. Verifique a conexão com o banco e tente novamente.
        </div>
      )}

      {!stats && !error && <Skeleton />}

      {stats && (
        <div className="space-y-4">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard
              index={0}
              icon={<Users className="h-5 w-5" />}
              label="Total de leads"
              value={String(stats.total)}
              hint={`+${stats.newThisMonth} este mês`}
            />
            <StatCard
              index={1}
              icon={<Clock3 className="h-5 w-5 text-amber-300" />}
              label="Pipeline pendente"
              value={formatBRLCompact(stats.pipeline)}
              hint={`${stats.pending.count} ${stats.pending.count === 1 ? "lead em negociação" : "leads em negociação"}`}
            />
            <StatCard
              index={2}
              icon={<CircleDollarSign className="h-5 w-5" />}
              label="Receita fechada"
              value={formatBRLCompact(stats.revenue)}
              hint={`${stats.purchased.count} ${stats.purchased.count === 1 ? "cliente comprou" : "clientes compraram"} · ticket ${formatBRLCompact(stats.avgTicket)}`}
              accent
            />
            <StatCard
              index={3}
              icon={<Target className="h-5 w-5 text-emerald-300" />}
              label="Taxa de conversão"
              value={`${stats.conversion}%`}
              hint={`${stats.winRate}% de vitória sobre leads decididos`}
            />
          </div>

          {/* Row 2 */}
          <div className="grid gap-4 lg:grid-cols-5">
            <Panel
              index={0}
              title="Funil de vendas"
              subtitle="Da captação à conversão"
              className="lg:col-span-3"
            >
              <Funnel
                stages={[
                  {
                    label: "Leads captados",
                    value: stats.total,
                    color: "#9BA7C0",
                    hint: "100%",
                  },
                  {
                    label: "Em negociação",
                    value: stats.pending.count,
                    color: STATUS_META.pending.color,
                    hint: formatBRLCompact(stats.pipeline),
                  },
                  {
                    label: "Compraram",
                    value: stats.purchased.count,
                    color: STATUS_META.purchased.color,
                    hint: formatBRLCompact(stats.revenue),
                  },
                ]}
              />
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3">
                <UserX className="h-4 w-4 shrink-0 text-rose-300" />
                <p className="text-xs text-zinc-400">
                  <span className="font-semibold text-rose-300">{stats.refused.count} recusados</span> representam{" "}
                  {formatBRLCompact(stats.refused.value)} em oportunidades perdidas.
                </p>
              </div>
            </Panel>

            <Panel index={1} title="Distribuição" subtitle="Leads por status" className="lg:col-span-2">
              <Donut
                slices={[
                  { label: "Pendentes", value: stats.pending.count, color: STATUS_META.pending.color },
                  { label: "Compraram", value: stats.purchased.count, color: STATUS_META.purchased.color },
                  { label: "Recusados", value: stats.refused.count, color: STATUS_META.refused.color },
                ]}
                centerValue={`${stats.conversion}%`}
                centerLabel="conversão"
              />
            </Panel>
          </div>

          {/* Row 3 */}
          <div className="grid gap-4 lg:grid-cols-5">
            <Panel
              index={2}
              title="Receita por mês"
              subtitle="Vendas fechadas nos últimos 6 meses"
              className="lg:col-span-3"
            >
              <RevenueBars data={stats.monthly} />
            </Panel>

            <Panel index={3} title="Origens" subtitle="De onde vêm seus leads" className="lg:col-span-2">
              <SourceBars sources={stats.sources} />
            </Panel>
          </div>

          {/* Recent leads */}
          <Panel
            index={4}
            title="Leads recentes"
            subtitle="Últimas oportunidades adicionadas"
            action={
              <Link
                href="/leads"
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent transition-colors hover:text-white"
              >
                Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            {stats.recent.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-600">
                Nenhum lead cadastrado ainda. Clique em Novo Lead para começar.
              </p>
            ) : (
              <ul className="divide-y divide-white/[0.05]">
                {stats.recent.map((lead, i) => (
                  <motion.li
                    key={lead.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 * i, ease: EASE }}
                    className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br text-xs font-bold text-ink ${avatarGradient(lead.name)}`}
                    >
                      {initials(lead.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-100">{lead.name}</p>
                      <p className="truncate text-xs text-zinc-500">
                        {lead.company ?? "Sem empresa"} · {lead.source ?? "Outro"}
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-sm font-semibold text-zinc-200">{formatBRL(lead.value)}</p>
                      <p className="text-[11px] text-zinc-600">{timeAgo(lead.createdAt)}</p>
                    </div>
                    <StatusBadge status={lead.status} size="sm" />
                  </motion.li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
