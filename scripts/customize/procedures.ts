import type { BeforeAfterCase, HeroAvatar, TemplateKind } from "../../src/types/clinic";

// Default before/after imagery is reused across procedure variants — only the
// labels (tag / title / subtitle) change per category. Keep these paths in
// sync with DEFAULT_CASES in src/app/components/BeforeAfter.tsx.
const BA_IMAGES: Array<Pick<BeforeAfterCase, "beforeImage" | "afterImage">> = [
  {
    beforeImage: "/images/smile-makeover-before.png",
    afterImage: "/images/smile-makeover-after.png",
  },
  {
    beforeImage: "/images/implant-placement-before.png",
    afterImage: "/images/implant-placement-after.png",
  },
  {
    beforeImage: "/images/whitening-before.png",
    afterImage: "/images/whitening-after.png",
  },
];

function ba(
  cases: Array<
    Pick<BeforeAfterCase, "tag" | "title" | "subtitle"> &
      Partial<Pick<BeforeAfterCase, "beforeImage" | "afterImage">>
  >,
): BeforeAfterCase[] {
  return cases.map((c, i) => {
    const fallback = BA_IMAGES[i % BA_IMAGES.length];
    return {
      tag: c.tag,
      title: c.title,
      subtitle: c.subtitle,
      beforeImage: c.beforeImage ?? fallback.beforeImage,
      afterImage: c.afterImage ?? fallback.afterImage,
    };
  });
}

export type ProcedureKey =
  | "pediatric-dentistry"
  | "veneers"
  | "dental-implants"
  | "invisalign"
  | "wisdom-teeth-removal"
  | "root-canal-therapy"
  | "all-on-4-dental-implants"
  | "full-mouth-restoration"
  | "emergency-dentistry";

export interface ProcedureSectionHeadlines {
  heroHeadline?: string;
  heroCta?: string;
  implantOptionsLabel?: string;
  implantOptionsHeadline?: string;
  implantOptionsSubheading?: string;
  whyChooseLabel?: string;
  whyChooseHeadline?: string;
  whyChooseSubheading?: string;
  processHeadline?: string;
  processSubheading?: string;
  benefitsHeadline?: string;
  faqLabel?: string;
  faqHeadline?: string;
  faqSubheading?: string;
  symptomCheckerHeadline?: string;
  symptomCheckerSubheading?: string;
  testimonialsHeadline?: string;
  testimonialsSubheading?: string;
  beforeAfterHeadline?: string;
  beforeAfterSubheading?: string;
  beforeAfterCases?: BeforeAfterCase[];
  smileSimulatorHeadline?: string;
  smileSimulatorSubheading?: string;
  bookingHeadline?: string;
  bookingSubheading?: string;
}

export interface ProcedureImageScenes {
  hero?: string;
  benefits?: string;
  whychoose?: string;
}

export interface PillarItem {
  title: string;
  description: string;
}

export interface Procedure {
  key: ProcedureKey;
  label: string;
  dentistTypes: string[];
  selectedProcedure: string;
  template: TemplateKind;
  focusBlurb: string;
  patientLanguage: string;
  sectionHeadlines: ProcedureSectionHeadlines;
  heroAssurances: string[];
  heroAvatars?: HeroAvatar[];
  whyChoosePillars: PillarItem[];
  smileSimulatorGoals: string[];
  commonSymptomsHint: string[];
  serviceCategoriesHint: PillarItem[];
  faqThemes: string[];
  journeyStages: string;
  imageScenes: ProcedureImageScenes;
}

