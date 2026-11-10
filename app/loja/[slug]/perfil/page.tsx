import { prisma } from "@/lib/prisma";
import { PerfilClient } from "./PerfilClient";
import { redirect } from "next/navigation";

export default async function PerfilPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug }
  });

  if (!tenant) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <PerfilClient slug={slug} tenantId={tenant.id} />
    </div>
  );
}
