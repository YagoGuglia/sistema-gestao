"use client";

import { useState, useRef, useTransition } from "react";
import { Upload, X, Check, AlertCircle, Loader2, Image as ImageIcon, Sparkles, RefreshCw } from "lucide-react";
import { uploadStoreAsset, removeStoreAsset, AssetType } from "@/app/actions/upload-actions";

interface ImageUploaderProps {
  type: AssetType;
  label: string;
  description?: string;
  recommendation: string;
  initialUrl?: string | null;
  onUploaded?: (url: string) => void;
  onRemoved?: () => void;
}

export function ImageUploader({
  type,
  label,
  description,
  recommendation,
  initialUrl = null,
  onUploaded,
  onRemoved,
}: ImageUploaderProps) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(initialUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (file: File) => {
    setError(null);
    setSuccess(false);

    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem válido (PNG, JPG, WebP, SVG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    startTransition(async () => {
      const res = await uploadStoreAsset(formData);
      if (res.success && res.url) {
        setCurrentUrl(res.url);
        setSuccess(true);
        if (onUploaded) onUploaded(res.url);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.error || "Falha no envio da imagem.");
        setPreviewUrl(null);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Deseja remover esta imagem? A vitrine usará o padrão.")) return;
    setError(null);
    startTransition(async () => {
      const res = await removeStoreAsset(type);
      if (res.success) {
        setCurrentUrl(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (onRemoved) onRemoved();
      } else {
        setError(res.error || "Falha ao remover imagem.");
      }
    });
  };

  const activeUrl = previewUrl || currentUrl;

  return (
    <div className="space-y-1.5">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        className={`relative flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
          isDragging
            ? "border-vitrinia-purple bg-purple-50/50 shadow-xs"
            : activeUrl
            ? "border-gray-200 bg-white hover:border-gray-300"
            : "border-gray-200/90 bg-gray-50/60 hover:bg-gray-50 hover:border-gray-300"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileProcess(e.target.files[0]);
            }
          }}
          disabled={isPending}
        />

        {/* Thumbnail + Info */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Miniatura Compacta */}
          <div
            onClick={() => !isPending && fileInputRef.current?.click()}
            className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 shrink-0 relative cursor-pointer group flex items-center justify-center shadow-2xs"
            title="Clique para enviar ou trocar imagem"
          >
            {activeUrl ? (
              <>
                <img
                  src={activeUrl}
                  alt={label}
                  className="w-full h-full object-cover transition group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
              </>
            ) : (
              <div className="text-gray-400 group-hover:text-vitrinia-purple transition">
                {type === "logo" ? <ImageIcon className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
            )}

            {isPending && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-2xs flex items-center justify-center text-vitrinia-purple">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
          </div>

          {/* Textos */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                {label}
              </span>
              {activeUrl ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-2.5 h-2.5" />
                  Ativo
                </span>
              ) : (
                <span className="text-[10px] text-gray-400">Padrão</span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 truncate mt-0.5">
              {recommendation}
            </p>
          </div>
        </div>

        {/* Botões Compactos (Shadcn UI style) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 px-2.5 py-1.5 rounded-lg shadow-2xs transition active:scale-95 disabled:opacity-50"
          >
            <Upload className="w-3 h-3 text-gray-500" />
            <span className="hidden sm:inline">{activeUrl ? "Trocar" : "Upload"}</span>
          </button>

          {activeUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isPending}
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition disabled:opacity-50"
              title="Remover imagem"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-700">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
          <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
          <span>Imagem atualizada com sucesso!</span>
        </div>
      )}
    </div>
  );
}
