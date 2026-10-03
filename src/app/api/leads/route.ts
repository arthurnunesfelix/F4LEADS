import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { getDb } from "@/db";
import { leads } from "@/db/schema";
import { isValidStatus, serializeLead } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    const conditions = [];
    if (status && isValidStatus(status)) {
      conditions.push(eq(leads.status, status));
    }
    if (search) {
      const pattern = `%${search}%`;
      const searchCond = or(
        ilike(leads.name, pattern),
        ilike(leads.company, pattern),
        ilike(leads.email, pattern),
        ilike(leads.phone, pattern),
      );
      if (searchCond) conditions.push(searchCond);
    }

    const rows = await db
      .select()
      .from(leads)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(leads.createdAt));

    return NextResponse.json({ leads: rows.map(serializeLead) });
  } catch (error) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json({ error: "Falha ao carregar leads" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "O nome do lead é obrigatório" }, { status: 400 });
    }

    const value = Number(body.value);
    const row = await db
      .insert(leads)
      .values({
        name,
        company: typeof body.company === "string" && body.company.trim() ? body.company.trim() : null,
        email: typeof body.email === "string" && body.email.trim() ? body.email.trim() : null,
        phone: typeof body.phone === "string" && body.phone.trim() ? body.phone.trim() : null,
        source: typeof body.source === "string" && body.source.trim() ? body.source.trim() : "Outro",
        value: Number.isFinite(value) && value >= 0 ? value.toFixed(2) : "0",
        status: isValidStatus(body.status) ? body.status : "pending",
        notes: typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null,
      })
      .returning();

    return NextResponse.json({ lead: serializeLead(row[0]) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads error:", error);
    return NextResponse.json({ error: "Falha ao criar lead" }, { status: 500 });
  }
}
