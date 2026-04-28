import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
  if (dbUser?.role !== "SUPERADMIN") {
    redirect("/admin"); // redireciona quem não for o dono
  }

  return (
    <div className="min-h-screen bg-vitrinia-bg font-sans">
      {/* Topbar Super Admin */}
      <header className="bg-vitrinia-dark text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-vitrinia-purple font-black text-xl">V</span>
          <span className="font-bold tracking-wide">vitrinia</span>
          <span className="text-xs bg-vitrinia-orange/20 text-vitrinia-orange px-2 py-0.5 rounded-full font-bold ml-2">Super Admin</span>
        </div>
        <span className="text-sm text-gray-400">{user.email}</span>
      </header>
      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
