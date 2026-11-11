"use client";

import { useState, useRef, useTransition } from "react";
import { Upload, X, Check, AlertCircle, Loader2, Image as ImageIcon, Sparkles, RefreshCw } from "lucide-react";
import { uploadStoreAsset, removeStoreAsset, AssetType } from "@/app/actions/upload-actions";

interface ImageUploaderProps {
  type: AssetType;
  label: string;
  description: string;
  recommendation: string;
  initialUrl?: string | null;
  aspectRatioClass?: string;
  onUploaded?: (url: string) => void;
  onRemoved?: () => void;
}

export function ImageUploader({
  type,
  label,
  description,
  recommendation,
  initialUrl = null,
  aspectRatioClass = "aspect-[3/1]",
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
      setError("Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP, SVG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5MB.");
      return;
    }

    // Gerar preview local imediato
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Enviar via Server Action
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = () => {
    if (!confirm("Deseja realmente remover esta imagem? A vitrine voltará ao padrão.")) return;
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
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4 transition hover:border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">{label}</h3>
            {activeUrl && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check className="w-3 h-3" />
                Ativo
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>

        <span className="text-[11px] text-gray-400 font-medium self-start sm:self-auto bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
          {recommendation}
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Imagem atualizada e salva com sucesso!</span>
        </div>
      )}

      {/* Área de Visualização e Upload */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isPending && fileInputRef.current?.click()}
        className={`relative cursor-pointer group rounded-2xl border-2 border-dashed transition overflow-hidden flex flex-col items-center justify-center p-4 text-center ${
          isDragging
            ? "border-vitrinia-purple bg-purple-50/50"
            : activeUrl
            ? "border-gray-200 bg-gray-50/50 hover:border-vitrinia-purple/50"
            : "border-gray-200 hover:border-vitrinia-purple/60 hover:bg-purple-50/30 bg-gray-50/30"
        } ${type === "logo" ? "h-36 max-w-xs mx-auto" : aspectRatioClass}`}
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

        {activeUrl ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={activeUrl}
              alt={label}
              className={`w-full h-full object-cover rounded-xl transition duration-300 group-hover:opacity-90 ${
                type === "logo" ? "object-contain p-2" : "object-cover"
              }`}
            />
            {/* Overlay ao passar o mouse */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2 text-white">
              <RefreshCw className="w-4 h-4 animate-spin-reverse" />
              <span className="text-xs font-bold">Clique ou arraste para trocar</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2 py-4">
            <div className="w-10 h-10 rounded-2xl bg-vitrinia-purple/10 text-vitrinia-purple flex items-center justify-center mx-auto transition group-hover:scale-110">
              {type === "logo" ? <ImageIcon className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">
                Clique para enviar ou arraste a imagem
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, WebP ou SVG até 5MB</p>
            </div>
          </div>
        )}

        {isPending && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-vitrinia-purple z-20">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs font-bold">Enviando imagem para Supabase...</span>
          </div>
        )}
      </div>

      {/* Botões de Ação Auxiliares */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-vitrinia-purple bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" />
          {activeUrl ? "Trocar imagem" : "Selecionar arquivo"}
        </button>

        {activeUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-xl transition disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            Remover imagem
          </button>
        )}
      </div>
    </div>
  );
}

