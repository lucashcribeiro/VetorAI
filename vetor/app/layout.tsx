import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { spaceGrotesk, workSans, jetbrainsMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://vetor.ai",
  ),
  title: {
    default: "VETOR — ferramentas de IA que o dono opera",
    template: "%s · VETOR",
  },
  description:
    "Consultoria de IA para pequenas empresas brasileiras. Ferramentas sob medida que o próprio cliente opera. Direção + intensidade.",
  openGraph: {
    siteName: "VETOR",
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={ptBR}
      appearance={{
        variables: {
          colorPrimary: "#E04A1F",
          colorForeground: "#171717",
          borderRadius: "8px",
          fontFamily: "'Work Sans', sans-serif",
        },
      }}
    >
      <html lang="pt-BR">
        <body
          className={`${spaceGrotesk.variable} ${workSans.variable} ${jetbrainsMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
