import type { MetadataRoute } from 'next'

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vetor.ai').replace(/\/$/, '')
}

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl()
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard', '/tools', '/configuracoes', '/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
