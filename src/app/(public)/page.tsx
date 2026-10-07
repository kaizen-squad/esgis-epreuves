import Research from "./acceuil/components/Research";
import WelcomeSection from "./acceuil/components/WelcomeSection";
import PublicLayout from "./components/PublicLayout";

export default function Accueil() {
  return (
    <PublicLayout>
      <WelcomeSection />
      <Research label="Des sujets gratuits et accessibles même  sans compte pour préparer vos exams ." />
    </PublicLayout>
  );
}
