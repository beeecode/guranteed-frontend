import { AchievementsSection } from '@/features/site/home/AchievementsSection';
import { ActivitiesSection } from '@/features/site/home/ActivitiesSection';
import { AdmissionsCtaSection } from '@/features/site/home/AdmissionsCtaSection';
import { CbtCtaSection } from '@/features/site/home/CbtCtaSection';
import { HeroSection } from '@/features/site/home/HeroSection';
import { JourneySection } from '@/features/site/home/JourneySection';
import { SchoolLifeSection } from '@/features/site/home/SchoolLifeSection';
import { TestimonialsSection } from '@/features/site/home/TestimonialsSection';

export default function HomePage() {
  return (
    // The hero's floating cards overhang the viewport edge; clip them as before.
    <div className="overflow-x-hidden">
      <HeroSection />
      <AchievementsSection />
      <ActivitiesSection />
      <JourneySection />
      <SchoolLifeSection />
      <TestimonialsSection />
      <CbtCtaSection />
      <AdmissionsCtaSection />
    </div>
  );
}
