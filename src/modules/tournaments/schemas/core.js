import { z } from "zod";

export const tournamentListQuerySchema=z.object({
  page:z.string().default("1"),
  limit:z.string().default("10"),
  search:z.string().optional(),
  sortBy:z.enum(["createdAt","name","year","startDate"]).default("createdAt"),
  sortOrder:z.enum(["asc","desc"]).default("desc"),
});

export const createTournamentSchema=z.object({
  name:z.string().trim().min(3).max(150),
  shortName:z.string().trim().max(60).optional().nullable(),
  year:z.number().int().min(2000).max(2100),
  timezone:z.string().trim().min(3).max(80).default("Asia/Kolkata"),
  visibility:z.enum(["PRIVATE","UNLISTED","PUBLIC"]).default("PUBLIC"),
  startDate:z.string().datetime(),
  endDate:z.string().datetime(),
  registrationDeadline:z.string().datetime().optional().nullable(),
  status:z.enum(["DRAFT","REGISTRATION","UPCOMING","ONGOING","COMPLETED","CANCELLED"]).default("DRAFT").optional(),
  description:z.string().trim().max(1000).optional().nullable(),
  info:z.array(z.any()).max(20).optional(),
  images:z.array(z.string().url()).max(10).optional(),
});

export const updateTournamentSchema=z.object({
  name:z.string().trim().min(3).max(150).optional(),
  shortName:z.string().trim().max(60).optional().nullable(),
  year:z.number().int().min(2000).max(2100).optional(),
  timezone:z.string().trim().min(3).max(80).optional(),
  visibility:z.enum(["PRIVATE","UNLISTED","PUBLIC"]).optional(),
  startDate:z.string().datetime().optional(),
  endDate:z.string().datetime().optional(),
  registrationDeadline:z.string().datetime().optional().nullable(),
  status:z.enum(["DRAFT","REGISTRATION","UPCOMING","ONGOING","COMPLETED","CANCELLED"]).optional(),
  description:z.string().trim().max(1000).optional().nullable(),
  info:z.array(z.any()).max(20).optional(),
  images:z.array(z.string().url()).max(10).optional(),
});

export const gameListQuerySchema=z.object({
  page:z.string().default("1"),limit:z.string().default("10"),search:z.string().optional(),
  tournamentId:z.string().optional(),sportType:z.string().optional(),category:z.string().optional(),
  status:z.enum(["active","inactive"]).optional(),
  sortBy:z.enum(["name","date","createdAt","updatedAt","sportType","category"]).default("name"),
  sortOrder:z.enum(["asc","desc"]).default("asc"),
});

