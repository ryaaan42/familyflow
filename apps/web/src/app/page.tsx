import { FinalCta } from "@/components/marketing/final-cta";
import { FaqSection } from "@/components/marketing/faq-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { ModulesSection } from "@/components/marketing/modules-section";
import { StepsSection } from "@/components/marketing/steps-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { ValueGrid } from "@/components/marketing/value-grid";

export default function HomePage() {
  return (
    <div className="px-4 py-5 md:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <MarketingHeader />
        <HeroSection />
        <ValueGrid />
        <ModulesSection />
        <StepsSection />
        <TestimonialsSection />
        <FaqSection />
        <FinalCta />
      </div>
    </div>
  );
}

