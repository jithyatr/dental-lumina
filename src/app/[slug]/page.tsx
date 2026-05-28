import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClinicPage } from "../ClinicPage";
import { getClinicConfig, listKnownSlugs } from "@/lib/clinicConfig";

export async function generateStaticParams() {
  const slugs = await listKnownSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: Readonly<{ params: Promise<{ slug: string }> }>): Promise<Metadata> {
  const { slug } = await params;
  const known = await listKnownSlugs();
  if (!known.includes(slug)) return {};

  const { clinic } = await getClinicConfig(slug);

  const titleSuffix =
    clinic.tagline?.trim() ||
    (clinic.city ? `Dentist in ${clinic.city}` : undefined);
  const title = titleSuffix ? `${clinic.name} — ${titleSuffix}` : clinic.name;

  const rawDescription = clinic.heroSubtitle ?? clinic.footerAbout;
  let description: string | undefined;
  if (rawDescription) {
    description =
      rawDescription.length > 160
        ? `${rawDescription.slice(0, 157).trimEnd()}…`
        : rawDescription;
  }

  return {
    title,
    ...(description ? { description } : {}),
  };
}

export default async function ClinicSlugPage({
  params,
}: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const known = await listKnownSlugs();
  if (!known.includes(slug)) notFound();

  const config = await getClinicConfig(slug);
  return <ClinicPage config={config} />;
}
