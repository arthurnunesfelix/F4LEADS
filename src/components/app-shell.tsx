"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Columns3, LayoutDashboard, Menu, Users, X } from "lucide-react";

const NAV = [
  { href: "/", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/kanban", label: "Funil", icon: Columns3 },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 pt-7 pb-8">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-accent/40 shadow-[0_0_26px_rgba(249,115,22,0.5)]">
          <Image src="/images/logo.png" alt="Logo F4 LEADS" width={44} height={44} className="h-full w-full object-cover" priority />
        </div>
        <div>
          <p className="font-display text-lg font-bold tracking-tight text-white">
            <span className="text-accent">F4</span> LEADS
          </p>
          <p className="text-[11px] font-medium tracking-widest text-zinc-500 uppercase">CRM de Vendas</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.2em] text-zinc-600 uppercase">Menu</p>
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "text-white" : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.06]"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon
                className={`relative h-[18px] w-[18px] ${active ? "text-accent" : "text-zinc-600 group-hover:text-zinc-400"}`}
              />
              <span className="relative">{item.label}</span>
              {active && <span className="relative ml-auto h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer card */}
      <div className="p-4">
        <div className="card relative overflow-hidden p-4">
          <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-accent/15 blur-2xl" />
          <p className="relative font-display text-sm font-semibold text-white">Central do time</p>
          <p className="relative mt-1 text-xs leading-relaxed text-zinc-500">
            Arraste os cards no funil para atualizar o status de cada lead em segundos.
          </p>
          <div className="relative mt-3 flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-[10px] font-bold text-ink">
              AD
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-300">Admin</p>
              <p className="text-[10px] text-zinc-600">Conta Pro</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[420px] w-[420px] rounded-full bg-accent/[0.06] blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-[380px] w-[380px] rounded-full bg-indigo-500/[0.05] blur-[120px]" />
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/[0.06] bg-panel/80 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile topbar */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/[0.06] bg-ink/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-accent/40">
            <Image src="/images/logo.png" alt="Logo F4 LEADS" width={32} height={32} className="h-full w-full object-cover" />
          </div>
          <span className="font-display text-base font-bold text-white">
            <span className="text-accent">F4</span> LEADS
          </span>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-panel lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-5 right-4 grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-400"
                aria-label="Fechar menu"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="relative z-10 lg:pl-64">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-9">{children}</div>
      </main>
    </div>
  );
}
