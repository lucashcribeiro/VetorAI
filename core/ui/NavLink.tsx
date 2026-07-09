'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'

/** Item de navegação da sidebar — estado ativo por rota, hover sutil. */
export function NavLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  const pathname = usePathname()
  const [hover, setHover] = useState(false)
  const ativo = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        borderRadius: 8,
        fontSize: 13.5,
        fontWeight: ativo ? 600 : 500,
        color: 'var(--osso)',
        opacity: ativo ? 1 : 0.75,
        background: ativo
          ? 'rgba(240,238,232,.12)'
          : hover
            ? 'rgba(240,238,232,.08)'
            : 'transparent',
        transition: 'background .12s ease, opacity .12s ease',
        textDecoration: 'none',
      }}
    >
      {children}
    </Link>
  )
}
