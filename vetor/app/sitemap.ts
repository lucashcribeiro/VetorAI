import type { MetadataRoute } from 'next'
import { registry } from '@/modules/registry'

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vetor.ai').replace(/\/$/, '')
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/ferramentas`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/contato`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/termos`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/privacidade`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
  const tools = registry.map((m) => ({
    url: `${base}/ferramentas/${m.manifest.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
  return [...staticPages, ...tools]
}
