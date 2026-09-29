"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { 
  QrCode, 
  Copy, 
  Check, 
  Share2, 
  Download, 
  Printer, 
  ExternalLink, 
  X,
  MessageCircle,
  Sparkles
} from "lucide-react";
import { createWhatsAppLink } from "@/lib/whatsapp";

interface StoreShareProps {
  slug: string;
  storeName: string;
  logoUrl?: string | null;
  initialOpen?: boolean;
  onClose?: () => void;
  asModal?: boolean;
}

export function StoreShareModal({
  slug,
  storeName,
  logoUrl,
  initialOpen = false,
  onClose,
  asModal = false,
}: StoreShareProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Determina URL completa da vitrine dinamicamente
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const storeUrl = origin ? `${origin}/loja/${slug}` : `/loja/${slug}`;

  // Gera o QR Code quando a URL estiver pronta
  useEffect(() => {
    if (!storeUrl) return;
    setIsGenerating(true);
    QRCode.toDataURL(
      storeUrl,
      {
        width: 600,
        margin: 2,
        color: {
          dark: "#1e1b4b", // Vitrinia dark indigo
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      },
      (err, url) => {
        setIsGenerating(false);
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [storeUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const message = `🛍️ *Olá! Conheça a nossa loja online:*\n\nVeja nossos produtos, serviços e faça seu pedido direto pelo link:\n👉 ${storeUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `QRCode-Loja-${slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const content = (
    <div className="space-y-6">
      {/* Cabeçalho do Card */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-vitrinia-purple/10 flex items-center justify-center text-vitrinia-purple">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Divulgação e Acesso da Loja</h3>
            <p className="text-sm text-gray-500">
              Compartilhe o link da sua vitrine ou imprima o QR Code para clientes no balcão e mesas.
            </p>
          </div>
        </div>
        {asModal && onClose && (
          <button
            onClick={() => {
              setIsOpen(false);
              onClose();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Bloco do Link com Ações */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Link da sua Vitrine Online
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-700 truncate shadow-inner">
            {storeUrl}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-bold transition shadow-sm"
              title="Abrir Loja em nova aba"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Botão Enviar no WhatsApp */}
        <button
          onClick={handleShareWhatsApp}
          className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-[0.98]"
        >
          <MessageCircle className="w-5 h-5" />
          Enviar Link no WhatsApp
        </button>
      </div>

      {/* Bloco do QR Code e Impressão de Mesa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        {/* Placa visual para exibição e impressão */}
        <div 
          ref={printRef}
          className="relative bg-gradient-to-b from-gray-50 to-white border-2 border-gray-200 rounded-3xl p-6 text-center flex flex-col items-center shadow-md print:border-black print:shadow-none"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-vitrinia-purple/10 text-vitrinia-purple rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Faça seu pedido pelo celular
          </div>

          <h4 className="text-xl font-black text-gray-900 mb-1">{storeName}</h4>
          <p className="text-xs text-gray-500 mb-4">Aponte a câmera para o QR Code abaixo</p>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 inline-block mb-3">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR Code da loja ${storeName}`}
                className="w-48 h-48 object-contain"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                Gerando QR Code...
              </div>
            )}
          </div>

          <p className="text-[11px] font-mono text-gray-500 break-all max-w-[220px]">
            {storeUrl.replace("https://", "").replace("http://", "")}
          </p>
        </div>

        {/* Ações do QR Code */}
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-gray-900 text-base mb-1">Display de Mesa & Balcão</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Posicione esse QR Code no balcão ou nas mesas da sua loja. O cliente aponta a câmera, se identifica no WhatsApp e faz o pedido sem filas!
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleDownloadQr}
              disabled={!qrDataUrl || isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl shadow transition active:scale-[0.98] disabled:opacity-50 text-sm"
            >
              <Download className="w-4 h-4" />
              Baixar Imagem QR Code (PNG)
            </button>

            <button
              onClick={handlePrint}
              disabled={!qrDataUrl || isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl transition shadow-sm active:scale-[0.98] text-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir Display para Mesa / Balcão
            </button>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-xs text-blue-800">
              💡 <strong>Dica:</strong> Você também pode colar esse QR Code em panfletos, cartões de visita e nas embalagens dos seus produtos!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!asModal) {
    return content;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-vitrinia-purple to-indigo-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-vitrinia-purple/20 hover:opacity-95 transition active:scale-95 text-sm"
      >
        <QrCode className="w-4 h-4" />
        Divulgar Loja (Link & QR Code)
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
