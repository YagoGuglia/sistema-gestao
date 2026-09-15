import { StaffClient } from "./StaffClient";
import { getStaffList } from "@/app/actions/staff-actions";
import { getGlobalSettings } from "@/app/actions/settings-actions";

export default async function EquipePage() {
  const staffList = await getStaffList();
  const settings = await getGlobalSettings();

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <StaffClient 
        staffList={staffList} 
        enableCommissions={settings.enableCommissions} 
      />
    </div>
  );
}
