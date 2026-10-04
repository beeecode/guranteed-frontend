import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

const description =
  'Engaging school website and secure CBT portal for students and administrators, enhancing learning experiences and simplifying exam management.';

/*
 * Same Google Fonts stylesheet the Vite app @import-ed. It is linked here rather than loaded via
 * next/font because next/font injects a size-adjusted "<Font> Fallback" face into every
 * font-family chain, which changes how glyphs missing from Fredoka (→ ✓ ● …) render.
 */
const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,900;1,400;1,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap';

export const metadata: Metadata = {
  title: { default: 'Guaranteed Future Model Schools', template: '%s · GFMS' },
  description,
  // Carried over from .figma/make/site.json (robots.index: false).
  robots: { index: false, follow: false },
  openGraph: { title: 'Guaranteed Future Model Schools', description },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior lets Next skip the global `scroll-behavior: smooth` during route changes.
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={GOOGLE_FONTS_URL} />
      </head>
      <body>{children}</body>
    </html>
  );
}
