import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

/**
 * Famille variable (axe de largeur `wdth` en plus du poids) : couvre nativement toutes les
 * graisses utilisees par le site, contrairement a l'ancien Poppins charge avec une liste figee
 * qui omettait les graisses reellement utilisees en CSS (200 jamais charge, 700 absent).
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://esgis-epreuves.vercel.app",
  ),
  title: "Alexandria",
  description:
    "Consultez et téléchargez les épreuves d'examens et devoirs de l'ESGIS.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${archivo.variable} h-full antialiased`}>
      <body
        suppressHydrationWarning
        className="bg-background-default flex min-h-full flex-col"
      >
        {children}
      </body>
    </html>
  );
}
