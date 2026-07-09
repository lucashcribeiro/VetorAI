import type { Metadata } from "next";
import { spaceGrotesk, workSans, jetbrainsMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "VETOR — plataforma",
  description:
    "Ferramentas de IA sob medida que o próprio cliente opera. Direção + intensidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${spaceGrotesk.variable} ${workSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
