import { getAppSetting } from "@/lib/actions/app-settings";
import InnstillingerClient from "./InnstillingerClient";

export const dynamic = "force-dynamic";

export default async function InnstillingerPage() {
  const nsfEnabled = (await getAppSetting("nsf_utviklingstrapp_enabled")) === true;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Innstillinger</h1>
      <InnstillingerClient initialNsfUtviklingstrappEnabled={nsfEnabled} />
    </div>
  );
}
