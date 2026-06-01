import { Navbar } from '@/components/marketing/navbar'
import { Hero } from '@/components/marketing/hero'
import { PainPoints } from '@/components/marketing/pain-points'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { FeaturesGrid } from '@/components/marketing/features-grid'
import { CtaSection } from '@/components/marketing/cta-section'
import { Footer } from '@/components/marketing/footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <PainPoints />
      <HowItWorks />
      <FeaturesGrid />
      <CtaSection />
      <Footer />
    </div>
  )
}
