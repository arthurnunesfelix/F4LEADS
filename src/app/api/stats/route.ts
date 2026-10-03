import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { leads } from "@/db/schema";
import { serializeLead } from "@/lib/serialize";
import type { MonthlyBucket, Stats } from "@/lib/types";

export const dynamic = "force-dynamic";

const MONTH_LABELS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export async function GET() {
  try {
    const rows = await getDb().select().from(leads);
    const all = rows.map(serializeLead);

    const pending = all.filter((l) => l.status === "pending");
    const purchased = all.filter((l) => l.status === "purchased");
    const refused = all.filter((l) => l.status === "refused");

    const sum = (list: typeof all) => list.reduce((acc, l) => acc + l.value, 0);

    const pipeline = sum(pending);
    const revenue = sum(purchased);
    const decided = purchased.length + refused.length;

    const now = new Date();
    const newThisMonth = all.filter((l) => {
      const d = new Date(l.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    // Last 6 months buckets
    const monthly: MonthlyBucket[] = [];
    for (let i = 5; i >= 0; i--) {
      const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${ref.getFullYear()}-${ref.getMonth()}`;
      const inMonth = (iso: string) => {
        const d = new Date(iso);
        return `${d.getFullYear()}-${d.getMonth()}` === key;
      };
      const won = purchased.filter((l) => inMonth(l.updatedAt));
      monthly.push({
        key,
        label: MONTH_LABELS[ref.getMonth()],
        revenue: sum(won),
        won: won.length,
        total: all.filter((l) => inMonth(l.createdAt)).length,
      });
    }

    const sourceMap = new Map<string, number>();
    for (const lead of all) {
      const name = lead.source || "Outro";
      sourceMap.set(name, (sourceMap.get(name) ?? 0) + 1);
    }
    const sources = [...sourceMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const recent = [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

    const stats: Stats = {
      total: all.length,
      pending: { count: pending.length, value: pipeline },
      purchased: { count: purchased.length, value: revenue },
      refused: { count: refused.length, value: sum(refused) },
      pipeline,
      revenue,
      conversion: all.length ? Math.round((purchased.length / all.length) * 100) : 0,
      winRate: decided ? Math.round((purchased.length / decided) * 100) : 0,
      avgTicket: purchased.length ? Math.round(revenue / purchased.length) : 0,
      newThisMonth,
      monthly,
      sources,
      recent,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: "Falha ao carregar estatísticas" }, { status: 500 });
  }
}
