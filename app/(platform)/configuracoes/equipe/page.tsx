import { OrganizationProfile } from '@clerk/nextjs'
import { EyebrowLabel } from '@/core/ui/EyebrowLabel'

// Gestão de equipe: o Clerk cuida de convites, papéis e remoção.
// OWNER convida/remove; MEMBER só visualiza (papéis da organização).
export default function EquipePage() {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <EyebrowLabel tone="muted">equipe · quem pode entrar e o que pode fazer</EyebrowLabel>
      </div>
      <OrganizationProfile routing="hash" />
    </div>
  )
}
