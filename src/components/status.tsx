"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { STATUS_META, type LeadStatus } from "@/lib/types";

export function StatusBadge({ status, size = "md" }: { status: LeadStatus; size?: "sm" | "md" }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${meta.chipClass} ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
      {meta.label}
    </span>
  );
}

export function StatusMenu({
  status,
  onChange,
  disabled,
}: {
  status: LeadStatus;
  onChange: (next: LeadStatus) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const meta = STATUS_META[status];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${meta.chipClass} ${
          disabled ? "cursor-wait opacity-60" : "hover:brightness-125"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
        {meta.label}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-0 z-30 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-panel2 p-1 shadow-2xl shadow-black/60"
          >
            {(Object.keys(STATUS_META) as LeadStatus[]).map((key) => {
              const m = STATUS_META[key];
              const active = key === status;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    if (!active) onChange(key);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                    active ? "bg-white/[0.06] text-white" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${m.dotClass}`} />
                  {m.label}
                  {active && <Check className="ml-auto h-3.5 w-3.5 text-accent" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
