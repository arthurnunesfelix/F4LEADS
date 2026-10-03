export type LeadStatus = "pending" | "purchased" | "refused";

export interface Lead {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  value: number;
  status: LeadStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StatusBucket {
  count: number;
  value: number;
}

export interface MonthlyBucket {
  key: string;
  label: string;
  revenue: number;
  won: number;
  total: number;
}

export interface Stats {
  total: number;
  pending: StatusBucket;
  purchased: StatusBucket;
  refused: StatusBucket;
  pipeline: number;
  revenue: number;
  conversion: number;
  winRate: number;
  avgTicket: number;
  newThisMonth: number;
  monthly: MonthlyBucket[];
  sources: { name: string; count: number }[];
  recent: Lead[];
}

export const STATUS_META: Record<
  LeadStatus,
  {
    label: string;
    plural: string;
    color: string;
    soft: string;
    dotClass: string;
    textClass: string;
    chipClass: string;
  }
> = {
  pending: {
    label: "Pendente",
    plural: "Pendentes",
    color: "#FBBF24",
    soft: "rgba(251,191,36,0.12)",
    dotClass: "bg-amber-400",
    textClass: "text-amber-300",
    chipClass: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  },
  purchased: {
    label: "Comprou",
    plural: "Compraram",
    color: "#4ADE80",
    soft: "rgba(74,222,128,0.12)",
    dotClass: "bg-emerald-400",
    textClass: "text-emerald-300",
    chipClass: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  },
  refused: {
    label: "Recusado",
    plural: "Recusados",
    color: "#FB7185",
    soft: "rgba(251,113,133,0.12)",
    dotClass: "bg-rose-400",
    textClass: "text-rose-300",
    chipClass: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  },
};

export const LEAD_SOURCES = [
  "Site",
  "Indicação",
  "Instagram",
  "Google Ads",
  "Facebook Ads",
  "WhatsApp",
  "LinkedIn",
  "Outro",
] as const;
