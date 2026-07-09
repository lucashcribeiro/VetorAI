import Link from "next/link";
import { Logo } from "@/core/ui/Logo";

/* Landing pública mínima — o site de verdade (cardápio de ferramentas) é a Fase 4. */
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-6">
      <Logo variant="full" tone="positive" size={40} />
      <p
        className="max-w-md text-center text-pedra"
        style={{ fontSize: "var(--text-lead)" }}
      >
        Consultoria de IA para pequenas empresas: ferramentas sob medida que o
        próprio cliente opera.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg px-6 py-3 font-semibold text-branco"
        style={{ background: "var(--accent)" }}
      >
        Entrar na plataforma
      </Link>
      <span
        className="text-pedra lowercase"
        style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
      >
        direção + intensidade
      </span>
    </main>
  );
}
