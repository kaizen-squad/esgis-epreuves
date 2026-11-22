import ImageHandler from "@/components/ui/ImageHandler";

const ExamWelcomeSection = ({ title }: { title: string }) => {
  return (
    <div>
      <div className="text-center">
        <h1 className="head-title">{title}</h1>
        <p className="mb-6">
          Recherchez rapidement un sujet spécifique et téléchargez le fichier en
          un instant. Notre interface fluide simplifie vos révisions avant
          l&apos;examen.
        </p>
        <ImageHandler
          image_url="/images/accueil_span_page.jpeg"
          image_alt="Esgis Image Accueil"
          image_className="object-cover object-center"
        />
      </div>
    </div>
  );
};

export default ExamWelcomeSection;
