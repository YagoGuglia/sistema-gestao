import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vitrinia - O seu negócio sempre aberto",
  description: "A evolução da vitrine física. Tecnologia simplificada para gerenciar seu pequeno negócio, estoque, pedidos e agendamentos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} h-full antialiased`}>
      <body className="h-full font-sans bg-vitrinia-bg text-gray-900">
        {children}
      </body>
    </html>
  );
}
