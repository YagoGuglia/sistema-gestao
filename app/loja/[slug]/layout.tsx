import { CartProvider } from "@/components/vitrine/CartContext";

export default function LojaLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
