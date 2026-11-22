import Image from "next/image";

/**
 * En-tete court de l'accueil (R-15) : juste assez pour situer la page avant la recherche, qui
 * doit rester visible sans defiler. Le hero marketing, la photo decorative et le bouton
 * "Voir le catalogue" (deja atteignable depuis la recherche et les filieres plus bas) restent
 * retires : ils poussaient la recherche hors de l'ecran. La phrase illustree (session 6) reste
 * courte et masque ses vignettes sous lg pour ne pas repousser la recherche sur mobile.
 */
const WelcomeSection = () => (
  <div className="px-6 pt-8 pb-2 text-center">
    <h1 className="head-title">Trouve ton épreuve en quelques secondes</h1>
    <p className="text-text-default mt-4 text-lg md:text-2xl lg:text-3xl">
      Des annales{" "}
      <span className="relative hidden h-10 w-17.5 align-middle lg:inline-block">
        <Image
          src="/images/accueil_span_archives.jpg"
          alt=""
          className="rounded-full object-cover"
          fill
          sizes="70px"
        />
      </span>{" "}
      bien rangées, en accès libre, pour réviser{" "}
      <span className="relative hidden h-10 w-17.5 align-middle lg:inline-block">
        <Image
          src="/images/accueil_span_revision.jpg"
          alt=""
          className="rounded-full object-cover"
          fill
          sizes="70px"
        />
      </span>{" "}
      sereinement avant tes examens.
    </p>
  </div>
);

export default WelcomeSection;
