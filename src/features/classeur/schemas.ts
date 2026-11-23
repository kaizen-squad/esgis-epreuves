import { z } from "zod";

const pinnedFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const classeurStateSchema = z.object({
  version: z.literal(1),
  pinnedField: pinnedFieldSchema.nullable(),
});
