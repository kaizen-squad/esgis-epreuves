import { z } from "zod";

const favoriteSnapshotSchema = z.object({
  slug: z.string(),
  title: z.string(),
  field: z.string(),
  subject: z.string(),
  academicYear: z.string(),
  savedAt: z.string(),
});

const pinnedFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const classeurStateSchema = z.object({
  version: z.literal(1),
  favorites: z.record(z.string(), favoriteSnapshotSchema),
  pinnedField: pinnedFieldSchema.nullable(),
  lastVisits: z.record(z.string(), z.string()),
});
