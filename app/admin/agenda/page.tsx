import { AgendaClient } from "./AgendaClient";
import { getAppointments } from "@/app/actions/appointment-actions";
import { getGlobalSettings } from "@/app/actions/settings-actions";

export default async function AgendaPage() {
  const appointments = await getAppointments();
  const settings = await getGlobalSettings();

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <AgendaClient 
        appointments={appointments as any} 
        cancellationHoursLimit={settings.cancellationHoursLimit}
      />
    </div>
  );
}
