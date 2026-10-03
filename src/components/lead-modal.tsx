"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, CircleDollarSign, Loader2, Mail, NotebookPen, Phone, User, X } from "lucide-react";
import { LEAD_SOURCES, STATUS_META, type Lead, type LeadStatus } from "@/lib/types";

interface LeadModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (lead: Lead) => void;
  lead?: Lead | null;
  defaultStatus?: LeadStatus;
}

export function LeadModal({ open, onClose, onSaved, lead, defaultStatus = "pending" }: LeadModalProps) {
  const editing = Boolean(lead);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState<string>("Site");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<LeadStatus>(defaultStatus);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setError(null);
    setName(lead?.name ?? "");
    setCompany(lead?.company ?? "");
    setEmail(lead?.email ?? "");
    setPhone(lead?.phone ?? "");
    setSource(lead?.source ?? "Site");
    setValue(lead ? String(lead.value ?? "") : "");
    setStatus(lead?.status ?? defaultStatus);
    setNotes(lead?.notes ?? "");
  }, [open, lead, defaultStatus]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Informe o nome do lead.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        company: company.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        source,
        value: value ? Number(value.replace(",", ".")) : 0,
        status,
        notes: notes.trim() || null,
      };
      const res = await fetch(editing ? `/api/leads/${lead!.id}` : "/api/leads", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar lead.");
        return;
      }
      onSaved(data.lead as Lead);
      onClose();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-panel shadow-2xl shadow-black/60"
          >
            {/* Header */}
            <div className="relative border-b border-white/[0.07] px-6 py-5">
              <div className="absolute -top-16 -right-10 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />
              <p className="text-[11px] font-semibold tracking-[0.2em] text-zinc-500 uppercase">
                {editing ? "Editar lead" : "Novo lead"}
              </p>
              <h3 className="font-display mt-1 text-xl font-bold text-white">
                {editing ? lead!.name : "Adicionar oportunidade"}
              </h3>
              <button
                onClick={onClose}
                className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <User className="h-3.5 w-3.5" /> Nome do contato *
                  </span>
                  <input
                    className="field"
                    placeholder="Ex.: Marina Duarte"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <Building2 className="h-3.5 w-3.5" /> Empresa
                  </span>
                  <input
                    className="field"
                    placeholder="Ex.: Padaria Pão Dourado"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <Phone className="h-3.5 w-3.5" /> Telefone
                  </span>
                  <input
                    className="field"
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <Mail className="h-3.5 w-3.5" /> E-mail
                  </span>
                  <input
                    className="field"
                    type="email"
                    placeholder="contato@empresa.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-zinc-400">Origem</span>
                  <select className="field" value={source} onChange={(e) => setSource(e.target.value)}>
                    {LEAD_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <CircleDollarSign className="h-3.5 w-3.5" /> Valor do negócio (R$)
                  </span>
                  <input
                    className="field"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={value}
                    onChange={(e) => setValue(e.target.value.replace(/[^\d.,]/g, ""))}
                  />
                </label>
              </div>

              {/* Status selector */}
              <div>
                <span className="mb-2 block text-xs font-medium text-zinc-400">Status do lead</span>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(STATUS_META) as LeadStatus[]).map((key) => {
                    const m = STATUS_META[key];
                    const active = status === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setStatus(key)}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                          active ? m.chipClass + " ring-1 ring-current/30" : "border-white/10 bg-white/[0.03] text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${m.dotClass}`} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                  <NotebookPen className="h-3.5 w-3.5" /> Observações
                </span>
                <textarea
                  className="field min-h-20 resize-none"
                  placeholder="Anotações sobre a negociação, objeções, próximos passos..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>

              {error && (
                <p className="rounded-xl border border-rose-400/25 bg-rose-400/10 px-4 py-2.5 text-xs font-medium text-rose-300">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-ink transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editing ? "Salvar alterações" : "Adicionar lead"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
