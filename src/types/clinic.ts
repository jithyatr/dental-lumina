export interface Stat {
  value: string;
  label: string;
}

export interface TreatmentStep {
  title: string;
  description: string;
}

export interface Differentiator {
  title: string;
  description: string;
}

export interface BeforeAfterCase {
  tag: string;
  title: string;
  subtitle: string;
  beforeImage: string;
  afterImage: string;
}

export interface ImplantOption {
  iconName?: string;
  title: string;
  description: string;
}

export interface WhyChoosePillar {
  title: string;
  description: string;
  image?: string;
}

export interface SimulatorStep {
  title: string;
  description: string;
}

export interface Benefit {
  title: string;
  description: string;
}

export interface BookingLocation {
  name: string;
  address: string;
  hours: string;
}

export interface BookingService {
  iconName?: string;
  name: string;
  subtitle: string;
  duration: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PaymentOption {
  iconName?: string;
  title: string;
  description: string;
  badge?: string;
}

export interface FooterColumn {
  title: string;
  items: string[];
}

export interface Review {
  name: string;
  text: string;
  rating?: number;
  headline?: string;
}

export interface ClinicInfo {
  name: string;
  tagline?: string;
  city?: string;
  phone?: string;
  hours?: string;
  address?: string;

  logoPath?: string;
  logoIsLight?: boolean;

  heroHeadline?: string;
  heroSubtitle?: string;
  heroCta?: string;
  heroImagePath?: string;
  heroAssurances?: string[];

  navLinks?: string[];
  bookingCta?: string;

  stats?: Stat[];

  commonSymptoms?: string[];
  symptomCheckerHeadline?: string;
  symptomCheckerSubheading?: string;

  beforeAfterHeadline?: string;
  beforeAfterSubheading?: string;
  beforeAfterCases?: BeforeAfterCase[];

  testimonialsHeadline?: string;
  testimonialsSubheading?: string;
  testimonialsCta?: string;

  implantOptionsLabel?: string;
  implantOptionsHeadline?: string;
  implantOptionsSubheading?: string;
  implantOptions?: ImplantOption[];

  whyChooseLabel?: string;
  whyChooseHeadline?: string;
  whyChooseSubheading?: string;
  whyChooseImagePath?: string;
  differentiators?: Differentiator[];
  whyChoosePillars?: WhyChoosePillar[];

  processHeadline?: string;
  processSubheading?: string;
  treatmentJourney?: TreatmentStep[];

  smileSimulatorHeadline?: string;
  smileSimulatorSubheading?: string;
  smileSimulatorGoals?: string[];
  smileSimulatorSteps?: SimulatorStep[];

  benefitsHeadline?: string;
  benefitsImagePath?: string;
  benefits?: Benefit[];

  bookingHeadline?: string;
  bookingSubheading?: string;
  bookingLocations?: BookingLocation[];
  bookingServices?: BookingService[];
  bookingTimeSlots?: string[];

  faqLabel?: string;
  faqHeadline?: string;
  faqSubheading?: string;
  faqCta?: string;
  faqItems?: FaqItem[];

  paymentHeadline?: string;
  paymentSubheading?: string;
  insuranceProviders?: string[];
  paymentOptions?: PaymentOption[];

  footerAbout?: string;
  footerColumns?: FooterColumn[];
  footerCopyright?: string;

  voiceoverPath?: string;
  voiceoverScript?: string;
}

export interface DoctorInfo {
  name: string;
  credentials?: string;
  bio: string;
  yearsOfExperience?: number;
  photoPath?: string;
  specialistPortraitPath?: string;
  specialistLabel?: string;
  specialistCredentials?: string[];
}

export type TemplateKind = "implants" | "family-dentistry" | "dentist-landing";

export interface ClinicConfig {
  clinic: ClinicInfo;
  doctor: DoctorInfo;
  reviews?: Review[];
  template?: TemplateKind;
}

export interface Branding {
  clinicName: string;
  doctorName?: string;
  logoSrc?: string;
  logoIsLight?: boolean;
  phone?: string;
  hours?: string;
}
