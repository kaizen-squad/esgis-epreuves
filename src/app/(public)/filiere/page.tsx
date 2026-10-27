import CTACatalogue from "../accueil/components/CTACatalogue";
import Research from "../accueil/components/Research";
import PublicLayout from "../components/PublicLayout";
import FIliereCategories from "./components/FIliereCategories";

const Filiere = () => {
  return (
    <PublicLayout>
      <div className="text-center">
        <h1 className="text-text-secondary mb-6 text-center text-5xl font-semibold">
          Filtrez selon votre filière
        </h1>
        <p className="mb-6">
          Recherchez rapidement un sujet spécifique et téléchargez le fichier en
          un instant. <br />
          Notre interface fluide simplifie vos révisions avant l&apos;examen.
        </p>
      </div>
      <Research />
      <FIliereCategories />
      <CTACatalogue />
    </PublicLayout>
  );
};

export default Filiere;
