"use client";

import { useEffect, useState } from "react";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";

export interface ThermalReceiptProps {
  order: {
    id: string;
    createdAt: Date | string;
    totalAmount: number;
    deliveryFee?: number;
    orderType: string;
    paymentMethod: string;
    paymentTiming: string;
    changeAmount?: number | null;
    status: string;
    scheduledAt?: Date | string | null;
    observation?: string | null;
    user: {
      name: string;
      phone: string;
    };
    items: {
      id: string;
      quantity: number;
      price: number;
      observation?: string | null;
      product: {
        name: string;
      };
    }[];
    deliveryStreet?: string | null;
    deliveryNumber?: string | null;
    deliveryComplement?: string | null;
    deliveryNeighborhood?: string | null;
    deliveryCity?: string | null;
    tenant: {
      name: string;
      settings?: {
        companyName?: string;
        companyLogoUrl?: string | null;
        logoUrl?: string | null;
        whatsappNumber?: string | null;
      } | null;
    };
  };
  autoPrint?: boolean;
}

export function ThermalReceipt({ order, autoPrint = false }: ThermalReceiptProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    // Gera QR Code com URL do recibo digital
    const receiptUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/recibo/${order.id}`
        : `/recibo/${order.id}`;

    QRCode.toDataURL(
      receiptUrl,
      {
        width: 140,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "M",
      },
      (err, url) => {
        if (!err && url) setQrDataUrl(url);
      }
    );
  }, [order.id]);

  useEffect(() => {
    if (autoPrint && qrDataUrl) {
      // Espera o QR Code renderizar antes de imprimir
      const timer = setTimeout(() => window.print(), 300);
      return () => clearTimeout(timer);
    }
  }, [autoPrint, qrDataUrl]);

  const companyName = order.tenant.settings?.companyName || order.tenant.name;
  const shortId = order.id.slice(-6).toUpperCase();
  const dateFormatted = new Date(order.createdAt).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const paymentLabels: Record<string, string> = {
    PIX: "PIX",
    MONEY: "DINHEIRO",
    CARD_DEBIT: "CARTÃO DÉBITO",
    CARD_CREDIT: "CARTÃO CRÉDITO",
  };

  const orderTypeLabels: Record<string, string> = {
    DELIVERY: "ENTREGA",
    PICKUP: "RETIRADA",
    LOCAL: "LOCAL",
  };

  const subtotal = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="bg-gray-100 min-h-screen py-6 flex flex-col items-center">
      {/* Botões de Ação na Tela (Ocultos na Impressão) */}
      <div className="print:hidden flex items-center gap-3 mb-6">
        <Link
          href={`/recibo/${order.id}`}
          className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-white px-3 py-2 rounded-xl shadow-sm hover:bg-gray-50 border border-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Recibo
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-xs font-bold text-white bg-black hover:bg-gray-800 px-4 py-2 rounded-xl shadow-md transition active:scale-95"
        >
          <Printer className="w-4 h-4" />
          Imprimir Térmica (58mm)
        </button>
      </div>

      {/* Container Exclusivo para POS 58mm */}
      <div
        id="pos58-container"
        className="w-[188px] max-w-[48mm] bg-white text-black p-2 font-mono text-[10px] leading-tight border border-gray-300 print:border-none print:m-0 print:p-0 shadow-lg print:shadow-none"
      >
        <style jsx global>{`
          @media print {
            @page {
              size: 58mm auto;
              margin: 0;
            }
            body {
              background: #fff !important;
              color: #000 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            header,
            footer,
            nav {
              display: none !important;
            }
          }
        `}</style>

        {/* Cabeçalho Térmico */}
        <div className="text-center pb-1 border-b border-black border-dashed">
          {(order.tenant.settings?.logoUrl || order.tenant.settings?.companyLogoUrl) && (
            <div className="flex justify-center mb-1.5">
              <img
                src={order.tenant.settings.logoUrl || order.tenant.settings.companyLogoUrl || ""}
                alt="Logo da Loja"
                className="max-h-12 max-w-[120px] object-contain filter grayscale contrast-150"
              />
            </div>
          )}
          <p className="font-bold text-[12px] uppercase tracking-tighter truncate">
            {companyName}
          </p>
          <p className="text-[9px]">COMPROVANTE DE PEDIDO</p>
          <p className="font-bold text-[11px] mt-0.5">PEDIDO #{shortId}</p>
          <p className="text-[8px]">{dateFormatted}</p>
        </div>

        {/* Dados do Cliente */}
        <div className="py-1 border-b border-black border-dashed text-[9px]">
          <p className="truncate">
            <span className="font-bold">CLI:</span> {order.user.name}
          </p>
          <p>
            <span className="font-bold">TEL:</span> {order.user.phone}
          </p>
          <p>
            <span className="font-bold">TIPO:</span>{" "}
            {orderTypeLabels[order.orderType] || order.orderType}
          </p>
          {order.scheduledAt && (
            <p className="font-bold">
              AGENDADO:{" "}
              {new Date(order.scheduledAt).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
          )}
          {order.orderType === "DELIVERY" && (
            <div className="mt-0.5 text-[8px] leading-tight">
              <p className="font-bold">ENDEREÇO:</p>
              <p>
                {order.deliveryStreet}, {order.deliveryNumber}
              </p>
              {order.deliveryComplement && <p>{order.deliveryComplement}</p>}
              <p>
                {order.deliveryNeighborhood} - {order.deliveryCity}
              </p>
            </div>
          )}
        </div>

        {/* Itens do Pedido */}
        <div className="py-1 border-b border-black border-dashed">
          <table className="w-full text-left text-[9px]">
            <thead>
              <tr className="border-b border-black">
                <th className="py-0.5">QTD</th>
                <th className="py-0.5">ITEM</th>
                <th className="py-0.5 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="font-bold pr-1">{item.quantity}x</td>
                  <td className="pr-1 break-words">
                    {item.product.name}
                    {item.observation && (
                      <span className="block text-[8px] italic">
                        Obs: {item.observation}
                      </span>
                    )}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    {(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Observação geral */}
        {order.observation && (
          <div className="py-1 border-b border-black border-dashed text-[8px]">
            <p className="font-bold">OBS GERAL:</p>
            <p className="italic">{order.observation}</p>
          </div>
        )}

        {/* Totais */}
        <div className="py-1 border-b border-black border-dashed text-[9px] space-y-0.5">
          <div className="flex justify-between">
            <span>SUBTOTAL:</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          {order.deliveryFee && order.deliveryFee > 0 ? (
            <div className="flex justify-between">
              <span>TAXA ENTREGA:</span>
              <span>R$ {order.deliveryFee.toFixed(2)}</span>
            </div>
          ) : null}
          <div className="flex justify-between font-bold text-[11px] pt-0.5">
            <span>TOTAL:</span>
            <span>R$ {order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Pagamento */}
        <div className="py-1 border-b border-black border-dashed text-[9px]">
          <p>
            <span className="font-bold">PAGAMENTO:</span>{" "}
            {paymentLabels[order.paymentMethod] || order.paymentMethod}
          </p>
          <p>
            <span className="font-bold">MOMENTO:</span>{" "}
            {order.paymentTiming === "NOW_PIX" ? "PAGO VIA PIX" : "NO LOCAL"}
          </p>
          {order.changeAmount && (
            <p className="font-bold">
              LEVAR TROCO P/: R$ {order.changeAmount.toFixed(2)}
            </p>
          )}
        </div>

        {/* QR Code do recibo digital */}
        <div className="py-2 flex flex-col items-center text-center">
          {qrDataUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="QR Code do Recibo"
                className="w-24 h-24"
              />
              <p className="text-[7px] text-gray-600 mt-1">
                Escaneie para ver o recibo digital
              </p>
            </>
          ) : (
            <p className="text-[8px] text-gray-400">Gerando QR Code...</p>
          )}
        </div>

        {/* Rodapé */}
        <div className="text-center pt-1 border-t border-black border-dashed">
          <p className="text-[8px]">--- OBRIGADO PELA PREFERÊNCIA ---</p>
          <p className="text-[7px] text-gray-500 mt-0.5">Powered by Vitrinia</p>
        </div>
      </div>
    </div>
  );
}
