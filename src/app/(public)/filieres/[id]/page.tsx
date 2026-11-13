"use client";

import { useParams } from "next/navigation";
import Research from "../../accueil/components/Research";
import ImageHandler from "../../components/ImageHandler";
import FiliereCatalogueSection from "../components/FiliereCatalogueSection";

const FilierePage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <div>
        <h1>Découvrez les épreuves de la {id}</h1>
        <p>
          Recherchez rapidement un sujet spécifique et téléchargez le fichier en
          un instant.
          <br />
          Notre interface fluide simplifie vos révisions avant l&apos;examen.
        </p>
        <Research />
      </div>
      <ImageHandler
        className="md:hidden"
        image_url="/images/accueil_span_page.jpeg"
        image_alt="Filière image en-tête"
      />
      <FiliereCatalogueSection />
    </div>
  );
};

export default FilierePage;
