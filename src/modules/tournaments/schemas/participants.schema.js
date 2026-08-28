import { z } from "zod";
import { SportType, sportConfigExtended } from "@/modules/tournaments/schemas/games.schema";

export { SportType };

export const registerParticipantSchema = z.object({
  familyId: z.string().min(1, "Family is required"),
  sports: z.array(z.nativeEnum(SportType)).min(1, "At least one sport is required"),
  pool: z.string().trim().min(1).max(32).optional(),
  registeredBy: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const updateParticipantSchema = z.object({
  sports: z.array(z.nativeEnum(SportType)).optional(),
  pool: z.string().trim().min(1).max(32).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const bulkImportParticipantsSchema = z.object({
  participants: z.array(z.object({
    familyId: z.string(),
    sports: z.array(z.nativeEnum(SportType)),
    pool: z.string().trim().min(1).max(32).optional(),
  })),
});

export const sportConfig = sportConfigExtended;

export function poolConfig(pool) {
  const value = String(pool || "").trim();
  return { label: value ? `Pool ${value}` : "No pool", color: "bg-slate-100 text-slate-700" };
}
