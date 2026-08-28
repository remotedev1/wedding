import { z } from "zod";

export const TournamentStatus = {
  DRAFT: "DRAFT",
  REGISTRATION: "REGISTRATION",
  UPCOMING: "UPCOMING",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const TournamentVisibility = {
  PRIVATE: "PRIVATE",
  UNLISTED: "UNLISTED",
  PUBLIC: "PUBLIC",
};

const statusSchema = z.enum(Object.values(TournamentStatus));
const visibilitySchema = z.enum(Object.values(TournamentVisibility));

export const tournamentSchema = z
  .object({
    name: z.string().trim().min(3, "Tournament name must be at least 3 characters").max(150),
    shortName: z.string().trim().max(60).optional().nullable(),
    year: z.number().int().min(2000).max(2100),
    timezone: z.string().trim().min(3).max(80).default("Asia/Kolkata"),
    visibility: visibilitySchema.default(TournamentVisibility.PUBLIC),
    startDate: z.string().datetime("Invalid start date format"),
    endDate: z.string().datetime("Invalid end date format"),
    registrationDeadline: z.string().datetime().optional().nullable(),
    status: statusSchema,
    description: z.string().trim().max(1000).optional().nullable(),
    info: z.array(z.any()).max(20).optional(),
    images: z.array(z.string().url()).max(10).optional(),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["endDate"], message: "End date must be after start date" });
    }
    if (data.registrationDeadline) {
      const deadline = new Date(data.registrationDeadline);
      if (deadline >= start) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["registrationDeadline"], message: "Registration deadline must be before the tournament starts" });
      }
    }
  });

export const createTournamentSchema = tournamentSchema.extend({
  status: statusSchema.default(TournamentStatus.DRAFT).optional(),
});

export const updateTournamentSchema = z.object({
  name: z.string().trim().min(3).max(150).optional(),
  shortName: z.string().trim().max(60).optional().nullable(),
  year: z.number().int().min(2000).max(2100).optional(),
  timezone: z.string().trim().min(3).max(80).optional(),
  visibility: visibilitySchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  registrationDeadline: z.string().datetime().optional().nullable(),
  status: statusSchema.optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  info: z.array(z.any()).max(20).optional(),
  images: z.array(z.string().url()).max(10).optional(),
});

export const tournamentFilterSchema = z.object({
  search: z.string().optional(),
  status: statusSchema.optional(),
  visibility: visibilitySchema.optional(),
  year: z.number().int().optional(),
  sortBy: z.enum(["createdAt", "name", "year", "startDate"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});
