import type { MetadataRoute } from 'next';

// Equivalent of the robots.txt the Figma Make Vite plugin emitted (site.json robots.index: false).
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', disallow: '/' } };
}
