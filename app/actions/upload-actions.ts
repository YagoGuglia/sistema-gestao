"use server";

import { requireTenant } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export type AssetType = "logo" | "superBanner" | "promoBanner" | "banner";

export async function uploadStoreAsset(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const tenantId = await requireTenant();

    const file = formData.get("file") as File | null;
    const type = formData.get("type") as AssetType | null;

    if (!file || !(file instanceof File) || file.size === 0) {
      return { success: false, error: "Nenhum arquivo enviado." };
    }

    if (!type || !["logo", "superBanner", "promoBanner", "banner"].includes(type)) {
      return { success: false, error: "Tipo de imagem inválido." };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Formato de arquivo não suportado. Use JPG, PNG, WebP, GIF ou SVG.",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "Arquivo muito grande. Tamanho máximo permitido é 5MB.",
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determina extensão do arquivo
    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const cleanExt = extension.replace(/[^a-z0-9]/g, "");
    const fileName = `${type}-${Date.now()}.${cleanExt || "png"}`;
    const filePath = `${tenantId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("store-assets")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Erro no Supabase Storage upload:", uploadError);
      return { success: false, error: `Erro no upload: ${uploadError.message}` };
    }

    const { data: urlData } = supabase.storage
      .from("store-assets")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Atualiza as configurações no banco de dados
    const updateData: {
      logoUrl?: string;
      companyLogoUrl?: string;
      superBannerUrl?: string;
      promoBannerUrl?: string;
      bannerUrl?: string;
    } = {};

    if (type === "logo") {
      updateData.logoUrl = publicUrl;
      updateData.companyLogoUrl = publicUrl;
    } else if (type === "superBanner") {
      updateData.superBannerUrl = publicUrl;
    } else if (type === "promoBanner") {
      updateData.promoBannerUrl = publicUrl;
    } else if (type === "banner") {
      updateData.bannerUrl = publicUrl;
    }

    await prisma.globalSettings.upsert({
      where: { tenantId },
      update: updateData,
      create: {
        tenantId,
        companyName: "Minha Loja",
        ...updateData,
      },
    });

    revalidatePath("/admin/empresa");
    revalidatePath("/admin/config");
    revalidatePath("/loja", "layout");

    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error("Erro em uploadStoreAsset:", err);
    return { success: false, error: err?.message || "Falha ao processar upload." };
  }
}

export async function removeStoreAsset(type: AssetType): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantId = await requireTenant();

    if (!type || !["logo", "superBanner", "promoBanner", "banner"].includes(type)) {
      return { success: false, error: "Tipo de imagem inválido." };
    }

    const updateData: {
      logoUrl?: string | null;
      companyLogoUrl?: string | null;
      superBannerUrl?: string | null;
      promoBannerUrl?: string | null;
      bannerUrl?: string | null;
    } = {};

    if (type === "logo") {
      updateData.logoUrl = null;
      updateData.companyLogoUrl = null;
    } else if (type === "superBanner") {
      updateData.superBannerUrl = null;
    } else if (type === "promoBanner") {
      updateData.promoBannerUrl = null;
    } else if (type === "banner") {
      updateData.bannerUrl = null;
    }

    await prisma.globalSettings.update({
      where: { tenantId },
      data: updateData,
    });

    revalidatePath("/admin/empresa");
    revalidatePath("/admin/config");
    revalidatePath("/loja", "layout");

    return { success: true };
  } catch (err: any) {
    console.error("Erro em removeStoreAsset:", err);
    return { success: false, error: err?.message || "Falha ao remover imagem." };
  }
}

