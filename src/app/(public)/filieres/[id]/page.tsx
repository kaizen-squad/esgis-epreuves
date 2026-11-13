"use client";

import { useParams } from "next/navigation";
import Research from "../../accueil/components/Research";
import ImageHandler from "../../components/ImageHandler";
import FiliereCatalogueSection from "../components/FiliereCatalogueSection";
import PublicLayout from "../../components/PublicLayout";
import CTACatalogue from "../../accueil/components/CTACatalogue";

const FilierePage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <PublicLayout>
      <div>
        <h1 className="head-title text-center">
          Découvrez les
          <br /> épreuves de la{" "}
          <span className="text-red-600 uppercase underline">{id}</span>
        </h1>
        <p className="text-center">
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
      <CTACatalogue />
    </PublicLayout>
  );
};

export default FilierePage;