export const PROCEDURES: Record<ProcedureKey, Procedure> = {
  "pediatric-dentistry": {
    key: "pediatric-dentistry",
    label: "Pediatric Dentistry",
    dentistTypes: ["Pediatric Dentist"],
    selectedProcedure: "Pediatric Dentistry",
    template: "family-dentistry",
    focusBlurb:
      "A pediatric dentistry practice focused exclusively on children — from a child's first tooth through the teenage years — with a gentle, fun, low-anxiety approach that builds lifelong healthy habits.",
    patientLanguage: "children and the parents who bring them",
    sectionHeadlines: {
      heroHeadline: "Gentle Dentistry\nKids Actually\nLook Forward To.",
      heroCta: "Book Your Child's Visit",
      implantOptionsLabel: "Pediatric Services",
      implantOptionsHeadline: "Specialized Dental Care for Growing Smiles",
      implantOptionsSubheading:
        "From a baby's first checkup to a teen's orthodontic readiness, we deliver every service in a way that feels safe, friendly, and age-appropriate.",
      whyChooseLabel: "Why Families Trust Us",
      whyChooseHeadline: "A Pediatric Practice Built Around Your Child's Comfort",
      whyChooseSubheading: "Every detail of our practice — from the waiting room toys to our gentle pace — is designed to make kids feel safe and parents feel reassured.",
      processHeadline: "Your Child's Visit, Step By Step",
      processSubheading:
        "A predictable, gentle visit helps anxious kids relax. Here's exactly what to expect, from waiting room to high-five on the way out.",
      benefitsHeadline: "Why Parents Choose Our Pediatric Practice",
      faqLabel: "Pediatric FAQ",
      faqHeadline: "What Parents Ask Us Most",
      symptomCheckerHeadline: "Tell Us What's Bothering Your Child",
      symptomCheckerSubheading:
        "Tap whichever issue sounds closest — we'll get back to you with the right next step for kids.",
      testimonialsHeadline: "What Parents Are Saying",
      testimonialsSubheading: "Honest words from families who trust us with their kids' smiles.",
      beforeAfterHeadline: "Healthy Smiles, Happy Kids",
      beforeAfterSubheading: "Real outcomes from gentle pediatric care — cavities healed, confidence restored, and smiles that stay healthy as your child grows.",
      beforeAfterCases: ba([
        {
          tag: "Pediatric",
          title: "Cavity Repair",
          subtitle: "Restored in a single gentle visit",
          beforeImage: "/images/smile-makeover-child-before.jpeg",
          afterImage: "/images/smile-makeover-child-after.jpeg",
        },
        {
          tag: "Preventive",
          title: "Sealant & Fluoride Plan",
          subtitle: "Cavities stopped before they start",
          beforeImage: "/images/implant-child-before.jpeg",
          afterImage: "/images/implant-child-after.jpeg",
        },
        {
          tag: "Cosmetic",
          title: "Chipped Tooth Repair",
          subtitle: "Same-day bonding, no tears",
          beforeImage: "/images/whitening-child-before.jpeg",
          afterImage: "/images/whitening-child-after.jpeg",
        },
      ]),
      smileSimulatorHeadline: "AI Pediatric\nSmile Checker",
      smileSimulatorSubheading: "Upload a photo of your child's smile and tell us what concerns you most. Our AI assessment will flag anything worth a closer look, in plain language for parents.",
      bookingHeadline: "Book Your Child's Visit",
      bookingSubheading: "Same-week appointments for new pediatric patients. Pick a time that works for your family.",
    },
    heroAssurances: ["Kid-friendly office", "Parents stay with kids", "Most insurances accepted"],
    heroAvatars: [
      { src: "/images/review-child-1.jpeg", name: "Emma R" },
      { src: "/images/review-child-2.jpeg", name: "Noah T" },
      { src: "/images/review-child-3.jpeg", name: "Liam S" },
      { src: "/images/review-child-4.jpeg", name: "Mia K" },
    ],
    whyChoosePillars: [
      { title: "Kid-Specialized Team", description: "Every team member is trained specifically for pediatric care, communication, and behavior guidance." },
      { title: "Tell-Show-Do Approach", description: "We explain every tool and step in kid-friendly language before we ever use it — no surprises, no fear." },
      { title: "Cavity-Prevention Focus", description: "Sealants, fluoride, and brushing coaching that stops cavities before they ever need a drill." },
      { title: "Special Needs Friendly", description: "Sensory-aware accommodations and extra time for kids who need a little more support to feel safe." },
    ],
    smileSimulatorGoals: [
      "Check a possible cavity",
      "First-visit prep for my child",
      "Worried about crooked teeth",
      "Chipped or knocked-out tooth",
      "Help with brushing habits",
    ],
    commonSymptomsHint: [
      "First Tooth Visit",
      "Cavity in Baby Tooth",
      "Tooth Pain",
      "Chipped Baby Tooth",
      "Thumb Sucking",
      "Knocked-Out Tooth",
      "Pediatric Cleaning",
      "Sealants Needed",
      "Anxious About Dentist",
      "Special Needs Care",
    ],
    serviceCategoriesHint: [
      {
        title: "Gentle Pediatric Cleanings",
        description:
          "Kid-paced cleanings and exams designed to make brushing-and-flossing visits something children actually look forward to.",
      },
      {
        title: "Sealants & Fluoride",
        description:
          "Preventive sealants and fluoride treatments that shield growing teeth from cavities during the highest-risk childhood years.",
      },
      {
        title: "Kid-Friendly Fillings",
        description:
          "When a cavity needs treatment, we use child-sized tools, tell-show-do techniques, and the gentlest options available.",
      },
      {
        title: "Special Needs Dentistry",
        description:
          "Extra time, sensory-aware accommodations, and a calm clinical pace for kids who need a little more support to feel safe.",
      },
    ],
    faqThemes: [
      "When should my child's first dental visit happen",
      "How do you handle anxious or scared kids",
      "Do you offer laughing gas or sedation for children",
      "What if my child knocks out a baby tooth",
      "Do you accept pediatric dental insurance / CHIP",
      "Are dental sealants safe for my child",
    ],
    journeyStages:
      "The 6 stages for a pediatric practice are: (1) warm welcome & happy-visit tour of the office, (2) gentle first exam and parent consultation, (3) cleaning, fluoride, and brushing coaching tailored to the child's age, (4) treatment of cavities or repair work using tell-show-do and child-sized tools, (5) preventive add-ons like sealants or mouthguards, (6) ongoing 6-month checkups that grow with the child through the teen years.",
    imageScenes: {
      hero: "bright, cheerful pediatric dental office interior with warm pastel accents and a kid-friendly waiting area visible in the background",
      benefits:
        "gentle consultation moment between a pediatric dentist and a young child patient (school-age, roughly 6-10 years old). The child sits opposite the dentist holding a stuffed animal or a small dental model. CRITICAL: the child must be shown from the SIDE or BACK only — no front-facing portrait, no face features visible to camera, just the back of the head, profile, or shoulder. The child's smaller scale should be clearly readable.",
      whychoose:
        "warm pediatric operatory with colorful but tasteful kid-friendly decor, a tablet showing tooth illustrations, and an empty child-sized chair",
    },
  },

  veneers: {
    key: "veneers",
    label: "Veneers",
    dentistTypes: ["Cosmetic Dentist"],
    selectedProcedure: "Veneers",
    template: "dentist-landing",
    focusBlurb:
      "A cosmetic dentistry practice specializing in porcelain veneers — custom smile makeovers that transform discolored, chipped, or uneven teeth into natural-looking, durable results.",
    patientLanguage: "adults seeking a confident, camera-ready smile",
    sectionHeadlines: {
      heroHeadline: "Custom Veneers.\nNatural Smiles.\nReal Confidence.",
      heroCta: "Book a Smile Consultation",
      implantOptionsLabel: "Smile Makeover Services",
      implantOptionsHeadline: "Cosmetic Solutions Centered on Veneers",
      implantOptionsSubheading:
        "Whether you want one chipped front tooth corrected or a full smile redesigned, our veneer-focused services deliver natural, balanced results.",
      whyChooseLabel: "Why Choose Our Veneer Studio",
      whyChooseHeadline: "Hand-Crafted Veneers, Designed Around Your Face",
      whyChooseSubheading: "Every veneer case is designed with your facial proportions, skin tone, and personality in mind — never a one-shade-fits-all approach.",
      processHeadline: "Your Veneer Smile Journey",
      processSubheading:
        "From digital smile preview to your final reveal, here's how a custom veneer treatment unfolds — typically in just a few weeks.",
      benefitsHeadline: "Why Patients Choose Veneers Here",
      faqLabel: "Veneers FAQ",
      faqHeadline: "Common Questions About Porcelain Veneers",
      symptomCheckerHeadline: "What Would You Change About Your Smile?",
      symptomCheckerSubheading:
        "Pick the concerns that bother you most — we'll show you whether veneers (or another cosmetic option) would fix them.",
      testimonialsHeadline: "Real Smile Transformations",
      testimonialsSubheading: "Patients whose veneers gave them a smile they can finally feel proud of.",
      beforeAfterHeadline: "See Real Veneer Transformations",
      beforeAfterSubheading: "Side-by-side before and after photos of our actual patients — natural-looking porcelain veneers designed and placed in-house.",
      beforeAfterCases: ba([
        { tag: "Veneers", title: "Full Smile Veneer Set", subtitle: "10 porcelain veneers, 2 visits" },
        { tag: "Cosmetic", title: "Single-Tooth Veneer", subtitle: "Reshaped and matched in one appointment" },
        { tag: "Makeover", title: "Whitening + Veneer Combo", subtitle: "Brightened and refined in 3 weeks" },
      ]),
      smileSimulatorHeadline: "Preview Your\nNew Veneer Smile",
      smileSimulatorSubheading: "Upload a selfie and tell us what you'd like to change — our AI smile preview gives you a sense of how veneers could reshape, brighten, and balance your smile.",
      bookingHeadline: "Book Your Veneer Consultation",
      bookingSubheading: "Sit down with us, see a digital smile preview, and walk out with a clear plan and timeline.",
    },
    heroAssurances: ["Digital smile preview", "Custom porcelain shades", "Financing available"],
    whyChoosePillars: [
      { title: "Smile-Design First", description: "We design your full smile on screen before any tooth is touched, so you approve the look before we commit." },
      { title: "Hand-Layered Porcelain", description: "Premium porcelain shaped and stained by an artisan lab — never a generic, monolithic look." },
      { title: "Conservative Preparation", description: "We remove only what's needed and preserve as much natural tooth as possible for long-term health." },
      { title: "Long-Term Care Plan", description: "Custom nightguards, gentle hygiene visits, and aesthetic touch-ups that protect your investment." },
    ],
    smileSimulatorGoals: [
      "Whiter, brighter smile",
      "Fix chipped or uneven teeth",
      "Close gaps between teeth",
      "Reshape my smile",
      "Full smile makeover",
    ],
    commonSymptomsHint: [
      "Stained Teeth",
      "Chipped Front Tooth",
      "Gaps Between Teeth",
      "Worn Down Teeth",
      "Slightly Crooked Teeth",
      "Yellow Discoloration",
      "Uneven Tooth Shape",
      "Want Whiter Smile",
      "Old Bonding Failing",
      "Smile Makeover",
    ],
    serviceCategoriesHint: [
      {
        title: "Porcelain Veneers",
        description:
          "Custom-crafted porcelain shells bonded to the front of your teeth for a stain-resistant, lifelike smile that can last 10-15+ years.",
      },
      {
        title: "Composite Veneers",
        description:
          "Same-day cosmetic improvement using sculpted composite resin — a cost-friendly entry point into a refreshed smile.",
      },
      {
        title: "Digital Smile Design",
        description:
          "Preview your new smile on screen before any work begins, using mockups designed around your facial features and proportions.",
      },
      {
        title: "Veneer Maintenance",
        description:
          "Long-term care plans that protect your investment — gentle hygiene visits, nightguards when needed, and aesthetic touch-ups.",
      },
    ],
    faqThemes: [
      "How long do porcelain veneers last",
      "How many visits does veneer treatment take",
      "Veneers vs. crowns vs. bonding — what's right for me",
      "Will my teeth be ground down for veneers",
      "Do you offer financing for cosmetic dentistry",
      "Can I see what my new smile will look like first",
    ],
    journeyStages:
      "The 6 stages for a veneer practice are: (1) cosmetic consultation and smile analysis, (2) digital smile design preview and shade selection, (3) gentle preparation of teeth and impressions, (4) custom porcelain lab fabrication with temporary veneers, (5) bonding and final reveal, (6) follow-up adjustments and long-term care plan.",
    imageScenes: {
      hero: "elegant, upscale cosmetic dentistry consult room with a digital smile design screen and a clean modern aesthetic",
      benefits: "consultation moment with a tablet showing a smile design preview on a clean cosmetic-clinic desk",
      whychoose: "modern aesthetic operatory with a wall of porcelain shade tabs and a digital smile design on a screen",
    },
  },

  "dental-implants": {
    key: "dental-implants",
    label: "Dental Implants",
    dentistTypes: ["General Dentist", "Periodontist"],
    selectedProcedure: "Dental Implants",
    template: "implants",
    focusBlurb:
      "A practice focused on replacing missing or failing teeth with dental implants — permanent, titanium-rooted restorations that look, feel, and function like natural teeth.",
    patientLanguage: "adults with missing, failing, or already-extracted teeth",
    sectionHeadlines: {
      heroHeadline: "Strong, Natural,\nLong-Lasting\nDental Implants.",
      heroCta: "Book a Free Implant Consultation",
      implantOptionsLabel: "Implant Treatment Options",
      implantOptionsHeadline: "Dental Implant Solutions for Every Situation",
      implantOptionsSubheading:
        "From replacing a single missing tooth to rebuilding a full arch, our implant options give you a permanent, natural-feeling solution.",
      whyChooseLabel: "Why Choose Our Implant Team",
      whyChooseHeadline: "Experienced Implant Care, Start to Finish, Under One Roof",
      whyChooseSubheading: "From your first 3D scan to your final crown — every step handled in-house by a team that does implants every day.",
      processHeadline: "Your Dental Implant Journey",
      processSubheading:
        "Every implant case follows a careful, evidence-based path — from your first consultation to a fully restored bite. Here's what to expect.",
      benefitsHeadline: "Why Patients Choose Dental Implants",
      faqLabel: "Implant FAQ",
      faqHeadline: "Common Questions About Dental Implants",
      symptomCheckerHeadline: "Tell Us About Your Missing or Failing Teeth",
      symptomCheckerSubheading:
        "Tap whichever issue applies — we'll show you which implant solution makes the most sense for your situation.",
      testimonialsHeadline: "Implant Patient Stories",
      testimonialsSubheading: "Real patients sharing how dental implants gave them back the confidence to eat, speak, and smile.",
      beforeAfterHeadline: "See Real Implant Outcomes",
      beforeAfterSubheading: "Before-and-after photos from our own implant patients — from single-tooth replacement to full-arch restoration.",
      beforeAfterCases: ba([
        { tag: "Implants", title: "Single-Tooth Implant", subtitle: "Restored function in 3 months" },
        { tag: "Restoration", title: "Implant-Supported Bridge", subtitle: "Replaces 3 teeth on 2 implants" },
        { tag: "Cosmetic", title: "Front-Tooth Implant", subtitle: "Indistinguishable from natural" },
      ]),
      smileSimulatorHeadline: "Check Your\nImplant Candidacy",
      smileSimulatorSubheading: "Upload a photo of your smile and tell us about the missing teeth or failing restorations — our AI will outline which implant options likely fit your situation.",
      bookingHeadline: "Book Your Free Implant Consultation",
      bookingSubheading: "Include a 3D scan and treatment plan at no cost. Walk out knowing exactly what's possible.",
    },
    heroAssurances: ["Free consultation", "0% financing available", "In-house 3D imaging"],
    whyChoosePillars: [
      { title: "Surgical Precision", description: "Guided implant surgery planned from your CBCT scan for accurate, predictable placement and faster healing." },
      { title: "All Phases In-House", description: "Surgery, restoration, and lab work all under one roof — no juggling referrals between offices." },
      { title: "Permanent Solution", description: "Titanium implants fuse to your jawbone and last decades — not a temporary fix you'll have to redo." },
      { title: "Sedation Comfort Options", description: "Choose from nitrous, oral sedation, or IV sedation so your implant procedure feels easy and stress-free." },
    ],
    smileSimulatorGoals: [
      "Replace a missing tooth",
      "Replace several missing teeth",
      "Move away from dentures",
      "Save a failing tooth",
      "Full arch restoration",
    ],
    commonSymptomsHint: [
      "Missing Tooth",
      "Multiple Missing Teeth",
      "Loose Denture",
      "Failing Tooth Needs Extraction",
      "Bone Loss in Jaw",
      "Difficulty Chewing",
      "Embarrassed to Smile",
      "Old Bridge Failing",
      "Gum Disease",
      "Knocked-Out Tooth",
    ],
    serviceCategoriesHint: [
      {
        title: "Single Tooth Implant",
        description:
          "Replace one missing tooth with a titanium implant and custom crown — no impact on neighboring healthy teeth.",
      },
      {
        title: "Implant Bridge",
        description:
          "Two or more implants supporting a fixed bridge to restore multiple adjacent missing teeth in one stable solution.",
      },
      {
        title: "Full Arch / All-on-X",
        description:
          "A complete arch of permanent teeth supported by four to six implants — the modern alternative to traditional dentures.",
      },
      {
        title: "Implant-Supported Dentures",
        description:
          "Snap-in or fixed dentures anchored to implants for unmatched stability, comfort, and confidence while eating and speaking.",
      },
    ],
    faqThemes: [
      "How long does the entire implant process take",
      "How much do dental implants cost (and financing options)",
      "Am I a candidate if I have bone loss or gum disease",
      "How long do dental implants last",
      "Is implant surgery painful — what sedation do you offer",
      "Implants vs. bridge vs. denture — which is best",
    ],
    journeyStages:
      "The 6 stages for a dental-implants practice are: (1) initial consultation, 3D scan, and treatment planning, (2) preparation work (extractions, bone grafting, gum care if needed), (3) precise surgical placement of the titanium implant, (4) healing and osseointegration over several months, (5) abutment placement and final impressions, (6) delivery of the permanent crown / bridge / arch and long-term care plan.",
    imageScenes: {
      hero: "modern implant surgical consult room with a 3D dental cone-beam scan glowing on a large screen",
      benefits: "consultation moment with a titanium implant model and a tablet showing implant graphics on a clean desk",
      whychoose: "clean modern implant operatory with surgical-grade equipment, a CBCT machine in the background, and warm wood accents",
    },
  },

  invisalign: {
    key: "invisalign",
    label: "Invisalign",
    dentistTypes: ["Orthodontist"],
    selectedProcedure: "Invisalign",
    template: "dentist-landing",
    focusBlurb:
      "An orthodontic practice specializing in Invisalign clear aligner therapy — straightening teeth discreetly with custom, removable aligners instead of traditional metal braces.",
    patientLanguage: "teens and adults who want straight teeth without metal braces",
    sectionHeadlines: {
      heroHeadline: "Straight Teeth.\nNo Metal.\nNo Compromise.",
      heroCta: "Book Your Free Invisalign Scan",
      implantOptionsLabel: "Clear Aligner Services",
      implantOptionsHeadline: "Invisalign Treatment Options for Every Smile",
      implantOptionsSubheading:
        "From mild crowding to complex bite correction, our Invisalign-focused services straighten teeth without the look or hassle of metal braces.",
      whyChooseLabel: "Why Choose Our Invisalign Team",
      whyChooseHeadline: "Certified Invisalign Providers Who Plan Every Aligner Personally",
      whyChooseSubheading: "Every aligner in your treatment is reviewed by an orthodontist who actually understands tooth movement — not just a software preview.",
      processHeadline: "Your Invisalign Journey",
      processSubheading:
        "From your first 3D scan to your final retainer fitting, here's exactly how an Invisalign treatment plan unfolds — most cases finish in 6-18 months.",
      benefitsHeadline: "Why Patients Choose Invisalign Here",
      faqLabel: "Invisalign FAQ",
      faqHeadline: "Common Questions About Invisalign",
      symptomCheckerHeadline: "Tell Us About Your Smile",
      symptomCheckerSubheading:
        "Tap whichever describes your teeth — we'll show you whether Invisalign is a good fit (and how long it would likely take).",
      testimonialsHeadline: "Real Invisalign Transformations",
      testimonialsSubheading: "Teens and adults who chose Invisalign with us and walked away with the smile they wanted.",
      beforeAfterHeadline: "Real Invisalign Before & Afters",
      beforeAfterSubheading: "See actual patient results — straighter teeth, balanced bites, and a smile transformation that didn't require a single metal bracket.",
      beforeAfterCases: ba([
        { tag: "Invisalign", title: "Crowding Correction", subtitle: "Aligned in 9 months" },
        { tag: "Orthodontics", title: "Bite Realignment", subtitle: "Balanced occlusion in 12 months" },
        { tag: "Cosmetic", title: "Gap Closure", subtitle: "Front-teeth gap closed in 6 months" },
      ]),
      smileSimulatorHeadline: "Preview Your\nStraightened Smile",
      smileSimulatorSubheading: "Upload a selfie and pick your goals — our AI smile preview shows you a glimpse of what your teeth could look like after Invisalign.",
      bookingHeadline: "Book Your Free Invisalign Scan",
      bookingSubheading: "Includes a complimentary 3D iTero scan and a personalized treatment timeline. Walk out with a clear plan.",
    },
    heroAssurances: ["Free 3D iTero scan", "Flexible payment plans", "Most insurances accepted"],
    whyChoosePillars: [
      { title: "iTero 3D Planning", description: "Your full treatment is mapped out on a high-resolution 3D scanner — no putty, no guesswork." },
      { title: "Orthodontist-Reviewed", description: "Every aligner stage is reviewed by an orthodontist, not just auto-generated from software." },
      { title: "Discreet & Removable", description: "Clear aligners you can take out for meals, brushing, photos, and special occasions." },
      { title: "Retainers Included", description: "Your treatment ends with custom retainers and a long-term plan to protect your new smile." },
    ],
    smileSimulatorGoals: [
      "Fix crowded teeth",
      "Close gaps between teeth",
      "Correct my bite",
      "Straighten after old braces",
      "Get a confident smile",
    ],
    commonSymptomsHint: [
      "Crooked Teeth",
      "Crowded Teeth",
      "Gaps Between Teeth",
      "Overbite",
      "Underbite",
      "Crossbite",
      "Open Bite",
      "Want Straight Teeth",
      "Teen Wants Aligners",
      "Old Braces Relapsed",
    ],
    serviceCategoriesHint: [
      {
        title: "Invisalign Comprehensive",
        description:
          "Full-treatment clear aligners for adults addressing crowding, spacing, or bite correction — typically 12-18 months.",
      },
      {
        title: "Invisalign Teen",
        description:
          "Aligners designed for growing smiles, with compliance indicators and replacement aligners built in for active teen lifestyles.",
      },
      {
        title: "Invisalign Express",
        description:
          "Shorter aligner treatment (often 3-6 months) for minor crowding, relapse from prior orthodontics, or pre-cosmetic alignment.",
      },
      {
        title: "Retention & Whitening",
        description:
          "Custom retainers to protect your new smile, plus optional whitening that pairs perfectly with your clear aligner trays.",
      },
    ],
    faqThemes: [
      "How long does Invisalign take versus traditional braces",
      "How much does Invisalign cost, and is it covered by insurance",
      "How many hours a day do I have to wear my aligners",
      "Can Invisalign fix my specific bite issue",
      "Will Invisalign hurt or affect my speech",
      "What happens after treatment — do I need a retainer forever",
    ],
    journeyStages:
      "The 6 stages for an Invisalign practice are: (1) consultation and 3D iTero scan to preview your new smile, (2) custom treatment plan and aligner manufacturing, (3) first set of aligners delivered with wear-and-care coaching, (4) progress check-ins every 6-10 weeks to monitor tooth movement, (5) refinement aligners if needed for final fine-tuning, (6) custom retainers and long-term smile maintenance.",
    imageScenes: {
      hero: "modern orthodontic consult room with an iTero 3D scanner and a screen showing a clear-aligner treatment preview",
      benefits: "consultation moment with a clear aligner tray held up next to a digital smile preview on a tablet",
      whychoose: "bright modern ortho operatory with iTero scanning equipment and a clean minimalist palette",
    },
  },

  "wisdom-teeth-removal": {
    key: "wisdom-teeth-removal",
    label: "Wisdom Teeth Removal",
    dentistTypes: ["Oral & Maxillofacial Surgeon"],
    selectedProcedure: "Wisdom Teeth Removal",
    template: "dentist-landing",
    focusBlurb:
      "An oral & maxillofacial surgery practice focused on safe, comfortable wisdom teeth removal — from routine eruption cases to fully impacted third molars, with full sedation options.",
    patientLanguage: "teens, young adults, and the parents who schedule their procedure",
    sectionHeadlines: {
      heroHeadline: "Safe, Comfortable\nWisdom Teeth\nRemoval.",
      heroCta: "Book a Surgical Consultation",
      implantOptionsLabel: "Oral Surgery Services",
      implantOptionsHeadline: "Wisdom Teeth & Oral Surgery Options",
      implantOptionsSubheading:
        "From a single erupting wisdom tooth to all four impacted molars under IV sedation, our oral surgery options cover every scenario safely.",
      whyChooseLabel: "Why Choose Our Surgical Team",
      whyChooseHeadline: "Board-Certified Oral Surgery, With Sedation Done Right",
      whyChooseSubheading: "Hospital-grade IV sedation administered by anesthesia-trained specialists — most patients remember nothing about the procedure.",
      processHeadline: "Your Wisdom Teeth Procedure, Step By Step",
      processSubheading:
        "Most patients are home and resting within a few hours. Here's exactly what happens, from consultation through recovery.",
      benefitsHeadline: "Why Patients Trust Us for Wisdom Teeth Removal",
      faqLabel: "Wisdom Teeth FAQ",
      faqHeadline: "Common Questions About Wisdom Teeth Removal",
      symptomCheckerHeadline: "Tell Us What You're Feeling",
      symptomCheckerSubheading:
        "Tap whichever symptom describes you — wisdom-teeth issues often present in surprising ways, and we'll get back to you fast.",
      testimonialsHeadline: "What Our Surgical Patients Say",
      testimonialsSubheading: "Patients and parents who chose us for wisdom teeth removal and walked away calm, safe, and on the mend.",
      beforeAfterHeadline: "Outcomes You Can Trust",
      beforeAfterSubheading: "From routine eruption cases to deeply impacted teeth — safe, clean removals with predictable healing and minimal downtime.",
      beforeAfterCases: ba([
        { tag: "Surgery", title: "Routine Wisdom Removal", subtitle: "All four teeth, single visit" },
        { tag: "Recovery", title: "Impacted Tooth Extraction", subtitle: "Clean healing at 2-week follow-up" },
        { tag: "Comfort", title: "IV-Sedation Procedure", subtitle: "Anxiety-free, awake within minutes" },
      ]),
      smileSimulatorHeadline: "Wisdom Teeth\nQuick Check",
      smileSimulatorSubheading: "Upload a recent dental X-ray (or describe your symptoms) and our AI will help you understand whether your wisdom teeth likely need removal — and how soon.",
      bookingHeadline: "Book Your Wisdom Teeth Consultation",
      bookingSubheading: "Includes a panoramic X-ray and a clear plan for sedation, cost, and recovery. Most procedures scheduled within the same week.",
    },
    heroAssurances: ["IV sedation available", "In-house surgical suite", "Most insurances accepted"],
    whyChoosePillars: [
      { title: "Board-Certified Surgeons", description: "Oral & maxillofacial surgeons with the training to handle even the most complex impacted cases safely." },
      { title: "Real Sedation Options", description: "Nitrous, oral, or IV sedation administered by anesthesia-trained specialists — not just numbing shots." },
      { title: "Predictable Recovery", description: "Most patients eat soft food the same evening and are back to normal life within 3-4 days." },
      { title: "On-Call Support", description: "Our team is reachable after the procedure if you have questions during your recovery." },
    ],
    smileSimulatorGoals: [
      "Painful wisdom tooth",
      "Impacted or sideways tooth",
      "Pre-orthodontic extraction",
      "Routine wisdom teeth check",
      "Second opinion before surgery",
    ],
    commonSymptomsHint: [
      "Wisdom Tooth Pain",
      "Swollen Jaw",
      "Impacted Wisdom Tooth",
      "Bad Taste in Mouth",
      "Difficulty Opening Mouth",
      "Tooth Coming In Sideways",
      "Crowding from Wisdom Teeth",
      "Pain When Chewing",
      "Gum Infection in Back",
      "Pre-Braces Extraction Needed",
    ],
    serviceCategoriesHint: [
      {
        title: "Wisdom Teeth Removal",
        description:
          "Safe surgical removal of one to four wisdom teeth — including fully impacted, partially erupted, and routine cases.",
      },
      {
        title: "IV Sedation & Anesthesia",
        description:
          "Hospital-grade IV sedation administered by board-certified specialists, so most patients remember nothing about the procedure.",
      },
      {
        title: "Tooth Extraction & Bone Grafting",
        description:
          "Routine and complex extractions, with bone preservation grafts to keep future implant or restorative options open.",
      },
      {
        title: "Pre-Orthodontic Surgery",
        description:
          "Coordinated extractions and exposure procedures that set the stage for successful braces or Invisalign treatment.",
      },
    ],
    faqThemes: [
      "Do I really need my wisdom teeth removed",
      "What kind of sedation will I be under",
      "How long is recovery and when can I eat normally",
      "How much does wisdom teeth removal cost",
      "What if my wisdom teeth are impacted",
      "Will I need a ride home after the procedure",
    ],
    journeyStages:
      "The 6 stages for a wisdom-teeth / oral-surgery practice are: (1) consultation with panoramic X-ray or CBCT to assess each wisdom tooth, (2) sedation planning and pre-op medical review, (3) the procedure itself in our accredited surgical suite under your chosen sedation, (4) immediate post-op monitoring and discharge instructions, (5) first 72 hours of guided recovery with our team on call, (6) follow-up appointment to confirm clean healing and discuss next steps.",
    imageScenes: {
      hero: "modern oral surgery suite with a panoramic dental X-ray glowing on a large monitor and surgical-grade lighting",
      benefits: "consultation moment with a panoramic dental X-ray on a tablet showing wisdom teeth positions",
      whychoose: "calm modern oral surgery operatory with IV sedation equipment subtly visible and warm cabinetry",
    },
  },

  "root-canal-therapy": {
    key: "root-canal-therapy",
    label: "Root Canal Therapy",
    dentistTypes: ["Endodontist"],
    selectedProcedure: "Root Canal Therapy",
    template: "dentist-landing",
    focusBlurb:
      "An endodontic practice focused exclusively on saving teeth through modern root canal therapy — using surgical microscopes and gentle techniques to make treatment far more comfortable than its old reputation suggests.",
    patientLanguage: "adults with tooth pain, infections, or a referral for root canal treatment",
    sectionHeadlines: {
      heroHeadline: "Save Your Tooth.\nGentle, Modern\nRoot Canals.",
      heroCta: "Book a Same-Day Evaluation",
      implantOptionsLabel: "Endodontic Services",
      implantOptionsHeadline: "Root Canal & Tooth-Saving Treatments",
      implantOptionsSubheading:
        "Modern endodontic care — microscope-guided, comfortable, and focused on saving your natural tooth whenever possible.",
      whyChooseLabel: "Why Choose Our Endodontic Team",
      whyChooseHeadline: "Microscope-Guided Root Canals That Actually Feel Comfortable",
      whyChooseSubheading: "We use the same technology and techniques that have made modern root canals as routine — and as comfortable — as a filling.",
      processHeadline: "Your Root Canal, Step By Step",
      processSubheading:
        "Most modern root canals are completed in one or two visits and feel no different than getting a routine filling. Here's how it works.",
      benefitsHeadline: "Why Patients Trust Us With Root Canal Care",
      faqLabel: "Root Canal FAQ",
      faqHeadline: "Common Questions About Root Canal Therapy",
      symptomCheckerHeadline: "Tell Us What You're Feeling",
      symptomCheckerSubheading:
        "Tap whichever describes your symptoms — many of these are classic signs that root canal therapy can save your tooth.",
      testimonialsHeadline: "Patients Whose Teeth We Saved",
      testimonialsSubheading: "Real stories from patients who came in in pain, got their root canal here, and walked out with their natural tooth intact.",
      beforeAfterHeadline: "Saved Teeth, Real Outcomes",
      beforeAfterSubheading: "X-ray before-and-afters from real patients — the moment a painful, infected tooth becomes a healthy, restored one.",
      beforeAfterCases: ba([
        { tag: "Endodontics", title: "Molar Root Canal", subtitle: "Pain gone in a single visit" },
        { tag: "Restoration", title: "Root Canal + Crown", subtitle: "Tooth saved and rebuilt in 2 weeks" },
        { tag: "Retreatment", title: "Failed Root Canal Rescue", subtitle: "Re-treated and sealed cleanly" },
      ]),
      smileSimulatorHeadline: "Tooth Pain\nQuick Check",
      smileSimulatorSubheading: "Describe what you're feeling and our AI will help you understand whether root canal therapy could save your tooth — or whether something else is going on.",
      bookingHeadline: "Book a Root Canal Evaluation",
      bookingSubheading: "Same-day and next-day appointments available for patients in pain. We'll get you out of pain first, then explain the plan.",
    },
    heroAssurances: ["Same-day pain relief", "Microscope-guided care", "Most insurances accepted"],
    whyChoosePillars: [
      { title: "Dental Microscopes", description: "Every canal is treated under high magnification — better cleaning, better sealing, better long-term outcomes." },
      { title: "Truly Comfortable", description: "Profound anesthesia, isolation with a rubber dam, and a gentle pace mean most patients feel nothing more than a filling." },
      { title: "Single-Visit When Possible", description: "Many cases are completed in one visit so you can put the pain — and the procedure — behind you." },
      { title: "Saves Your Natural Tooth", description: "A successful root canal lets you keep your own tooth for decades, often outlasting any replacement." },
    ],
    smileSimulatorGoals: [
      "Severe tooth pain",
      "Hot/cold sensitivity",
      "Swelling near a tooth",
      "Cracked tooth concern",
      "Referred for a root canal",
    ],
    commonSymptomsHint: [
      "Severe Tooth Pain",
      "Pain When Chewing",
      "Sensitivity to Hot/Cold",
      "Swollen Gum Near Tooth",
      "Dark or Discolored Tooth",
      "Cracked Tooth",
      "Abscess or Pimple on Gum",
      "Lingering Pain After Filling",
      "Referred for Root Canal",
      "Re-Treatment Needed",
    ],
    serviceCategoriesHint: [
      {
        title: "Root Canal Therapy",
        description:
          "Microscope-guided removal of infected pulp and precise sealing of the canal — saving the natural tooth and ending the pain.",
      },
      {
        title: "Endodontic Re-Treatment",
        description:
          "Specialized retreatment for failing or re-infected root canals that other dentists may not feel equipped to handle.",
      },
      {
        title: "Apicoectomy / Microsurgery",
        description:
          "Minimally invasive root-tip surgery using microscopes — a tooth-saving option when conventional retreatment isn't enough.",
      },
      {
        title: "Cracked Tooth Diagnosis",
        description:
          "Advanced diagnostic imaging and exam techniques to identify hairline cracks before they cost you the tooth.",
      },
    ],
    faqThemes: [
      "Do root canals really hurt anymore",
      "How long does a root canal take",
      "How much does a root canal cost",
      "What happens if I don't get the root canal",
      "Will I need a crown after my root canal",
      "Can a root canal save my cracked tooth",
    ],
    journeyStages:
      "The 6 stages for an endodontic / root-canal practice are: (1) consultation, digital X-rays, and CBCT imaging to diagnose the tooth, (2) anesthesia and isolation of the tooth with a rubber dam for cleanliness, (3) microscope-guided cleaning and disinfection of each root canal, (4) precise sealing of the canals to prevent re-infection, (5) temporary restoration and referral back to your general dentist for the crown, (6) follow-up imaging to confirm complete healing.",
    imageScenes: {
      hero: "modern endodontic operatory with a surgical microscope prominently visible and a digital X-ray on a screen",
      benefits: "consultation moment with a digital X-ray of a tooth on a tablet, in a calm clinical setting",
      whychoose: "calm modern endodontic suite with a dental operating microscope, CBCT imaging, and warm soft lighting",
    },
  },

  "all-on-4-dental-implants": {
    key: "all-on-4-dental-implants",
    label: "All-on-4 Dental Implants",
    dentistTypes: ["Implant Dentist"],
    selectedProcedure: "All-on-4 Dental Implants",
    template: "implants",
    focusBlurb:
      "An implant dentistry practice specializing in All-on-4 — a full arch of permanent, non-removable teeth supported by just four strategically placed implants, often delivered in a single day.",
    patientLanguage: "adults who are missing most or all of their teeth in one or both arches, or who are tired of dentures",
    sectionHeadlines: {
      heroHeadline: "New Teeth.\nNew Confidence.\nIn a Single Day.",
      heroCta: "Book Your All-on-4 Consultation",
      implantOptionsLabel: "All-on-4 Treatment Options",
      implantOptionsHeadline: "Full-Arch Implant Solutions Beyond Traditional Dentures",
      implantOptionsSubheading:
        "From single-arch All-on-4 to full-mouth reconstruction, our full-arch implant options give you a fixed, natural-feeling smile in record time.",
      whyChooseLabel: "Why Choose Our All-on-4 Team",
      whyChooseHeadline: "All-on-4 Done Right — Surgical, Restorative, and Lab Care Under One Roof",
      whyChooseSubheading: "All-on-4 only works when every phase — diagnostics, surgery, lab, and restoration — is coordinated by a team that does this every day.",
      processHeadline: "Your All-on-4 Journey",
      processSubheading:
        "Most All-on-4 patients walk out the same day with a brand-new set of fixed teeth. Here's how the entire treatment unfolds.",
      benefitsHeadline: "Why Patients Choose All-on-4 Over Dentures",
      faqLabel: "All-on-4 FAQ",
      faqHeadline: "Common Questions About All-on-4 Dental Implants",
      symptomCheckerHeadline: "Tell Us About Your Current Situation",
      symptomCheckerSubheading:
        "Tap whichever describes you — All-on-4 transforms many of these situations into a fixed, permanent smile.",
      testimonialsHeadline: "Full-Arch Transformations",
      testimonialsSubheading: "Real patients who went from failing teeth or dentures to a fixed, full set of teeth — often in a single day.",
      beforeAfterHeadline: "Real All-on-4 Transformations",
      beforeAfterSubheading: "Before-and-after photos of actual All-on-4 patients — the day they walked in with failing or missing teeth, and the day they walked out with a permanent smile.",
      beforeAfterCases: ba([
        { tag: "All-on-4", title: "Upper-Arch Restoration", subtitle: "Fixed teeth delivered same day" },
        { tag: "Full-Arch", title: "Both Arches Restored", subtitle: "Complete smile rebuilt in one day" },
        { tag: "Reconstruction", title: "Denture to Fixed Teeth", subtitle: "Permanent replacement in 6 months" },
      ]),
      smileSimulatorHeadline: "Are You an\nAll-on-4 Candidate?",
      smileSimulatorSubheading: "Upload a recent photo of your smile (or describe your current dental situation) and our AI will outline whether All-on-4 is likely a fit for you.",
      bookingHeadline: "Book Your All-on-4 Consultation",
      bookingSubheading: "Includes a full CBCT 3D scan, candidacy assessment, and clear pricing — at no cost to you.",
    },
    heroAssurances: ["New teeth in a day", "Free CBCT 3D scan", "Financing available"],
    whyChoosePillars: [
      { title: "Teeth in a Single Day", description: "Walk in with failing or missing teeth, walk out the same day with a fixed temporary bridge on your new implants." },
      { title: "All Specialties In-House", description: "Surgery, restoration, and lab fabrication coordinated by one team — no juggling separate offices." },
      { title: "Permanent, Fixed Teeth", description: "Unlike dentures, All-on-4 teeth stay in your mouth. No adhesives, no slipping, no taking them out at night." },
      { title: "Long-Term Investment", description: "With proper care, All-on-4 implants are designed to last decades — often a lifetime solution." },
    ],
    smileSimulatorGoals: [
      "Replace failing teeth",
      "Move away from dentures",
      "Restore upper arch",
      "Restore lower arch",
      "Full-mouth restoration",
    ],
    commonSymptomsHint: [
      "Most or All Teeth Missing",
      "Loose Dentures",
      "Tired of Denture Adhesive",
      "Failing Teeth Need Extraction",
      "Bone Loss in Jaw",
      "Difficulty Eating",
      "Embarrassed to Smile",
      "Old Bridge Failing",
      "Sunken Facial Appearance",
      "Want Fixed Teeth, Not Dentures",
    ],
    serviceCategoriesHint: [
      {
        title: "All-on-4 Single Arch",
        description:
          "A complete set of fixed teeth for the upper or lower jaw, supported by just four implants — usually delivered the same day.",
      },
      {
        title: "All-on-4 Full Mouth",
        description:
          "Both arches restored with All-on-4 — a permanent, fixed-in solution for patients who are completely or near-completely edentulous.",
      },
      {
        title: "Teeth-in-a-Day / Same-Day",
        description:
          "Walk in with failing or missing teeth, walk out the same day with a fixed temporary bridge on your new implants.",
      },
      {
        title: "Zygomatic Implants",
        description:
          "An advanced option for patients with severe upper-jaw bone loss who were previously told they couldn't have implants.",
      },
    ],
    faqThemes: [
      "How is All-on-4 different from regular dentures",
      "Can I really get new teeth in just one day",
      "How much does All-on-4 cost (and what financing is available)",
      "Am I a candidate if I have bone loss",
      "How long do All-on-4 implants last",
      "How do I clean and care for All-on-4 teeth",
    ],
    journeyStages:
      "The 6 stages for an All-on-4 practice are: (1) full consultation with CBCT 3D imaging and a comprehensive treatment plan, (2) digital surgical planning and lab fabrication of your temporary bridge, (3) the surgical day — any remaining teeth removed, four implants placed, and your fixed temporary teeth delivered, (4) healing and osseointegration over 3-6 months, (5) impressions and design of your final permanent prosthesis, (6) delivery of your final All-on-4 teeth and long-term hygiene plan.",
    imageScenes: {
      hero: "modern implant surgical suite with CBCT 3D imaging on a large monitor and full-arch bridge models visible",
      benefits: "consultation moment with a full-arch All-on-4 bridge model on a clean modern desk",
      whychoose: "advanced implant surgical suite with CBCT imaging, an in-house digital lab area, and warm modern finishes",
    },
  },

  "full-mouth-restoration": {
    key: "full-mouth-restoration",
    label: "Full Mouth Restoration",
    dentistTypes: ["Prosthodontist"],
    selectedProcedure: "Full Mouth Restoration",
    template: "implants",
    focusBlurb:
      "A prosthodontics practice specializing in full mouth restoration — comprehensive rehabilitation of patients with widespread tooth damage, wear, or loss using a combination of implants, crowns, bridges, and prosthetics.",
    patientLanguage: "adults with extensive dental wear, multiple failing restorations, or complex reconstruction needs",
    sectionHeadlines: {
      heroHeadline: "Rebuild Your\nMouth. Restore\nYour Bite.",
      heroCta: "Book a Reconstruction Consultation",
      implantOptionsLabel: "Full Mouth Restoration Services",
      implantOptionsHeadline: "Comprehensive Reconstruction Tailored to Your Mouth",
      implantOptionsSubheading:
        "Every full mouth restoration plan combines the right mix of implants, crowns, bridges, and prosthetics for your specific case.",
      whyChooseLabel: "Why Choose Our Prosthodontist",
      whyChooseHeadline: "Board-Certified Prosthodontics for the Most Complex Cases",
      whyChooseSubheading: "Full mouth reconstruction is one of the hardest things in dentistry — it should be done by someone with the specialty training to match.",
      processHeadline: "Your Full Mouth Restoration Journey",
      processSubheading:
        "Full mouth reconstruction is a phased process — diagnosed carefully, planned digitally, and delivered in stages your body can heal between.",
      benefitsHeadline: "Why Patients Trust Us With Full Mouth Restoration",
      faqLabel: "Restoration FAQ",
      faqHeadline: "Common Questions About Full Mouth Restoration",
      symptomCheckerHeadline: "Tell Us What's Going On",
      symptomCheckerSubheading:
        "Tap whichever applies — most full mouth restoration patients have several of these issues at once, and we can solve them together.",
      testimonialsHeadline: "Reconstruction Patient Stories",
      testimonialsSubheading: "Real patients who arrived with extensive damage and walked away with a fully restored, functional smile.",
      beforeAfterHeadline: "Real Reconstruction Outcomes",
      beforeAfterSubheading: "Before-and-after photos of complete full-mouth rebuilds — restored bites, rebuilt smiles, and natural-looking results.",
      beforeAfterCases: ba([
        { tag: "Reconstruction", title: "Full-Mouth Rebuild", subtitle: "Crowns and implants over 6 months" },
        { tag: "Prosthetics", title: "Implant-Supported Bridges", subtitle: "Bite restored in phased treatment" },
        { tag: "Bite & TMJ", title: "Bite Rehabilitation", subtitle: "Pain-free chewing within weeks" },
      ]),
      smileSimulatorHeadline: "Plan Your\nSmile Rebuild",
      smileSimulatorSubheading: "Upload a photo of your current smile and tell us what's broken, missing, or worn down — our AI will outline the kind of reconstruction plan you'd likely need.",
      bookingHeadline: "Book Your Reconstruction Consultation",
      bookingSubheading: "Includes full records, CBCT scans, and photography — everything we need to design your complete reconstruction plan.",
    },
    heroAssurances: ["Board-certified prosthodontist", "Free reconstruction consult", "In-house digital lab"],
    whyChoosePillars: [
      { title: "Specialty-Trained", description: "Prosthodontics is a recognized dental specialty — extra years of training specifically for complex cases like yours." },
      { title: "Phased Treatment Plan", description: "We work in stages your body can heal between, so you never go without teeth and the work is built to last." },
      { title: "In-House Digital Lab", description: "Custom restorations designed and fabricated in-house for precise fit, predictable results, and faster timelines." },
      { title: "Bite & TMJ Expertise", description: "A correct bite is the foundation of any reconstruction — we treat the cause, not just the broken teeth." },
    ],
    smileSimulatorGoals: [
      "Worn down teeth",
      "Multiple failing restorations",
      "TMJ or bite pain",
      "Rebuild entire smile",
      "Replace old dentures",
    ],
    commonSymptomsHint: [
      "Worn Down Teeth",
      "Multiple Failing Crowns",
      "Cracked Teeth",
      "Missing Teeth",
      "Jaw Pain / TMJ",
      "Difficulty Chewing",
      "Old Dentures Failing",
      "Acid Erosion",
      "Grinding Damage",
      "Want Whole Mouth Rebuilt",
    ],
    serviceCategoriesHint: [
      {
        title: "Implant-Supported Restoration",
        description:
          "Strategic use of implants to anchor crowns, bridges, or full-arch prosthetics as part of a unified reconstruction plan.",
      },
      {
        title: "Full-Coverage Crowns & Bridges",
        description:
          "High-end porcelain restorations that rebuild worn or broken teeth to their proper shape, function, and bite alignment.",
      },
      {
        title: "Bite & TMJ Rehabilitation",
        description:
          "Restoring proper vertical dimension and a balanced bite — the foundation of any successful full mouth reconstruction.",
      },
      {
        title: "Custom Prosthetics",
        description:
          "Lab-crafted dentures, overdentures, and complex prosthetic appliances designed to fit your face and function naturally.",
      },
    ],
    faqThemes: [
      "How long does a full mouth restoration take",
      "How much does full mouth reconstruction cost",
      "Why do I need a prosthodontist instead of a general dentist",
      "Will I have to be without teeth at any point during treatment",
      "How do you handle TMJ pain and bite issues",
      "Do you offer sedation for long appointments",
    ],
    journeyStages:
      "The 6 stages for a prosthodontic / full-mouth-restoration practice are: (1) comprehensive consultation with full records, CBCT scans, and photography, (2) collaborative digital treatment plan with mockups of your final smile and bite, (3) foundation phase — extractions, implants, gum and bone work as needed, (4) provisional restorations to test bite, aesthetics, and function, (5) custom lab fabrication and delivery of your final permanent restorations, (6) long-term maintenance with nightguards, hygiene visits, and protective care.",
    imageScenes: {
      hero: "advanced prosthodontic consultation suite with full-mouth mockup models and CBCT imaging on a large screen",
      benefits: "consultation moment with full-arch prosthetic models and a tablet showing a smile design on a clean desk",
      whychoose: "high-end prosthodontic operatory with an in-house digital lab visible in the background and warm modern finishes",
    },
  },

  "emergency-dentistry": {
    key: "emergency-dentistry",
    label: "Emergency Dentistry",
    dentistTypes: ["Emergency Dentist"],
    selectedProcedure: "Emergency Dentistry",
    template: "dentist-landing",
    focusBlurb:
      "An emergency dental practice focused on fast relief for patients in pain — same-day appointments, after-hours availability, and the full range of urgent treatments under one roof.",
    patientLanguage: "patients in pain right now, often searching at night or on a weekend",
    sectionHeadlines: {
      heroHeadline: "In Pain?\nWe'll See You\nToday.",
      heroCta: "Call for Same-Day Care",
      implantOptionsLabel: "Emergency Services",
      implantOptionsHeadline: "Same-Day Emergency Dental Care",
      implantOptionsSubheading:
        "From a knocked-out tooth to a severe abscess, our emergency services get you out of pain today — most patients are seen within hours.",
      whyChooseLabel: "Why Choose Us in an Emergency",
      whyChooseHeadline: "Pain Relief Today — Not in Three Weeks",
      whyChooseSubheading: "When something goes wrong with a tooth, you don't need a referral, a waitlist, or a quote — you need help today. That's all we do.",
      processHeadline: "Your Emergency Visit, Step By Step",
      processSubheading:
        "When you're in pain, every minute matters. Here's exactly how our emergency process works, from the moment you call until you're out of pain.",
      benefitsHeadline: "Why Patients Choose Us in a Dental Emergency",
      faqLabel: "Emergency FAQ",
      faqHeadline: "Common Questions About Dental Emergencies",
      symptomCheckerHeadline: "What's the Emergency?",
      symptomCheckerSubheading:
        "Tap whichever describes what's happening — we'll get back to you right away with same-day options.",
      testimonialsHeadline: "Patients We Got Out of Pain",
      testimonialsSubheading: "Real stories from patients who called us in the middle of a dental crisis — and walked out of our office out of pain.",
      beforeAfterHeadline: "Real Emergency Outcomes",
      beforeAfterSubheading: "From broken teeth to severe infections — see how same-day emergency care quickly resolves problems other offices push out for weeks.",
      beforeAfterCases: ba([
        { tag: "Same-Day", title: "Broken Tooth Repair", subtitle: "Restored on the same visit" },
        { tag: "Urgent Care", title: "Abscess Treatment", subtitle: "Pain and swelling gone within hours" },
        { tag: "Restoration", title: "Lost Crown Replacement", subtitle: "Re-cemented in a single appointment" },
      ]),
      smileSimulatorHeadline: "AI Triage:\nIs It an\nEmergency?",
      smileSimulatorSubheading: "Describe your symptoms or upload a photo of the affected tooth — our AI will help you understand whether this needs a same-day visit, a call tonight, or can safely wait.",
      bookingHeadline: "Get Same-Day Help",
      bookingSubheading: "Call us now or request a same-day appointment online. Walk-ins welcome during open hours.",
    },
    heroAssurances: ["Open 7 days", "Same-day appointments", "Walk-ins welcome"],
    whyChoosePillars: [
      { title: "Same-Day Availability", description: "Most patients are seen within hours of calling — we keep emergency slots open every single day." },
      { title: "Pain Relief First", description: "Our first goal is to get you out of pain. We diagnose, numb, and treat in the same visit whenever possible." },
      { title: "All Treatments In-House", description: "Extractions, repairs, root canals, abscess care — handled by one team, in one visit, in one office." },
      { title: "Transparent Pricing", description: "You'll know the cost before we start. Most insurances accepted and financing available for larger emergencies." },
    ],
    smileSimulatorGoals: [
      "Severe tooth pain",
      "Knocked-out tooth",
      "Broken or chipped tooth",
      "Swelling or abscess",
      "Lost filling or crown",
    ],
    commonSymptomsHint: [
      "Severe Tooth Pain",
      "Knocked-Out Tooth",
      "Broken Tooth",
      "Swollen Face / Abscess",
      "Lost Filling or Crown",
      "Bleeding Gums",
      "Cracked Tooth",
      "Jaw Trauma",
      "Object Stuck in Teeth",
      "Sudden Toothache at Night",
    ],
    serviceCategoriesHint: [
      {
        title: "Same-Day Pain Relief",
        description:
          "Walk-in or call-ahead emergency appointments to diagnose the issue, control the infection, and stop the pain — today.",
      },
      {
        title: "Emergency Extractions",
        description:
          "Fast, gentle removal of damaged or infected teeth that can no longer be saved, with sedation options for anxious patients.",
      },
      {
        title: "Same-Day Crowns & Repairs",
        description:
          "Lost crown, broken filling, or chipped tooth? We repair, replace, or temporarily restore your tooth the day you come in.",
      },
      {
        title: "Trauma & Re-Implantation",
        description:
          "Knocked-out tooth or jaw trauma — protocols to re-implant teeth when possible and stabilize injuries quickly.",
      },
    ],
    faqThemes: [
      "Can I be seen today / right now",
      "What counts as a dental emergency",
      "How much does an emergency visit cost",
      "Do you accept walk-ins or after-hours patients",
      "What should I do if a tooth gets knocked out",
      "Do you take dental insurance for emergencies",
    ],
    journeyStages:
      "The 6 stages for an emergency-dental practice are: (1) urgent call or online request — we triage and get you in fast, (2) rapid X-ray and exam to find the exact source of the pain or trauma, (3) immediate pain relief and infection control, (4) same-day definitive treatment when possible (extractions, temporary restoration, antibiotics, splinting), (5) clear next-step plan if follow-up restorative work is needed, (6) follow-up care and a transition into a long-term dental home.",
    imageScenes: {
      hero: "clean modern emergency dental treatment room with bright clinical lighting and a sense of urgency-meets-calm",
      benefits: "consultation moment with a dental X-ray on a tablet showing an emergency case, in a clean treatment room",
      whychoose: "warm but efficient emergency dental operatory with modern equipment, ready for same-day care",
    },
  },
};

