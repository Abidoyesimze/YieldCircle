import { Hero } from "../app/components/home/hero"
import { HowItWorks } from "../app/components/home/how-it-works"
import WhyChoose from "../app/components/home/why-choose"
import KeyFeatures from "../app/components/home/key-features"
import { Footer } from "../app/components/layout/footer"

export default function HomePage() {
  return (
    <div>
      <Hero />
      <HowItWorks />
      <WhyChoose />
      <KeyFeatures />
      <Footer />
    </div>
  )
}
