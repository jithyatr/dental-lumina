import { notFound } from "next/navigation";
import { ClinicPage } from "../ClinicPage";
import { getClinicConfig, listKnownSlugs } from "@/lib/clinicConfig";

export async function generateStaticParams() {
  const slugs = await listKnownSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export default async function ClinicSlugPage({
  params,
}: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const known = await listKnownSlugs();
  if (!known.includes(slug)) notFound();

  const config = await getClinicConfig(slug);
  return <ClinicPage config={config} />;
}
