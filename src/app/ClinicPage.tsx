import type {
  BookingLocation,
  BookingService,
  ClinicConfig,
} from "@/types/clinic";
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

function shortenForBooking(text: string): string {
  const firstSentence = text.split(/(?<=\.)\s+/)[0] ?? text;
  if (firstSentence.length <= 60) return firstSentence.replace(/\.$/, "");
  const truncated = firstSentence.slice(0, 60);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 30 ? truncated.slice(0, lastSpace) : truncated).replace(/[.,]$/, "");
}

export function ClinicPage({ config }: Readonly<{ config: ClinicConfig }>) {
  const { clinic, doctor, reviews } = config;

  const bookingLocations: BookingLocation[] | undefined =
    clinic.bookingLocations && clinic.bookingLocations.length > 0
      ? clinic.bookingLocations
      : clinic.address
        ? [
            {
              name: clinic.name,
              address: clinic.address,
              hours: clinic.hours ?? "Call for hours",
            },
          ]
        : undefined;

  const bookingServices: BookingService[] | undefined =
    clinic.bookingServices && clinic.bookingServices.length > 0
      ? clinic.bookingServices
      : clinic.implantOptions && clinic.implantOptions.length > 0
        ? clinic.implantOptions.map((opt) => ({
            iconName: opt.iconName,
            name: opt.title,
            subtitle: shortenForBooking(opt.description),
            duration: "30 min",
          }))
        : undefined;

  return (
    <>
      <div className="relative">
        <Navbar
          clinicName={clinic.name}
          doctorName={doctor.name}
          logoPath={clinic.logoPath}
          logoIsLight={clinic.logoIsLight}
          phone={clinic.phone}
          hours={clinic.hours}
          navLinks={clinic.navLinks}
          bookingCta={clinic.bookingCta}
        />
        <Hero clinic={clinic} doctor={doctor} services={bookingServices} />
      </div>
      <CounterStrip stats={clinic.stats} />
      <SymptomChecker
        symptoms={clinic.commonSymptoms}
        headline={clinic.symptomCheckerHeadline}
        subheading={clinic.symptomCheckerSubheading}
        phone={clinic.phone}
      />
      <BeforeAfter
        headline={clinic.beforeAfterHeadline}
        subheading={clinic.beforeAfterSubheading}
        cases={clinic.beforeAfterCases}
      />
      <Testimonials
        headline={clinic.testimonialsHeadline}
        subheading={clinic.testimonialsSubheading}
        cta={clinic.testimonialsCta}
        reviews={reviews}
        clinicName={clinic.name}
      />
      <ImplantOptions
        label={clinic.implantOptionsLabel}
        headline={clinic.implantOptionsHeadline}
        subheading={clinic.implantOptionsSubheading}
        options={clinic.implantOptions}
      />
      <Specialist doctor={doctor} />
      <SmileSimulator
        headline={clinic.smileSimulatorHeadline}
        subheading={clinic.smileSimulatorSubheading}
        goals={clinic.smileSimulatorGoals}
        steps={clinic.smileSimulatorSteps}
      />
      <WhyChoose
        label={clinic.whyChooseLabel}
        headline={clinic.whyChooseHeadline}
        subheading={clinic.whyChooseSubheading}
        clinicName={clinic.name}
        image={clinic.whyChooseImagePath}
        pillars={clinic.whyChoosePillars}
        differentiators={clinic.differentiators}
      />
      <Process
        headline={clinic.processHeadline}
        subheading={clinic.processSubheading}
        steps={clinic.treatmentJourney}
      />
      <Benefits
        headline={clinic.benefitsHeadline}
        items={clinic.benefits}
        image={clinic.benefitsImagePath}
      />
      <BookingWidget
        headline={clinic.bookingHeadline}
        subheading={clinic.bookingSubheading}
        locations={bookingLocations}
        services={bookingServices}
        timeSlots={clinic.bookingTimeSlots}
      />
      <Faq
        label={clinic.faqLabel}
        headline={clinic.faqHeadline}
        subheading={clinic.faqSubheading}
        cta={clinic.faqCta}
        items={clinic.faqItems}
      />
      <Payment
        headline={clinic.paymentHeadline}
        subheading={clinic.paymentSubheading}
        providers={clinic.insuranceProviders}
        options={clinic.paymentOptions}
      />
      <Footer
        clinicName={clinic.name}
        doctorName={doctor.name}
        logoPath={clinic.logoPath}
        logoIsLight={clinic.logoIsLight}
        address={clinic.address}
        phone={clinic.phone}
        hours={clinic.hours}
        about={clinic.footerAbout}
        columns={clinic.footerColumns}
        copyright={clinic.footerCopyright}
      />
      <div className="h-20 lg:hidden" aria-hidden />
      <MobileStickyCTA phone={clinic.phone} />
    </>
  );
}
