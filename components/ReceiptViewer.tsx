"use client";

import { useState } from "react";
import { Download, Share2, Link as LinkIcon, Check, MessageCircle, ArrowLeft, Store } from "lucide-react";
import { createWhatsAppLink, getOrderStatusLabel } from "@/lib/whatsapp";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface ReceiptViewerProps {
  orderId: string;
  orderNumber?: string;
  totalAmount?: number;
  status?: string;
  storeName?: string;
  storeWhatsApp?: string | null;
  storeSlug?: string | null;
}

export function ReceiptViewer({
  orderId,
  orderNumber,
  totalAmount,
  status = "RECEIVED",
  storeName = "Vitrinia",
  storeWhatsApp,
  storeSlug,
}: ReceiptViewerProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const searchParams = useSearchParams();
  const justOrdered = searchParams.get("justOrdered") === "1";

  const imageUrl = `/api/comprovante/${orderId}`;
  
  const getImageUrlAbsolute = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${imageUrl}`;
    }
    return imageUrl;
  };

  const shortCode = orderNumber || orderId.slice(-6).toUpperCase();
  const statusInfo = getOrderStatusLabel(status);

  // Mensagem para acompanhamento no WhatsApp
  const formattedTotal = totalAmount ? ` no valor de *R$ ${totalAmount.toFixed(2)}*` : "";
  const whatsappMessage = `Olá ${storeName}! 👋\n\nAcabei de fazer o pedido *#${shortCode}*${formattedTotal}.\n\nGostaria de acompanhar o andamento do meu pedido por aqui!\nComprovante: ${getImageUrlAbsolute()}`;
  const whatsappUrl = storeWhatsApp ? createWhatsAppLink(storeWhatsApp, whatsappMessage) : null;

  const handleDownload = async () => {
    setLoadingAction(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Recibo_Pedido_${shortCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar:", error);
      alert("Não foi possível baixar a imagem.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getImageUrlAbsolute());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareOrCopyImage = async () => {
    setLoadingAction(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `Recibo_${shortCode}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Comprovante de Pedido #${shortCode}`,
          text: `Aqui está o comprovante do pedido #${shortCode} em ${storeName}!`,
        });
      } else {
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
        alert("Imagem copiada! Cole (Ctrl+V) na conversa do WhatsApp.");
      }
    } catch (error) {
      console.error("Erro ao compartilhar/copiar:", error);
      alert("Seu navegador não suporta cópia direta. Por favor, use o botão de Download.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center py-6 px-4 sm:px-6">
      <div className="w-full max-w-xl flex flex-col space-y-4">
        
        {/* Top Header / Voltar */}
        <div className="flex items-center justify-between text-white">
          {storeSlug ? (
            <Link
              href={`/loja/${storeSlug}`}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para a Loja</span>
            </Link>
          ) : (
            <div />
          )}

          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Banner de Sucesso pós-checkout */}
        {justOrdered && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Pedido Realizado com Sucesso!</h4>
              <p className="text-xs text-emerald-200/80">
                Seu pedido #{shortCode} foi registrado. Acompanhe abaixo pelo WhatsApp.
              </p>
            </div>
          </div>
        )}

        {/* Botão de Destaque: Acompanhar pelo WhatsApp */}
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-4 px-6 rounded-2xl shadow-xl shadow-emerald-500/20 transition active:scale-[0.98] text-base group"
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span>Acompanhar Pedido pelo WhatsApp</span>
          </a>
        )}

        {/* Card do Comprovante */}
        <div className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          
          {/* Barra de Ações Rápidas */}
          <div className="bg-gray-900 text-white p-3.5 flex flex-wrap items-center justify-center gap-2.5 border-b border-gray-800 shrink-0">
            <button 
              onClick={handleDownload}
              disabled={loadingAction}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50"
            >
              <Download size={14} />
              Baixar
            </button>

            <button 
              onClick={handleShareOrCopyImage}
              disabled={loadingAction}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50"
            >
              {copiedImage ? <Check size={14} /> : <Share2 size={14} />}
              {copiedImage ? "Copiado!" : "Compartilhar"}
            </button>

            <button 
              onClick={handleCopyLink}
              disabled={loadingAction}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50"
            >
              {copiedLink ? <Check size={14} className="text-green-400" /> : <LinkIcon size={14} />}
              {copiedLink ? "Copiado" : "Copiar Link"}
            </button>
          </div>

          {/* Imagem do Comprovante */}
          <div className="relative w-full bg-gray-100 flex-1 overflow-auto flex items-start justify-center p-4 sm:p-6 min-h-[50vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imageUrl} 
              alt={`Comprovante ${orderId}`} 
              className="w-full max-w-[380px] h-auto shadow-2xl rounded-xl border border-gray-200"
            />
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            {storeName} • Powered by <strong className="text-gray-400">vitrinia</strong>
          </p>
        </div>

      </div>
    </div>
  );
}
