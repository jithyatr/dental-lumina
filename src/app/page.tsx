import { ClinicPage } from "./ClinicPage";
import { getClinicConfig } from "@/lib/clinicConfig";

export default async function HomePage() {
  const config = await getClinicConfig();
  return <ClinicPage config={config} />;
}
