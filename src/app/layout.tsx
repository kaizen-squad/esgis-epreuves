import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "600", "800"],
});

export const metadata: Metadata = {
  title: "Alexandria",
  description:
    "Consultez et téléchargez les épreuves d'examens et devoirs de l'ESGIS.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${poppins.className} h-full antialiased`}>
      <body className="bg-background-default flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}
