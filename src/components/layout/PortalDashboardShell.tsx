'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, LogOut, Menu } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export interface PortalNavItem {
  id: string;
  label: string;
  emoji: string;
  path: string;
}

export interface PortalUser {
  name: string;
  avatar: string;
  /** Shown under the name in the sidebar card (e.g. class). */
  detail: string;
}

interface PortalDashboardShellProps {
  portalName: string;
  title: string;
  session: string;
  user: PortalUser;
  navItems: PortalNavItem[];
  children: React.ReactNode;
}

/** Sidebar + sticky header used by the student and parent dashboards. */
export function PortalDashboardShell({ portalName, title, session, user, navItems, children }: PortalDashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState(navItems[0]?.id);

  return (
    <div className="min-h-screen flex" style={{ background: '#F9F5F1' }}>
      {/* ── Sidebar ─────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:shadow-none border-r border-[rgba(217,198,178,0.3)] flex flex-col`}>
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid rgba(217,198,178,0.3)' }}>
          <Logo className="w-10 h-10 object-contain flex-shrink-0" alt="GFMS" />
          <div>
            <div className="font-playful font-bold text-[#8B0000] text-sm leading-tight">GFMS</div>
            <div className="text-[#B8967A] text-xs">{portalName}</div>
          </div>
        </div>
        <div className="px-4 py-4 mx-3 my-3" style={{ background: 'rgba(178,34,52,0.06)', borderRadius: 16 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center font-playful font-bold text-white text-sm flex-shrink-0" style={{ background: '#B22234', borderRadius: 12 }}>
              {user.avatar}
            </div>
            <div>
              <div className="font-playful font-bold text-[#1C0A04] text-sm truncate">{user.name}</div>
              <div className="text-[#B8967A] text-xs">{user.detail}</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.id} href={item.path} onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold font-playful transition-all duration-200"
              style={{ borderRadius: 14, background: activeNav === item.id ? '#B22234' : 'transparent', color: activeNav === item.id ? '#fff' : '#7A5C3A', boxShadow: activeNav === item.id ? '0 4px 12px rgba(178,34,52,0.25)' : 'none' }}>
              <span className="text-base">{item.emoji}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4" style={{ borderTop: '1px solid rgba(217,198,178,0.3)' }}>
          <Link href="/cbt" className="flex items-center gap-3 px-4 py-3 text-sm text-[#B8967A] hover:text-red-600 transition-all font-medium font-playful" style={{ borderRadius: 12 }}>
            <LogOut className="w-4 h-4" />Logout
          </Link>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white sticky top-0 z-20 px-4 sm:px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(217,198,178,0.3)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-[#7A5C3A]" style={{ borderRadius: 10 }}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-playful font-bold text-[#1C0A04] text-lg">{title}</h1>
              <p className="text-[#B8967A] text-xs">Session: {session}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-[#7A5C3A]" style={{ borderRadius: 10 }}>
              <Bell className="w-5 h-5" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B22234]" />
            </button>
            <div className="w-9 h-9 flex items-center justify-center font-playful font-bold text-white text-sm" style={{ background: '#B22234', borderRadius: 12 }}>
              {user.avatar}
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
