'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { siteNavLinks } from './siteNavLinks';

function WavyUnderline() {
  return (
    <svg width="52" height="8" viewBox="0 0 52 8" fill="none" className="absolute -bottom-2 left-0">
      <path d="M2 5 C8 2 14 7 20 4 C26 1 32 7 38 4 C44 1 48 5 50 4" stroke="#E8B830" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export function SiteNavbar() {
  const pathname = usePathname();
  // Remember which page the drawer was opened on so it closes on navigation
  // (the navbar now persists across pages instead of remounting).
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(254,252,232,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(28,10,4,0.07)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo className="w-10 h-10 object-contain" />
            <div className="hidden sm:block">
              <div className="font-display font-bold text-[#5C1010] text-sm leading-tight">Guaranteed Future</div>
              <div className="text-[#7A5C3A] text-[10px] tracking-widest uppercase font-medium">Model Schools</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {siteNavLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="relative text-sm font-medium pb-1 transition-colors duration-200"
                style={{ color: isActive(link.path) ? '#1C0A04' : '#7A5C3A' }}
              >
                {link.label}
                {isActive(link.path) && <WavyUnderline />}
              </Link>
            ))}
          </div>

          {/* CBT CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/cbt"
              className="hidden sm:block px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: '#5C1010', borderRadius: '4px' }}
            >
              CBT Portal →
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-1 transition-colors"
              style={{ color: '#5C1010' }}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div style={{ background: '#FEFCE8', borderTop: '1px solid rgba(28,10,4,0.07)' }}>
          <div className="max-w-7xl mx-auto px-5 py-6 space-y-1">
            {siteNavLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setOpen(false)}
                className="block py-3 text-sm font-medium transition-colors"
                style={{
                  color: isActive(link.path) ? '#5C1010' : '#7A5C3A',
                  borderBottom: '1px solid rgba(28,10,4,0.06)'
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/cbt"
              onClick={() => setOpen(false)}
              className="block pt-5 text-sm font-semibold"
              style={{ color: '#5C1010' }}
            >
              CBT Portal →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
