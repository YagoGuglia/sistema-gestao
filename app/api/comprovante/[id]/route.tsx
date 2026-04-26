import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // We can't use prisma edge properly with standard import without prisma/client/edge. 
    // Since prisma accelerate is not set up, let's remove runtime = 'edge' to use standard Node runtime.
    // Wait, the Next.js App router API supports Node runtime by default. Let's not use edge to avoid Prisma issues.

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return new Response('Pedido não encontrado', { status: 404 });
    }

    const settings = await prisma.globalSettings.findUnique({
      where: { id: 'default' },
    });

    const companyName = settings?.companyName || 'Minha Loja';
    const companyLogo = settings?.companyLogoUrl || null;

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
            fontFamily: 'sans-serif',
            padding: '40px',
            color: '#111827', // text-gray-900
          }}
        >
          {/* Fundo imitando papel */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              maxWidth: '600px',
              backgroundColor: '#ffffff',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '40px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Header: Logo e Empresa */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderBottom: '2px dashed #e5e7eb',
                paddingBottom: '20px',
                marginBottom: '20px',
              }}
            >
              {companyLogo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={companyLogo}
                  alt={companyName}
                  style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '10px' }}
                />
              )}
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0' }}>{companyName}</h1>
              <p style={{ fontSize: '18px', color: '#6b7280', margin: '10px 0 0 0' }}>COMPROVANTE DE PEDIDO</p>
            </div>

            {/* Informações do Cliente e Pedido */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
                <span style={{ fontWeight: 'bold' }}>Cliente:</span>
                <span>{order.user.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
                <span style={{ fontWeight: 'bold' }}>Data:</span>
                <span>
                  {new Date(order.createdAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
                <span style={{ fontWeight: 'bold' }}>Pedido Nº:</span>
                <span>{order.id.slice(-6).toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
                <span style={{ fontWeight: 'bold' }}>Tipo:</span>
                <span>{order.orderType === 'DELIVERY' ? 'Entrega' : 'Retirada'}</span>
              </div>
            </div>

            {/* Itens do Pedido */}
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '30px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  borderBottom: '2px solid #e5e7eb',
                  paddingBottom: '10px',
                  marginBottom: '10px',
                }}
              >
                <span style={{ flex: 1 }}>Item</span>
                <span style={{ width: '80px', textAlign: 'center' }}>Qtd</span>
                <span style={{ width: '120px', textAlign: 'right' }}>Total</span>
              </div>

              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderBottom: '1px solid #f3f4f6',
                    padding: '10px 0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
                    <span style={{ flex: 1, fontWeight: '500' }}>{item.product.name}</span>
                    <span style={{ width: '80px', textAlign: 'center' }}>{item.quantity}</span>
                    <span style={{ width: '120px', textAlign: 'right' }}>
                      R$ {(item.quantity * item.price).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  {item.observation && (
                    <span style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                      Obs: {item.observation}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Totais */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {order.deliveryFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', color: '#4b5563' }}>
                  <span>Taxa de Entrega</span>
                  <span>R$ {order.deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginTop: '10px',
                  paddingTop: '10px',
                  borderTop: '2px solid #e5e7eb',
                }}
              >
                <span>TOTAL</span>
                <span>R$ {order.totalAmount.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            {/* Rodapé */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '40px',
                paddingTop: '20px',
                borderTop: '2px dashed #e5e7eb',
                color: '#6b7280',
                fontSize: '16px',
              }}
            >
              <span>Agradecemos a preferência!</span>
              <span style={{ fontSize: '14px', marginTop: '4px' }}>Gerado por SIS PqEmp</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 800,
        height: 1200, // Altura flexível
      }
    );
  } catch (error) {
    console.error(error);
    return new Response('Erro interno', { status: 500 });
  }
}
