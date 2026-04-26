"use client";

import { useState } from "react";
import { Download, Share2, Link as LinkIcon, Check, Copy } from "lucide-react";

export function ReceiptViewer({ orderId }: { orderId: string }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const imageUrl = `/api/comprovante/${orderId}`;
  
  const getImageUrlAbsolute = () => {
    return `${window.location.origin}${imageUrl}`;
  };

  const handleDownload = async () => {
    setLoadingAction(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Recibo_Pedido_${orderId.slice(-6).toUpperCase()}.png`;
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
      const file = new File([blob], `Recibo_${orderId.slice(-6)}.png`, { type: 'image/png' });

      // Tenta usar a API de Compartilhamento Nativa (Funciona no celular pra mandar pro WhatsApp)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Comprovante de Pedido',
          text: 'Aqui está o comprovante do seu pedido!'
        });
      } else {
        // Fallback: Copiar a imagem para a área de transferência (Funciona no PC para colar no WhatsApp Web)
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
        alert("Imagem copiada! Abra o WhatsApp e cole (Ctrl+V ou Cmd+V) na conversa do cliente.");
      }
    } catch (error) {
      console.error("Erro ao compartilhar/copiar:", error);
      // Alguns navegadores barram o clipboard se não for por interação direta (embora o onClick conte)
      alert("Seu navegador não suporta cópia direta. Por favor, use o botão de Download.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Barra de Ações (Estilo Google Lens) */}
        <div className="bg-gray-900 text-white p-4 flex flex-wrap items-center justify-center gap-3 border-b border-gray-800 shrink-0">
           
           <button 
             onClick={handleDownload}
             disabled={loadingAction}
             className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2.5 rounded-full text-sm font-bold transition active:scale-95 disabled:opacity-50"
           >
             <Download size={16} />
             Baixar
           </button>

           <button 
             onClick={handleShareOrCopyImage}
             disabled={loadingAction}
             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-full text-sm font-bold transition active:scale-95 disabled:opacity-50"
           >
             {copiedImage ? <Check size={16} /> : <Share2 size={16} />}
             {copiedImage ? "Copiado!" : "Enviar Imagem (WhatsApp)"}
           </button>

           <button 
             onClick={handleCopyLink}
             disabled={loadingAction}
             className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2.5 rounded-full text-sm font-bold transition active:scale-95 disabled:opacity-50"
           >
             {copiedLink ? <Check size={16} className="text-green-400" /> : <LinkIcon size={16} />}
             {copiedLink ? "Link Copiado" : "Copiar Link"}
           </button>
           
        </div>

        {/* Container da Imagem com scroll e fundo xadrez */}
        <div className="relative w-full bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-gray-100 flex-1 overflow-auto flex items-start justify-center p-6 sm:p-10 min-h-[60vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={imageUrl} 
            alt={`Comprovante ${orderId}`} 
            className="w-full max-w-[400px] h-auto shadow-2xl rounded-lg"
          />
        </div>

      </div>
    </div>
  );
}
