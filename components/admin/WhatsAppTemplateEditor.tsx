"use client";

import { useState } from "react";
import { MessageCircle, Save, RotateCcw, Eye, Info } from "lucide-react";

export interface WhatsAppTemplates {
  orderConfirmed: string;
  orderPreparing: string;
  orderReady: string;
  orderDelivery: string;
  orderCancelled: string;
  appointmentConfirmed: string;
  appointmentReminder: string;
  appointmentCancelled: string;
}

const DEFAULT_TEMPLATES: WhatsAppTemplates = {
  orderConfirmed: `Olá *{{clientName}}*! 👋

✅ Seu pedido *#{{orderCode}}* foi *confirmado* com sucesso!

📋 *Resumo do Pedido:*
{{items}}

💰 *Total:* R$ {{totalAmount}}

Acompanhe o status por aqui.
📄 Comprovante: {{receiptUrl}}

_{{storeName}}_`,

  orderPreparing: `*{{clientName}}*, seu pedido *#{{orderCode}}* está sendo *preparado*! 🔥

Aguarde que avisaremos quando estiver pronto.

_{{storeName}}_`,

  orderReady: `*{{clientName}}*, seu pedido *#{{orderCode}}* está *pronto*! ✅

🏪 Pode retirar no balcão ou aguardar a entrega.

_{{storeName}}_`,

  orderDelivery: `*{{clientName}}*, seu pedido *#{{orderCode}}* *saiu para entrega*! 🛵

Fique atento, logo chegará no seu endereço.

_{{storeName}}_`,

  orderCancelled: `*{{clientName}}*, infelizmente seu pedido *#{{orderCode}}* foi *cancelado*.

Se tiver dúvidas, entre em contato: {{storePhone}}

_{{storeName}}_`,

  appointmentConfirmed: `*{{clientName}}*, seu agendamento foi *confirmado*! ✅

📅 *Data e Hora:* {{scheduledAt}}
📋 Pedido: *#{{orderCode}}*
💰 Valor: R$ {{totalAmount}}

Qualquer dúvida, fale conosco: {{storePhone}}

_{{storeName}}_`,

  appointmentReminder: `⏰ *Lembrete de agendamento!*

Olá *{{clientName}}*, não esqueça do seu horário:

📅 *{{scheduledAt}}*
📋 Pedido: *#{{orderCode}}*

Nos vemos em breve! 😊

_{{storeName}}_`,

  appointmentCancelled: `*{{clientName}}*, seu agendamento de {{scheduledAt}} foi *cancelado*.

Caso queira reagendar, acesse nosso link ou fale conosco: {{storePhone}}

_{{storeName}}_`,
};

const TEMPLATE_META: { key: keyof WhatsAppTemplates; label: string; desc: string }[] = [
  {
    key: "orderConfirmed",
    label: "Pedido Confirmado",
    desc: "Enviada quando o lojista confirma um pedido recebido.",
  },
  {
    key: "orderPreparing",
    label: "Pedido em Preparo",
    desc: "Enviada quando o status muda para Preparando.",
  },
  {
    key: "orderReady",
    label: "Pedido Pronto",
    desc: "Enviada quando o pedido está pronto para retirada.",
  },
  {
    key: "orderDelivery",
    label: "Saiu para Entrega",
    desc: "Enviada quando o pedido sai para delivery.",
  },
  {
    key: "orderCancelled",
    label: "Pedido Cancelado",
    desc: "Enviada quando o pedido é cancelado pelo lojista.",
  },
  {
    key: "appointmentConfirmed",
    label: "Agendamento Confirmado",
    desc: "Enviada ao confirmar um agendamento.",
  },
  {
    key: "appointmentReminder",
    label: "Lembrete de Agendamento",
    desc: "Enviada como lembrete antes do horário agendado.",
  },
  {
    key: "appointmentCancelled",
    label: "Agendamento Cancelado",
    desc: "Enviada ao cancelar um agendamento.",
  },
];

const VARIABLES = [
  { var: "{{clientName}}", desc: "Nome do cliente" },
  { var: "{{orderCode}}", desc: "Código do pedido (ex: A1B2C3)" },
  { var: "{{totalAmount}}", desc: "Valor total do pedido" },
  { var: "{{storeName}}", desc: "Nome da loja" },
  { var: "{{storePhone}}", desc: "WhatsApp da loja" },
  { var: "{{scheduledAt}}", desc: "Data e hora do agendamento" },
  { var: "{{receiptUrl}}", desc: "Link do comprovante digital" },
  { var: "{{items}}", desc: "Lista de itens do pedido" },
];

interface WhatsAppTemplateEditorProps {
  initialTemplates: string | null; // JSON string from DB
}

