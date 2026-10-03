"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Inbox,
  Loader2,
  Mail,
  NotebookPen,
  Pencil,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
} from "lucide-react";
import { LeadModal } from "./lead-modal";
import { StatusMenu } from "./status";
import { avatarGradient, formatBRL, formatDateShort, initials } from "@/lib/format";
import { STATUS_META, type Lead, type LeadStatus } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;
type StatusFilter = "all" | LeadStatus;

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "pending", label: "Pendentes" },
  { key: "purchased", label: "Compraram" },
  { key: "refused", label: "Recusados" },
];

export function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editing, setEditing] = useState<Lead | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/leads?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeads(data.leads as Lead[]);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [status, debouncedSearch]);

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener("leadflow:refresh", onRefresh);
    return () => window.removeEventListener("leadflow:refresh", onRefresh);
  }, [load]);

  const totals = useMemo(() => {
    const value = leads.reduce((acc, l) => acc + l.value, 0);
    return { count: leads.length, value };
  }, [leads]);

  async function changeStatus(lead: Lead, next: LeadStatus) {
    setBusyId(lead.id);
    const prev = leads;
    setLeads((list) => list.map((l) => (l.id === lead.id ? { ...l, status: next } : l)));
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setLeads(prev);
    } finally {
      setBusyId(null);
    }
  }

  async function deleteLead(lead: Lead) {
    setBusyId(lead.id);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setLeads((list) => list.filter((l) => l.id !== lead.id));
      setConfirmDelete(null);
    } catch {
      /* mantém na lista */
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {/* Filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="card mb-4 flex flex-wrap items-center gap-3 p-3"
      >
        <div className="relative min-w-52 flex-1">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <input
            className="field pl-10"
            placeholder="Buscar por nome, empresa, e-mail ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-1">
          {FILTERS.map((f) => {
            const active = status === f.key;
            const dotColor = f.key === "all" ? "bg-zinc-400" : STATUS_META[f.key as LeadStatus].dotClass;
            return (
              <button
                key={f.key}
                onClick={() => setStatus(f.key)}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-lg border border-white/10 bg-white/[0.08]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className={`relative h-1.5 w-1.5 rounded-full ${dotColor}`} />
                <span className="relative">{f.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={load}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"
          aria-label="Recarregar"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </motion.div>

      {/* Summary strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-4 flex items-center justify-between px-1 text-xs text-zinc-600"
      >
        <span>
          <span className="font-semibold text-zinc-300">{totals.count}</span>{" "}
          {totals.count === 1 ? "lead encontrado" : "leads encontrados"}
        </span>
        <span>
          Valor total: <span className="font-semibold text-accent">{formatBRL(totals.value)}</span>
        </span>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
        className="card overflow-hidden"
      >
        {error && (
          <div className="p-10 text-center text-sm text-rose-300">Falha ao carregar leads. Tente novamente.</div>
        )}

        {!error && loading && leads.length === 0 && (
          <div className="grid place-items-center gap-3 p-16 text-zinc-500">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
            <p className="text-sm">Carregando leads...</p>
          </div>
        )}

        {!error && !loading && leads.length === 0 && (
          <div className="grid place-items-center gap-3 p-16 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-500">
              <Inbox className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-base font-semibold text-white">Nenhum lead por aqui</p>
              <p className="mt-1 max-w-sm text-sm text-zinc-500">
                {search ? "Nenhum resultado para a sua busca. Tente outros termos." : "Cadastre o primeiro lead para começar a acompanhar o funil."}
              </p>
            </div>
          </div>
        )}

        {leads.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] tracking-[0.14em] text-zinc-600 uppercase">
                  <th className="px-5 py-3.5 font-semibold">Lead</th>
                  <th className="px-5 py-3.5 font-semibold">Contato</th>
                  <th className="px-5 py-3.5 font-semibold">Origem</th>
                  <th className="px-5 py-3.5 font-semibold">Valor</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Criado</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {leads.map((lead, i) => (
                    <motion.tr
                      key={lead.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.4), ease: EASE }}
                      onClick={() => {
                        setEditing(lead);
                        setModalOpen(true);
                      }}
                      className="group cursor-pointer border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.035]"
                      title="Clique para editar este lead"
                    >
                      {/* Lead */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br text-[11px] font-bold text-ink ${avatarGradient(lead.name)}`}
                          >
                            {initials(lead.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-zinc-100">{lead.name}</p>
                            {lead.company && (
                              <p className="flex items-center gap-1 truncate text-xs text-zinc-500">
                                <Building2 className="h-3 w-3" /> {lead.company}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5 text-xs">
                          {lead.email ? (
                            <p className="flex items-center gap-1.5 text-zinc-400">
                              <Mail className="h-3 w-3 text-zinc-600" /> {lead.email}
                            </p>
                          ) : (
                            <p className="text-zinc-700">—</p>
                          )}
                          {lead.phone && (
                            <p className="flex items-center gap-1.5 text-zinc-500">
                              <Phone className="h-3 w-3 text-zinc-600" /> {lead.phone}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Source */}
                      <td className="px-5 py-3.5">
                        <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-zinc-400">
                          {lead.source ?? "Outro"}
                        </span>
                      </td>

                      {/* Value */}
                      <td className="px-5 py-3.5 font-semibold whitespace-nowrap text-zinc-200">{formatBRL(lead.value)}</td>

                      {/* Status */}
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <StatusMenu status={lead.status} disabled={busyId === lead.id} onChange={(next) => changeStatus(lead, next)} />
                      </td>

                      {/* Created */}
                      <td className="px-5 py-3.5 text-xs whitespace-nowrap text-zinc-500">{formatDateShort(lead.createdAt)}</td>

                      {/* Actions */}
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.notes && (
                            <span className="grid h-8 w-8 place-items-center rounded-lg text-zinc-600" title={lead.notes}>
                              <NotebookPen className="h-4 w-4" />
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setEditing(lead);
                              setModalOpen(true);
                            }}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11px] font-semibold text-zinc-300 transition-all hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
                            aria-label="Editar lead"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </button>
                          {confirmDelete === lead.id ? (
                            <button
                              onClick={() => deleteLead(lead)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-400/15 px-2.5 text-[11px] font-bold text-rose-300 transition-colors hover:bg-rose-400/25"
                            >
                              {busyId === lead.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                              Confirmar
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setConfirmDelete(lead.id);
                                setTimeout(() => setConfirmDelete((v) => (v === lead.id ? null : v)), 3500);
                              }}
                              className="grid h-8 w-8 place-items-center rounded-lg border border-transparent text-zinc-500 transition-all hover:border-rose-400/25 hover:bg-rose-400/10 hover:text-rose-300"
                              aria-label="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <LeadModal
        open={modalOpen}
        lead={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSaved={load}
      />
    </div>
  );
}

/* Botão flutuante para cadastrar lead a partir da tabela */
export function NewLeadFloat({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 z-40 grid h-14 w-14 place-items-center rounded-2xl bg-accent text-ink shadow-[0_12px_40px_rgba(249,115,22,0.45)] transition-transform hover:scale-105 active:scale-95 lg:right-10 lg:bottom-10"
        aria-label="Adicionar lead"
      >
        <UserPlus className="h-6 w-6" strokeWidth={2.25} />
      </button>
      <LeadModal open={open} onClose={() => setOpen(false)} onSaved={onSaved} />
    </>
  );
}
