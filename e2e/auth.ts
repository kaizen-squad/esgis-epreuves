import type { Page } from "@playwright/test";

/** Connexion via le formulaire reel de `/login` (#114) : jamais de contournement par cookie. */
export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
}
