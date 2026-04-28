import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });

  // Super Admins can access /admin without a tenant
  if (dbUser?.role === "SUPERADMIN") {
    redirect("/superadmin");
  }

  // If user has no tenant yet, redirect them to choose a plan
  if (!dbUser?.tenantId) {
    redirect("/#planos");
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