const SELECTED_PROCEDURE_LOOKUP: Record<string, ProcedureKey> = Object.fromEntries(
  Object.entries(PROCEDURES).map(([key, p]) => [p.selectedProcedure.toLowerCase(), key as ProcedureKey]),
);

const DENTIST_TYPE_LOOKUP: Record<string, ProcedureKey> = Object.entries(PROCEDURES).reduce(
  (acc, [key, p]) => {
    for (const dt of p.dentistTypes) {
      acc[dt.toLowerCase()] = key as ProcedureKey;
    }
    return acc;
  },
  {} as Record<string, ProcedureKey>,
);

export function procedureFromSelected(selectedProcedure: string | undefined): Procedure | null {
  if (!selectedProcedure) return null;
  const key = SELECTED_PROCEDURE_LOOKUP[selectedProcedure.trim().toLowerCase()];
  return key ? PROCEDURES[key] : null;
}

export function procedureFromDentistType(dentistType: string | undefined): Procedure | null {
  if (!dentistType) return null;
  const key = DENTIST_TYPE_LOOKUP[dentistType.trim().toLowerCase()];
  return key ? PROCEDURES[key] : null;
}

export function procedureByKey(key: string | undefined): Procedure | null {
  if (!key) return null;
  return PROCEDURES[key as ProcedureKey] ?? null;
}

export const PROCEDURE_KEYS: ProcedureKey[] = Object.keys(PROCEDURES) as ProcedureKey[];
