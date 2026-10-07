import Link from 'next/link';
import { ArrowLeft, GraduationCap } from 'lucide-react';

interface SimplePortalHeaderProps {
  title: string;
  /** Tailwind max-width class of the inner container. */
  maxWidthClassName: string;
  backLinkClassName: string;
  backHref?: string;
}

/** Header used by the Results and Performance pages (student and parent portals). */
export function SimplePortalHeader({ title, maxWidthClassName, backLinkClassName, backHref = '/student/dashboard' }: SimplePortalHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 sticky top-0 z-10">
      <div className={`${maxWidthClassName} mx-auto flex items-center gap-4`}>
        <div className="w-9 h-9 rounded-xl bg-[#B22234] flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <h1 className="font-heading font-700 text-gray-900 text-lg flex-1">{title}</h1>
        <Link href={backHref} className={backLinkClassName}>
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
      </div>
    </header>
  );
}
