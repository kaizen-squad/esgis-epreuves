import DomainFilter from "./accueil/components/DomainFilter";
import RecentlyAdded from "./accueil/components/RecentlyAdded";
import Research from "./accueil/components/Research";
import WelcomeSection from "./accueil/components/WelcomeSection";
import PublicLayout from "./components/PublicLayout";

export default function Accueil() {
  return (
    <PublicLayout>
      <WelcomeSection />
      <Research />
      <RecentlyAdded />
      <DomainFilter />
    </PublicLayout>
  );
}