export const createGameSchema=z.object({
  tournamentId:z.string().min(1),sportType:z.string().min(1),
  name:z.string().min(2).max(200),format:z.string().max(100).optional().nullable(),
  category:z.string().min(1),
  date:z.string().datetime().transform(v=>new Date(v)).or(z.date()),
  registrationDeadline:z.string().datetime().transform(v=>new Date(v)).or(z.date()).optional().nullable(),
  registrationFee:z.number().min(0).default(0),
  shortName:z.string().trim().max(80).optional().nullable(),
  eventCode:z.string().trim().max(50).optional().nullable(),
  matchDurationMinutes:z.number().int().min(10).max(1440).optional().nullable(),
  minimumRestMinutes:z.number().int().min(0).max(1440).optional().nullable(),
  teamSize:z.number().int().min(1).max(100).optional().nullable(),
  minRosterSize:z.number().int().min(1).max(200).optional().nullable(),
  maxRosterSize:z.number().int().min(1).max(200).optional().nullable(),
  minAge:z.number().int().min(0).max(120).optional().nullable(),
  maxAge:z.number().int().min(0).max(120).optional().nullable(),
  eligibilityCutoffDate:z.string().datetime().transform(v=>new Date(v)).or(z.date()).optional().nullable(),
  allowedGenders:z.array(z.enum(["MALE","FEMALE","OTHER"])).max(3).optional().default([]),
  isActive:z.boolean().default(true),icon:z.string().max(10).optional().nullable(),
  description:z.string().max(2000).optional().nullable(),rules:z.string().max(5000).optional().nullable(),
});
export const updateGameSchema=z.object({
  sportType:z.string().optional(),name:z.string().min(2).max(200).optional(),
  format:z.string().max(100).optional().nullable(),category:z.string().min(1).optional(),
  date:z.string().datetime().transform(v=>new Date(v)).or(z.date()).optional(),
  registrationDeadline:z.string().datetime().transform(v=>new Date(v)).or(z.date()).optional().nullable(),
  registrationFee:z.number().min(0).optional(),shortName:z.string().trim().max(80).optional().nullable(),
  eventCode:z.string().trim().max(50).optional().nullable(),matchDurationMinutes:z.number().int().min(10).max(1440).optional().nullable(),
  minimumRestMinutes:z.number().int().min(0).max(1440).optional().nullable(),teamSize:z.number().int().min(1).max(100).optional().nullable(),
  minRosterSize:z.number().int().min(1).max(200).optional().nullable(),maxRosterSize:z.number().int().min(1).max(200).optional().nullable(),
  minAge:z.number().int().min(0).max(120).optional().nullable(),maxAge:z.number().int().min(0).max(120).optional().nullable(),
  eligibilityCutoffDate:z.string().datetime().transform(v=>new Date(v)).or(z.date()).optional().nullable(),
  allowedGenders:z.array(z.enum(["MALE","FEMALE","OTHER"])).max(3).optional(),
  isActive:z.boolean().optional(),icon:z.string().max(10).optional().nullable(),description:z.string().max(2000).optional().nullable(),rules:z.string().max(5000).optional().nullable(),
});

export const venueSchema=z.object({
  name:z.string().trim().min(2).max(120),shortName:z.string().trim().max(50).optional().nullable(),
  address:z.string().trim().max(300).optional().nullable(),capacity:z.number().int().min(0).max(500000).optional().nullable(),
  isActive:z.boolean().default(true),
});
export const updateVenueSchema=venueSchema.partial().extend({sortOrder:z.number().int().min(0).optional()});

export const fixtureGenerationSchema=z.object({
  gameId:z.string().min(1),startAt:z.string().datetime().transform(v=>new Date(v)),
  venues:z.array(z.string().trim().min(1).max(120)).min(1).max(20),
  poolCount:z.number().int().min(1).max(32).default(2),
  slotMinutes:z.number().int().min(30).max(360).optional(),
  restMinutes:z.number().int().min(0).max(240).default(30),
  assignPools:z.boolean().default(true),commit:z.boolean().default(false),
});

export const knockoutGenerationSchema=z.object({
  gameId:z.string().min(1),startAt:z.string().datetime(),
  venues:z.array(z.string().trim().min(1).max(120)).min(1).max(20),
  slotMinutes:z.number().int().min(30).max(240).default(90),
  preview:z.boolean().default(true),
});

export const schedulePatchSchema=z.object({
  matchId:z.string().min(1),scheduledOn:z.string().datetime().optional(),
  venueId:z.string().min(1).nullable().optional(),
  status:z.enum(["SCHEDULED","DELAYED","POSTPONED","CANCELLED"]).optional(),
  publicationStatus:z.enum(["DRAFT","PUBLISHED","HIDDEN"]).optional(),
  reason:z.string().trim().max(500).optional(),
}).refine(v=>v.scheduledOn!==undefined||v.venueId!==undefined||v.status!==undefined||v.publicationStatus!==undefined,{message:"No schedule changes supplied"});

export const scheduleBulkSchema=z.object({
  matchIds:z.array(z.string().min(1)).min(1).max(100),
  publicationStatus:z.enum(["DRAFT","PUBLISHED","HIDDEN"]),
});

export const createPlacementSchema=z.object({
  familyId:z.string().min(1),gameId:z.string().min(1),
  placement:z.enum(["FIRST","SECOND","THIRD","FOURTH","FIFTH","SIXTH","SEVENTH","EIGHTH"]),
  prize:z.any().optional(),
});
