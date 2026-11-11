import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ThermalReceipt } from "@/components/ThermalReceipt";

export default async function ThermalReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ autoprint?: string }>;
}) {
  const { id } = await params;
  const { autoprint } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          phone: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
      tenant: {
        select: {
          name: true,
          settings: {
            select: {
              companyName: true,
              companyLogoUrl: true,
              logoUrl: true,
              whatsappNumber: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return <ThermalReceipt order={order as any} autoPrint={autoprint === "1"} />;
}

