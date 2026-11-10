import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const normalizedProvider = provider.toUpperCase().replace("-", "_");

  try {
    let orderId: string | null = null;
    let paymentStatus: string | null = null;
    let externalPaymentId: string | null = null;

    // Parser específico por Gateway
    if (normalizedProvider === "MERCADO_PAGO" || normalizedProvider === "MERCADOPAGO") {
      const body = await req.json().catch(() => ({}));
      // Mercado Pago envia { action: "payment.updated", data: { id: "12345" } }
      if (body.type === "payment" || body.action?.includes("payment")) {
        externalPaymentId = String(body.data?.id || body.id);
        // O status real pode ser consultado se necessário ou recebido via webhook
        paymentStatus = "approved";
      }
    } else if (normalizedProvider === "ASAAS") {
      const body = await req.json().catch(() => ({}));
      // Asaas envia { event: "PAYMENT_RECEIVED", payment: { id: "pay_123", externalReference: "order_id" } }
      if (body.event === "PAYMENT_RECEIVED" || body.event === "PAYMENT_CONFIRMED") {
        externalPaymentId = body.payment?.id;
        orderId = body.payment?.externalReference;
        paymentStatus = "approved";
      }
    } else if (normalizedProvider === "PABANK" || normalizedProvider === "PAGBANK") {
      const body = await req.json().catch(() => ({}));
      // PagBank envia charges com status "PAID"
      if (body.charges?.[0]?.status === "PAID") {
        externalPaymentId = body.charges[0].id;
        orderId = body.reference_id;
        paymentStatus = "approved";
      }
    } else if (normalizedProvider === "STRIPE") {
      const body = await req.json().catch(() => ({}));
      if (body.type === "checkout.session.completed" || body.type === "payment_intent.succeeded") {
        const object = body.data?.object;
        externalPaymentId = object?.id;
        orderId = object?.metadata?.orderId;
        paymentStatus = "approved";
      }
    }

    // Busca o pedido por orderId ou pixPaymentId
    let order = null;
    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { tenant: true },
      });
    } else if (externalPaymentId) {
      order = await prisma.order.findFirst({
        where: { pixPaymentId: externalPaymentId },
        include: { tenant: true },
      });
    }

    if (!order) {
      // Retorna 200 para o gateway não ficar reenviando indefinidamente se o pedido ainda não existir
      return NextResponse.json({ received: true, note: "Pedido não localizado" }, { status: 200 });
    }

    // REGRA DE PRODUTO PLG:
    // A baixa automática via Webhook só é liberada se o lojista for Plano PRO!
    if (order.tenant.plan !== "PRO") {
      return NextResponse.json(
        { received: true, note: "Loja no Plano Gratuito. Baixa automática requer Plano PRO." },
        { status: 200 }
      );
    }

    if (paymentStatus === "approved") {
      await prisma.$transaction(async (tx) => {
        // Atualiza status do pedido para confirmado/preparando
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "CONFIRMED",
            pixPaymentId: externalPaymentId || order.pixPaymentId,
            observation: order.observation
              ? `${order.observation}\n[PAGAMENTO PIX CONFIRMADO AUTOMATICAMENTE VIA ${normalizedProvider}]`
              : `[PAGAMENTO PIX CONFIRMADO AUTOMATICAMENTE VIA ${normalizedProvider}]`,
          },
        });

        // Se houver agendamento pendente, confirma o horário
        const appointment = await tx.appointment.findFirst({
          where: { orderId: order.id },
        });

        if (appointment) {
          await tx.appointment.update({
            where: { id: appointment.id },
            data: { status: "CONFIRMED" },
          });
        }
      });
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err: any) {
    console.error("Erro no processamento do webhook:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

