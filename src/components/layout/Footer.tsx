import Image from "next/image";
import Link from "next/link";
import { FaLinkedin, FaWhatsapp } from "@/components/icons";
import { getBdeContactHref } from "@/features/contact/queries";
import type { NavLink } from "./Navbar";

type FooterProps = {
  links: NavLink[];
};

/**
 * Bas de la couverture du classeur, sous la feuille de la page. Deux objets poses sur la meme
 * couverture marine : l'etiquette papier glissee dans son porte-etiquette (logo, rubriques,
 * contact) et le titre du classeur frappe a froid sur toute la largeur (`.cover-stamp` dans
 * `globals.css`), son point frappe a chaud en rouge comme la marque de la navigation.
 * "Nous contacter" vise le numero WhatsApp regle par le BDE (`/bde/reglages`).
 */
const Footer = async ({ links }: FooterProps) => {
  const contactHref = await getBdeContactHref();

  return (
    // `overflow-clip` : la boite de ligne du titre deborde sous sa ligne de base (zone des
    // jambages, vide ici) ; on la coupe sans creer de conteneur de defilement.
    <footer className="bg-background-secondary @container overflow-clip px-4 pt-10 lg:px-14 lg:pt-14">
      <div className="cover-slot rounded-[calc(var(--radius-card)+0.375rem)] p-1.5">
        <div className="bg-background-primary rounded-card shadow-card flex flex-col gap-6 bg-(image:--paper-grain) px-4 py-5 sm:px-5 md:flex-row md:items-center md:justify-between lg:px-8 lg:py-6">
          <Image
            src="/images/esgis-logo.png"
            alt="ESGIS"
            width={313}
            height={71}
            className="h-auto w-28 shrink-0"
          />

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <nav aria-label="Navigation du pied de page">
              <ul className="flex flex-wrap gap-x-4 gap-y-2 sm:gap-x-6">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.link}
                      className="text-text-default hover:decoration-background-accent font-semibold underline decoration-transparent decoration-2 underline-offset-[0.4em] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-background-accent text-text-primary rounded-control inline-flex w-fit shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-[filter] hover:brightness-110"
            >
              <FaWhatsapp size={16} className="shrink-0" aria-hidden="true" />
              Nous contacter
            </a>
          </div>
        </div>
      </div>

      <div className="text-text-primary/70 mt-6 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p className="order-2 sm:order-1">
          © Copyright {new Date().getFullYear()}, tous droits réservés par
          Kaizen Studio.
        </p>
        <a
          href="https://www.linkedin.com/company/studio-kaizen-bj/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn de Kaizen Studio"
          className="text-text-primary order-1 flex items-center gap-2 text-base font-semibold tracking-tight transition-opacity hover:opacity-80 sm:order-2"
        >
          <FaLinkedin size={20} aria-hidden="true" />
          <span className="text-xl">By</span>
          <Image
            src="/images/kaizen-logo.png"
            alt="Kaizen"
            width={640}
            height={131}
            className="h-5 w-auto"
          />
        </a>
      </div>

      {/* Taille calee sur la largeur de la couverture (unites de conteneur) : le titre court
          toujours d'un bord a l'autre, de 320px au grand ecran, sans jamais etre tronque. */}
      <p
        aria-hidden="true"
        className="cover-stamp pointer-events-none mt-4 -ml-[0.04em] text-[19.5cqw] leading-[0.8] font-extrabold tracking-tighter whitespace-nowrap select-none"
      >
        Alexandria<span className="cover-stamp-foil">.</span>
      </p>
    </footer>
  );
};

export default Footer;
