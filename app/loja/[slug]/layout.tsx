import { CartProvider } from "@/components/vitrine/CartContext";
import { CustomerAuthProvider } from "@/components/vitrine/CustomerAuthContext";
import { CustomerLoginModal } from "@/components/vitrine/CustomerLoginModal";
import { CustomerOrdersModal } from "@/components/vitrine/CustomerOrdersModal";

export default async function LojaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  return (
    <CustomerAuthProvider slug={resolvedParams.slug}>
      <CartProvider>
        {children}
        <CustomerLoginModal />
        <CustomerOrdersModal />
      </CartProvider>
    </CustomerAuthProvider>
  );
}
