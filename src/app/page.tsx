import { BeforeAfter } from "./components/BeforeAfter";
import { Benefits } from "./components/Benefits";
import { BookingWidget } from "./components/BookingWidget";
import { CounterStrip } from "./components/CounterStrip";
import { Faq } from "./components/Faq";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { MobileStickyCTA } from "./components/MobileStickyCTA";
import { ImplantOptions } from "./components/ImplantOptions";
import { Navbar } from "./components/Navbar";
import { Payment } from "./components/Payment";
import { Process } from "./components/Process";
import { SmileSimulator } from "./components/SmileSimulator";
import { Specialist } from "./components/Specialist";
import { SymptomChecker } from "./components/SymptomChecker";
import { Testimonials } from "./components/Testimonials";
import { WhyChoose } from "./components/WhyChoose";

export default function ImplantsServicePage() {
  return (
    <>
      <div className="relative">
        <Navbar />
        <Hero />
      </div>
      <CounterStrip />
      <SymptomChecker />
      <BeforeAfter />
      <Testimonials />
      <ImplantOptions />
      <Specialist />
      <SmileSimulator />
      <WhyChoose />
      <Process />
      <Benefits />
      <BookingWidget />
      <Faq />
      <Payment />
      <Footer />
      {/* spacer so the mobile sticky CTA doesn't cover footer content */}
      <div className="h-20 lg:hidden" aria-hidden />
      <MobileStickyCTA />
    </>
  );
}
