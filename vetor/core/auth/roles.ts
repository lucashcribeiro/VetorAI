// Papéis da plataforma (README §10):
// SUPER_ADMIN = eu (via publicMetadata do Clerk) · OWNER = dono da empresa · MEMBER = equipe.
export const ROLES = ['MEMBER', 'OWNER', 'SUPER_ADMIN'] as const
export type Role = (typeof ROLES)[number]

const NIVEL: Record<Role, number> = { MEMBER: 0, OWNER: 1, SUPER_ADMIN: 2 }

export function atLeast(role: Role, minimo: Role): boolean {
  return NIVEL[role] >= NIVEL[minimo]
}

// Mapeia o papel de organização do Clerk para o papel da plataforma.
export function papelFromClerkRole(clerkRole: string): Role {
  return clerkRole === 'org:admin' ? 'OWNER' : 'MEMBER'
}
