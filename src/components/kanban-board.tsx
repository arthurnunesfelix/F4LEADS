"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, CheckCircle2, Clock3, Inbox, Loader2, Plus, XCircle } from "lucide-react";
import { LeadModal } from "./lead-modal";
import { avatarGradient, formatBRLCompact, formatDateShort, initials } from "@/lib/format";
import { STATUS_META, type Lead, type LeadStatus } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;

const COLUMNS: { status: LeadStatus; icon: typeof Clock3 }[] = [
  { status: "pending", icon: Clock3 },
  { status: "purchased", icon: CheckCircle2 },
  { status: "refused", icon: XCircle },
];

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */
function LeadCard({ lead, overlay }: { lead: Lead; overlay?: boolean }) {
  return (
    <div
      className={`group relative rounded-2xl border p-4 transition-colors ${
        overlay
          ? "rotate-2 border-accent/40 bg-panel2 shadow-2xl shadow-black/60"
          : "border-white/[0.07] bg-panel2 hover:border-white/[0.16]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br text-[11px] font-bold text-ink ${avatarGradient(lead.name)}`}
        >
          {initials(lead.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-100">{lead.name}</p>
          {lead.company && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-zinc-500">
              <Building2 className="h-3 w-3 shrink-0" /> {lead.company}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-display text-sm font-bold text-white">{formatBRLCompact(lead.value)}</span>
        <span className="text-[10px] font-medium tracking-wide text-zinc-600 uppercase">{lead.source ?? "Outro"}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-600">
        <span>{formatDateShort(lead.createdAt)}</span>
        <span className="opacity-0 transition-opacity group-hover:opacity-100">Arraste para mover</span>
      </div>
    </div>
  );
}

function DraggableCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ touchAction: "none" }}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? "opacity-30" : ""}`}
    >
      <LeadCard lead={lead} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Coluna                                                              */
/* ------------------------------------------------------------------ */
function KanbanColumn({
  status,
  leads,
  onAdd,
}: {
  status: LeadStatus;
  leads: Lead[];
  onAdd: (status: LeadStatus) => void;
}) {
  const meta = STATUS_META[status];
  const Icon = COLUMNS.find((c) => c.status === status)!.icon;
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const total = leads.reduce((acc, l) => acc + l.value, 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[420px] flex-col rounded-3xl border p-3 transition-colors sm:p-4 ${
        isOver ? "border-accent/40 bg-accent/[0.05]" : "border-white/[0.06] bg-white/[0.015]"
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5 px-1">
        <div
          className="grid h-8 w-8 place-items-center rounded-lg border"
          style={{ borderColor: `${meta.color}44`, background: meta.soft, color: meta.color }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-bold text-white">
            {meta.plural}
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
              style={{ background: meta.soft, color: meta.color }}
            >
              {leads.length}
            </span>
          </p>
          <p className="text-[11px] text-zinc-600">{formatBRLCompact(total)}</p>
        </div>
        <button
          onClick={() => onAdd(status)}
          className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white"
          aria-label={`Adicionar em ${meta.label}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Cards */}
      <div className="scroll-thin flex-1 space-y-3 overflow-y-auto pr-0.5">
        <AnimatePresence initial={false}>
          {leads.map((lead, i) => (
            <motion.div
              key={lead.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3), ease: EASE }}
            >
              <DraggableCard lead={lead} />
            </motion.div>
          ))}
        </AnimatePresence>

        {leads.length === 0 && (
          <div className="grid h-32 place-items-center rounded-2xl border border-dashed border-white/[0.08] text-center">
            <div className="flex flex-col items-center gap-2 text-zinc-700">
              <Inbox className="h-5 w-5" />
              <p className="text-xs">Arraste cards para cá</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Board                                                               */
/* ------------------------------------------------------------------ */
export function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<LeadStatus>("pending");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/leads", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeads(data.leads as Lead[]);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener("leadflow:refresh", onRefresh);
    return () => window.removeEventListener("leadflow:refresh", onRefresh);
  }, [load]);

  const grouped = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = { pending: [], purchased: [], refused: [] };
    for (const lead of leads) map[lead.status].push(lead);
    return map;
  }, [leads]);

  function handleDragStart(event: DragStartEvent) {
    setActiveLead((event.active.data.current as { lead: Lead }).lead);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const lead = activeLead;
    setActiveLead(null);
    if (!lead || !event.over) return;

    const next = event.over.id as LeadStatus;
    if (next === lead.status || !["pending", "purchased", "refused"].includes(next)) return;

    const previous = leads;
    setLeads((list) => list.map((l) => (l.id === lead.id ? { ...l, status: next } : l)));
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setLeads(previous);
    }
  }

  function handleAdd(status: LeadStatus) {
    setModalStatus(status);
    setModalOpen(true);
  }

  if (loading) {
    return (
      <div className="grid place-items-center gap-3 p-20 text-zinc-500">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
        <p className="text-sm">Montando o funil...</p>
      </div>
    );
  }

  if (error) {
    return <div className="card border-rose-400/25 p-10 text-center text-sm text-rose-300">Falha ao carregar o funil.</div>;
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((col) => (
            <KanbanColumn key={col.status} status={col.status} leads={grouped[col.status]} onAdd={handleAdd} />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 0.25, easing: "cubic-bezier(0.22,1,0.36,1)" }}>
          {activeLead ? <LeadCard lead={activeLead} overlay /> : null}
        </DragOverlay>
      </DndContext>

      <LeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        defaultStatus={modalStatus}
      />
    </>
  );
}
