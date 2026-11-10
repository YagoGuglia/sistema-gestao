// lib/gateways/refund.ts - Motor de Estorno de Pagamentos nos Gateways Suportados

export type GatewayProvider = "MERCADO_PAGO" | "PABANK" | "ASAAS" | "STRIPE" | "NONE";

export interface RefundRequest {
  provider: GatewayProvider;
  accessToken: string;
  paymentId: string;
  amount?: number; // Valor a estornar (opcional para estorno total)
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  message?: string;
  rawResponse?: any;
}

/**
 * Executa estorno automático no gateway configurado pelo lojista
 */
export async function executeGatewayRefund(req: RefundRequest): Promise<RefundResult> {
  const { provider, accessToken, paymentId, amount, reason } = req;

  if (!paymentId) {
    return { success: false, message: "ID do pagamento não encontrado para este pedido." };
  }

  if (!accessToken) {
    return { success: false, message: "Token de acesso do Gateway não está configurado nas Configurações da Loja." };
  }

  try {
    switch (provider) {
      case "MERCADO_PAGO": {
        // Mercado Pago Refund API
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}/refunds`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: amount ? JSON.stringify({ amount }) : JSON.stringify({}),
        });

        const data = await response.json();
        if (response.ok && (data.status === "approved" || data.id)) {
          return { success: true, refundId: String(data.id), rawResponse: data };
        }
        return {
          success: false,
          message: data.message || "Falha ao processar estorno no Mercado Pago.",
          rawResponse: data,
        };
      }

      case "ASAAS": {
        // Asaas Refund API
        const response = await fetch(`https://api.asaas.com/v3/payments/${paymentId}/refund`, {
          method: "POST",
          headers: {
            access_token: accessToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            value: amount,
            description: reason || "Cancelamento do pedido dentro do prazo",
          }),
        });

        const data = await response.json();
        if (response.ok && (data.status === "REFUNDED" || data.status === "REFUND_REQUESTED")) {
          return { success: true, refundId: String(data.id || paymentId), rawResponse: data };
        }
        return {
          success: false,
          message: data.errors?.[0]?.description || "Falha ao processar estorno no Asaas.",
          rawResponse: data,
        };
      }

      case "PABANK": {
        // PagBank / PagSeguro Cancel & Refund API
        const response = await fetch(`https://api.pagseguro.com/charges/${paymentId}/cancel`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: amount ? JSON.stringify({ amount: { value: Math.round(amount * 100) } }) : JSON.stringify({}),
        });

        const data = await response.json();
        if (response.ok && (data.status === "CANCELED" || data.status === "PAID_REVERSED")) {
          return { success: true, refundId: String(data.id || paymentId), rawResponse: data };
        }
        return {
          success: false,
          message: data.message || "Falha ao processar estorno no PagBank.",
          rawResponse: data,
        };
      }

      case "STRIPE": {
        // Stripe Refund API
        const params = new URLSearchParams();
        params.append("payment_intent", paymentId);
        if (amount) {
          params.append("amount", String(Math.round(amount * 100)));
        }

        const response = await fetch("https://api.stripe.com/v1/refunds", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        });

        const data = await response.json();
        if (response.ok && data.id) {
          return { success: true, refundId: data.id, rawResponse: data };
        }
        return {
          success: false,
          message: data.error?.message || "Falha ao processar estorno na Stripe.",
          rawResponse: data,
        };
      }

      default:
        return {
          success: false,
          message: `Gateway "${provider}" não suporta estorno automatizado ou não está configurado.`,
        };
    }
  } catch (err: any) {
    console.error("Erro na comunicação com gateway:", err);
    return { success: false, message: `Erro de conexão com o Gateway: ${err.message}` };
  }
}

