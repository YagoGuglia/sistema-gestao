"use server";

import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getReviews() {
  const tenantId = await requireTenant();
  return prisma.review.findMany({
    where: { tenantId },
    include: {
      user: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function toggleReviewPublished(id: string, current: boolean) {
  const tenantId = await requireTenant();
  try {
    await prisma.review.update({
      where: { id, tenantId },
      data: { isPublished: !current },
    });
    revalidatePath("/admin/avaliacoes");
    revalidatePath("/");
  } catch (error) {
    console.error(error);
  }
}

export async function deleteReview(id: string) {
  const tenantId = await requireTenant();
  try {
    await prisma.review.delete({
      where: { id, tenantId },
    });
    revalidatePath("/admin/avaliacoes");
  } catch (error) {
    console.error(error);
  }
}

// Function to be called from public storefront
export async function getPublicReviews(tenantId: string) {
  return prisma.review.findMany({
    where: { tenantId, isPublished: true },
    include: {
      user: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" },
  });
}
