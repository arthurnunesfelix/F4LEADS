"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { LeadModal } from "./lead-modal";
import type { Lead, LeadStatus } from "@/lib/types";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  onLeadSaved?: (lead: Lead) => void;
  defaultStatus?: LeadStatus;
}

export function PageHeader({ eyebrow, title, subtitle, onLeadSaved, defaultStatus }: PageHeaderProps) {
  const [open, setOpen] = useState(false);
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8 flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        <p className="text-[11px] font-semibold tracking-[0.25em] text-zinc-500 uppercase">{eyebrow}</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-400 capitalize sm:block">
          {today}
        </span>
        <button
          onClick={() => setOpen(true)}
          className="group inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-ink shadow-[0_8px_30px_rgba(249,115,22,0.3)] transition-all hover:shadow-[0_8px_40px_rgba(249,115,22,0.45)] hover:brightness-110"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" strokeWidth={2.75} />
          Novo Lead
        </button>
      </div>

      <LeadModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={(lead) => {
          onLeadSaved?.(lead);
          window.dispatchEvent(new Event("leadflow:refresh"));
        }}
        defaultStatus={defaultStatus}
      />
    </motion.header>
  );
}
