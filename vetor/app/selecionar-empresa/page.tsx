import { OrganizationList } from '@clerk/nextjs'
import { Logo } from '@/core/ui/Logo'

// Usuário logado sem organização ativa: escolhe (ou cria) a empresa.
export default function SelecionarEmpresaPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-6">
      <Logo variant="full" tone="positive" size={28} />
      <p className="text-pedra" style={{ fontSize: 'var(--text-body)' }}>
        Escolha a empresa para entrar na plataforma.
      </p>
      <OrganizationList afterSelectOrganizationUrl="/dashboard" hidePersonal />
    </main>
  )
}
