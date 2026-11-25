/** Ajouter, modifier, remplacer : des ecrans utilitaires, pas des pages de contenu, donc pas le
 * `head-title` geant reserve a celles-ci. */
const ExamWelcomeSection = ({ title }: { title: string }) => {
  return (
    <div className="mb-6 text-center">
      <h1 className="section-title">{title}</h1>
    </div>
  );
};

export default ExamWelcomeSection;
