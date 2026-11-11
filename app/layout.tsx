import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { CookieConsent } from "@/components/common/CookieConsent";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Montserrat:wght@400;600;700;900&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600;1,700&family=Poppins:wght@400;600;700;900&family=Roboto:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full font-sans bg-vitrinia-bg text-gray-900">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
