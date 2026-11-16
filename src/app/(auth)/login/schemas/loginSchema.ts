import { z } from "zod";

const passwordRules = z
  .string()
  .min(8, "Le mot de passe doit avoir au moins 8 caractères")
  .regex(/[A-Z]/)
  .regex(/[1-9]/);

export const loginSchema = z.object({
  email: z.email(),
  password: passwordRules,
});
