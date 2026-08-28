import { z } from "zod";

export const GameCategory = {
  MENS: "MENS", WOMENS: "WOMENS", JUNIOR: "JUNIOR", VETERANS: "VETERANS", MIXED: "MIXED",
  OPEN: "OPEN", KIDS: "KIDS", TEENS: "TEENS", ADULTS: "ADULTS", SENIORS: "SENIORS",
};

export const SportType = {
  FIELD_HOCKEY: "FIELD_HOCKEY", FOOTBALL: "FOOTBALL", CRICKET: "CRICKET", RELAY: "RELAY",
  BASKETBALL: "BASKETBALL", VOLLEYBALL: "VOLLEYBALL", KABADDI: "KABADDI", ATHLETICS: "ATHLETICS",
  BADMINTON: "BADMINTON", TABLE_TENNIS: "TABLE_TENNIS", TENNIS: "TENNIS", SQUASH: "SQUASH",
  CARROM: "CARROM", CHESS: "CHESS", THROWBALL: "THROWBALL", KHO_KHO: "KHO_KHO", SWIMMING: "SWIMMING",
  WRESTLING: "WRESTLING", BOXING: "BOXING", OTHER: "OTHER",
};

const nullablePositiveInt = z.number().int().positive().optional().nullable();

export const createGameSchema = z.object({
  sportType: z.nativeEnum(SportType),
  name: z.string().min(3, "Event name must be at least 3 characters").max(200),
  shortName: z.string().max(80).optional().nullable(),
  eventCode: z.string().max(50).optional().nullable(),
  format: z.string().max(100).optional().nullable(),
  category: z.nativeEnum(GameCategory),
  date: z.string().datetime(),
  registrationDeadline: z.string().datetime().optional().nullable(),
  registrationFee: z.number().min(0, "Fee cannot be negative"),
  matchDurationMinutes: z.number().int().min(10).max(1440).optional().nullable(),
  minimumRestMinutes: z.number().int().min(0).max(1440).optional().nullable(),
  teamSize: nullablePositiveInt,
  minRosterSize: nullablePositiveInt,
  maxRosterSize: nullablePositiveInt,
  minAge: z.number().int().min(0).max(120).optional().nullable(),
  maxAge: z.number().int().min(0).max(120).optional().nullable(),
  eligibilityCutoffDate: z.string().datetime().optional().nullable(),
  allowedGenders: z.array(z.enum(["MALE", "FEMALE", "OTHER"])).max(3).default([]),
  isActive: z.boolean().default(true),
  icon: z.string().max(10).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  rules: z.string().max(5000).optional().nullable(),
}).refine((data) => data.minAge == null || data.maxAge == null || data.minAge <= data.maxAge, {
  message: "Minimum age cannot exceed maximum age",
  path: ["maxAge"],
}).refine((data) => !data.minRosterSize || !data.maxRosterSize || data.minRosterSize <= data.maxRosterSize, {
  message: "Minimum roster size cannot exceed maximum roster size",
  path: ["maxRosterSize"],
});

export const updateGameSchema = createGameSchema.partial();

const categoryLabels = { MENS:"Men's", WOMENS:"Women's", JUNIOR:"Junior", VETERANS:"Veterans", MIXED:"Mixed", OPEN:"Open", KIDS:"Kids", TEENS:"Teens", ADULTS:"Adults", SENIORS:"Seniors" };
export const categoryConfig = Object.fromEntries(Object.values(GameCategory).map((value) => [value, { label: categoryLabels[value] || value, icon: "•", color: "bg-slate-100 text-slate-700" }]));

const sportLabels = { FIELD_HOCKEY:"Field Hockey", FOOTBALL:"Football", CRICKET:"Cricket", RELAY:"Relay", BASKETBALL:"Basketball", VOLLEYBALL:"Volleyball", KABADDI:"Kabaddi", ATHLETICS:"Athletics", BADMINTON:"Badminton", TABLE_TENNIS:"Table Tennis", TENNIS:"Tennis", SQUASH:"Squash", CARROM:"Carrom", CHESS:"Chess", THROWBALL:"Throwball", KHO_KHO:"Kho Kho", SWIMMING:"Swimming", WRESTLING:"Wrestling", BOXING:"Boxing", OTHER:"Other" };
const sportIcons = { FIELD_HOCKEY:"🏑", FOOTBALL:"⚽", CRICKET:"🏏", BASKETBALL:"🏀", VOLLEYBALL:"🏐", BADMINTON:"🏸", TABLE_TENNIS:"🏓", TENNIS:"🎾", ATHLETICS:"🏃", SWIMMING:"🏊", CHESS:"♟️", BOXING:"🥊" };
export const sportConfigExtended = Object.fromEntries(Object.values(SportType).map((value) => [value, { label: sportLabels[value] || value.replaceAll("_", " "), icon: sportIcons[value] || "🏅", color: "bg-slate-100 text-slate-700" }]));
