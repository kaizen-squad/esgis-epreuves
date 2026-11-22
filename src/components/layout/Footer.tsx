import Link from "next/link";
import type { NavLink } from "./Navbar";

type FooterProps = {
  links: NavLink[];
};

const RESOURCE_LINKS: NavLink[] = [
  { name: "Espace BDE", link: "/bde" },
  { name: "Catalogue", link: "/catalogue" },
];

const Footer = ({ links }: FooterProps) => {
  return (
    <footer className="bg-background-secondary rounded-t-4xl px-4 py-8 lg:px-10">
      <div className="flex flex-col justify-between lg:flex-row">
        <div className="mb-14">
          <h1 className="text-text-primary mb-2 text-xl font-semibold tracking-tight">
            Alexandria<span className="text-background-accent">.</span>
          </h1>
          <p className="text-text-primary/70 mb-5 text-sm">
            Une initiative du BDE ESGIS.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-text-primary mb-5 text-2xl font-semibold">
            Navigation
          </h3>
          <div className="flex flex-col gap-5">
            {links.map((link) => (
              <Link
                key={link.name}
                className="text-text-primary text-lg transition-opacity hover:opacity-75"
                href={link.link}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-text-primary mb-5 text-2xl font-semibold">
            Ressources
          </h3>
          <div className="flex flex-col gap-5">
            {RESOURCE_LINKS.map((link) => (
              <Link
                key={link.name}
                className="text-text-primary text-lg transition-opacity hover:opacity-75"
                href={link.link}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
