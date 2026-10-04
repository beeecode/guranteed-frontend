import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteNavbar } from '@/components/layout/SiteNavbar';

/** Public website frame: fixed navbar + footer around every marketing page. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-[#1C0A04]">
      <SiteNavbar />
      {children}
      <SiteFooter />
    </div>
  );
}
