import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

interface StudentPageHeaderProps {
  title: string;
  subtitle: string;
  /** Pages style their "← Dashboard" link slightly differently; kept per page for visual parity. */
  backLinkClassName?: string;
  /** Dashboard the back link returns to (student or parent portal). */
  backHref?: string;
}

/** White sticky header with crest, title and a link back to the portal dashboard. */
export function StudentPageHeader({
  title,
  subtitle,
  backHref = '/student/dashboard',
  backLinkClassName = 'text-sm text-[#7A5C3A] hover:text-[#8B0000] transition-colors font-medium',
}: StudentPageHeaderProps) {
  return (
    <header className="bg-white sticky top-0 z-10 px-4 sm:px-6 py-4" style={{ borderBottom: '1px solid rgba(217,198,178,0.3)' }}>
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="w-9 h-9 object-contain" alt="GFMS" />
          <div>
            <div className="font-playful font-bold text-[#8B0000] text-sm">{title}</div>
            <div className="text-[#B8967A] text-xs">{subtitle}</div>
          </div>
        </div>
        <Link href={backHref} className={backLinkClassName}>
          ← Dashboard
        </Link>
      </div>
    </header>
  );
}
