import type { LeadRow } from "@/db/schema";
import type { Lead, LeadStatus } from "./types";

export function serializeLead(row: LeadRow): Lead {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    source: row.source,
    value: Number(row.value),
    status: row.status as LeadStatus,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const VALID_STATUSES: LeadStatus[] = ["pending", "purchased", "refused"];

export function isValidStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && (VALID_STATUSES as string[]).includes(value);
}
