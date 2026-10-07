import Link from "next/link";
import { navLinks } from "../../constants/navLinks";
import { FiLinkedin } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-background-secondary rounded-t-4xl px-4 py-8 lg:px-10">
      <div className="flex flex-col justify-between lg:flex-row">
        <div className="mb-14">
          <h1 className="text-text-primary mb-5 text-xl font-semibold">
            Alexandria.
          </h1>
          <div className="bg-background-primary flex gap-4 rounded-full px-3 py-1">
            <input
              className="min-w-0 flex-1 outline-none"
              type="search"
              placeholder="Rechercher une épreuve"
            />
            <button
              className="bg-background-accent text-text-primary min-w-0 cursor-pointer rounded-full p-2"
              type="submit"
            >
              Rechercher
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-text-primary mb-5 text-2xl font-semibold">
            Navigation
          </h3>
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                className="text-text-primary text-lg"
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
        </div>
      </div>
      <div>
        <span className="text-text-primary flex items-center gap-4 text-xl font-extrabold">
          Kaizen Studio <FiLinkedin />
        </span>
      </div>
    </footer>
  );
};

export default Footer;
