// Papéis da plataforma:
// SUPER_ADMIN = operador VETOR (role no User) · OWNER = dono da empresa · MEMBER = equipe.
export const ROLES = ['MEMBER', 'OWNER', 'SUPER_ADMIN'] as const
export type Role = (typeof ROLES)[number]

const NIVEL: Record<Role, number> = { MEMBER: 0, OWNER: 1, SUPER_ADMIN: 2 }

export function atLeast(role: Role, minimo: Role): boolean {
  return NIVEL[role] >= NIVEL[minimo]
}

export function asRole(valor: string | null | undefined): Role {
  if (valor === 'SUPER_ADMIN' || valor === 'OWNER' || valor === 'MEMBER') return valor
  return 'MEMBER'
}
