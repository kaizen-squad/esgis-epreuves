/**
 * En-tete court de l'accueil (R-15) : juste assez pour situer la page avant la recherche, qui
 * doit rester visible sans defiler. Le hero marketing, la photo decorative et le bouton
 * "Voir le catalogue" (deja atteignable depuis la recherche et les filieres plus bas) sont
 * retires : ils poussaient la recherche hors de l'ecran.
 */
const WelcomeSection = () => (
  <div className="px-6 pt-8 pb-2 text-center">
    <h1 className="sub-title">Alexandria</h1>
    <h2 className="head-title">Trouve ton épreuve en quelques secondes</h2>
  </div>
);

export default WelcomeSection;