export function WhatsAppTemplateEditor({ initialTemplates }: WhatsAppTemplateEditorProps) {
  const parsed: WhatsAppTemplates = initialTemplates
    ? { ...DEFAULT_TEMPLATES, ...JSON.parse(initialTemplates) }
    : { ...DEFAULT_TEMPLATES };

  const [templates, setTemplates] = useState<WhatsAppTemplates>(parsed);
  const [activeTab, setActiveTab] = useState<keyof WhatsAppTemplates>("orderConfirmed");
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (key: keyof WhatsAppTemplates, value: string) => {
    setTemplates((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = (key: keyof WhatsAppTemplates) => {
    setTemplates((prev) => ({ ...prev, [key]: DEFAULT_TEMPLATES[key] }));
  };

  const previewMessage = (text: string) => {
    return text
      .replace(/\{\{clientName\}\}/g, "João Silva")
      .replace(/\{\{orderCode\}\}/g, "A1B2C3")
      .replace(/\{\{totalAmount\}\}/g, "89,90")
      .replace(/\{\{storeName\}\}/g, "Minha Loja")
      .replace(/\{\{storePhone\}\}/g, "(11) 99999-9999")
      .replace(/\{\{scheduledAt\}\}/g, "15/01/2027 às 14:30")
      .replace(/\{\{receiptUrl\}\}/g, "https://sualoja.com/recibo/abc123")
      .replace(/\{\{items\}\}/g, "1x Bolo de Chocolate - R$45,00\n1x Brigadeiro (10un) - R$25,00");
  };

  const activeMeta = TEMPLATE_META.find((t) => t.key === activeTab)!;

  return (
    <div className="space-y-5">
      {/* Hidden input com o JSON para o form action */}
      <input type="hidden" name="whatsappTemplates" value={JSON.stringify(templates)} />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {TEMPLATE_META.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
              activeTab === t.key
                ? "bg-green-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-gray-900">{activeMeta.label}</h4>
              <p className="text-xs text-gray-500">{activeMeta.desc}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleReset(activeTab)}
                className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition"
                title="Restaurar padrão"
              >
                <RotateCcw size={12} />
                Padrão
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg transition ${
                  showPreview
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <Eye size={12} />
                Preview
              </button>
            </div>
          </div>

          <textarea
            value={templates[activeTab]}
            onChange={(e) => handleChange(activeTab, e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-500 outline-none transition text-sm font-mono leading-relaxed min-h-[240px] resize-y"
            placeholder="Digite o template da mensagem..."
          />
        </div>

        {/* Preview / Variables */}
        <div className="space-y-4">
          {showPreview ? (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Preview da Mensagem
              </h4>
              <div className="bg-[#ECE5DD] rounded-2xl p-4 min-h-[240px]">
                <div className="bg-[#DCF8C6] rounded-2xl rounded-tl-sm p-3.5 shadow-sm max-w-[90%] ml-auto">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {previewMessage(templates[activeTab])
                      .replace(/\*(.*?)\*/g, "⟨b⟩$1⟨/b⟩")
                      .replace(/_(.*?)_/g, "⟨i⟩$1⟨/i⟩")
                      .split("⟨b⟩")
                      .map((part, i) => {
                        if (part.includes("⟨/b⟩")) {
                          const [bold, rest] = part.split("⟨/b⟩");
                          return (
                            <span key={i}>
                              <strong>{bold}</strong>
                              {rest}
                            </span>
                          );
                        }
                        if (part.includes("⟨i⟩")) {
                          return part.split("⟨i⟩").map((iPart, j) => {
                            if (iPart.includes("⟨/i⟩")) {
                              const [italic, rest2] = iPart.split("⟨/i⟩");
                              return (
                                <span key={`${i}-${j}`}>
                                  <em className="text-gray-600">{italic}</em>
                                  {rest2}
                                </span>
                              );
                            }
                            return iPart;
                          });
                        }
                        return part;
                      })}
                  </p>
                  <p className="text-[10px] text-gray-500 text-right mt-1">14:32 ✓✓</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Info size={12} />
                Variáveis Disponíveis
              </h4>
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-2">
                {VARIABLES.map((v) => (
                  <div key={v.var} className="flex items-center justify-between gap-2">
                    <code className="text-xs font-mono font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                      {v.var}
                    </code>
                    <span className="text-xs text-gray-500">{v.desc}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs text-blue-800 leading-relaxed">
                  💡 <strong>Dica de formatação WhatsApp:</strong> Use{" "}
                  <code className="bg-blue-100 px-1 rounded">*texto*</code> para <strong>negrito</strong>,{" "}
                  <code className="bg-blue-100 px-1 rounded">_texto_</code> para <em>itálico</em>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

