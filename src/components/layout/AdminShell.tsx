'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap, LayoutDashboard, Users, HelpCircle,
  FileText, BarChart2, Bell, Settings, LogOut, Menu,
  ClipboardList, Megaphone,
} from 'lucide-react';
import { adminProfile } from '@/data/admin';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'students', label: 'Students', icon: Users, path: '/admin/students' },
  { id: 'questions', label: 'Question Bank', icon: HelpCircle, path: '/admin/questions' },
  { id: 'exams', label: 'Examinations', icon: ClipboardList, path: '/admin/exams' },
  { id: 'results', label: 'Results', icon: FileText, path: '/admin/results' },
  { id: 'reports', label: 'Reports', icon: BarChart2, path: '/admin/results' },
  { id: 'announcements', label: 'Announcements', icon: Megaphone, path: '/admin/dashboard' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/dashboard' },
];

interface AdminShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

/** Sidebar + top bar frame shared by every admin page. Children may be server components. */
export function AdminShell({ children, title, subtitle }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-[#F9F5F1] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#8B0000] transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-heading font-600 text-white text-sm">Guaranteed Future Model Schools</div>
            <div className="text-xs text-white/50">Admin Dashboard</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive(item.path)
                  ? 'bg-white text-[#8B0000] shadow-md'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Admin info + Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-heading font-700 text-white text-xs">{adminProfile.initials}</div>
            <div>
              <div className="text-white text-sm font-medium">{adminProfile.name}</div>
              <div className="text-white/50 text-xs">{adminProfile.role}</div>
            </div>
          </div>
          <Link href="/cbt" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 text-sm transition-all">
            <LogOut className="w-4 h-4" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-heading font-700 text-gray-900 text-lg leading-none">{title}</h1>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B22234]" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-[#8B0000] flex items-center justify-center font-heading font-600 text-white text-xs">{adminProfile.initials}</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
