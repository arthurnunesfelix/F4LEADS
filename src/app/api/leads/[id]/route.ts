import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { leads } from "@/db/schema";
import { isValidStatus, serializeLead } from "@/lib/serialize";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const db = getDb();
    const { id } = await context.params;
    const body = await request.json();

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
    if (body.company !== undefined) updates.company = body.company?.trim() || null;
    if (body.email !== undefined) updates.email = body.email?.trim() || null;
    if (body.phone !== undefined) updates.phone = body.phone?.trim() || null;
    if (typeof body.source === "string" && body.source.trim()) updates.source = body.source.trim();
    if (body.notes !== undefined) updates.notes = body.notes?.trim() || null;
    if (isValidStatus(body.status)) updates.status = body.status;
    if (body.value !== undefined) {
      const value = Number(body.value);
      if (Number.isFinite(value) && value >= 0) updates.value = value.toFixed(2);
    }

    const rows = await db.update(leads).set(updates).where(eq(leads.id, id)).returning();

    if (!rows.length) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ lead: serializeLead(rows[0]) });
  } catch (error) {
    console.error("PATCH /api/leads/[id] error:", error);
    return NextResponse.json({ error: "Falha ao atualizar lead" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const db = getDb();
    const { id } = await context.params;
    const rows = await db.delete(leads).where(eq(leads.id, id)).returning();

    if (!rows.length) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/leads/[id] error:", error);
    return NextResponse.json({ error: "Falha ao excluir lead" }, { status: 500 });
  }
}
