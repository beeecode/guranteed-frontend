import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { portalLinks, siteNavLinks } from './siteNavLinks';

const contactLines = [
  { icon: Phone, text: '+234 801 234 5678' },
  { icon: Mail, text: 'info@gfms.edu.ng' },
  { icon: MapPin, text: '14 Learning Lane, Lagos State' },
];

export function SiteFooter() {
  return (
    <footer style={{ background: 'rgba(255,253,235,0.97)', borderTop: '1px solid rgba(217,198,178,0.35)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 lg:py-20">
        {/* Top */}
        <div className="grid lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <Logo className="w-14 h-14 object-contain flex-shrink-0" />
              <div>
                <div className="font-display font-bold text-[#5C1010] text-lg leading-tight">Guaranteed Future</div>
                <div className="font-display font-bold text-[#5C1010] text-lg leading-tight">Model Schools</div>
                <div className="text-[#B8967A] text-[10px] tracking-widest uppercase mt-1 font-medium">GFMS... Ever To Lead</div>
              </div>
            </div>
            <p className="text-[#7A5C3A] text-sm leading-relaxed max-w-sm mb-6">
              A nurturing environment where young minds learn, explore, create and grow into tomorrow's confident leaders.
            </p>
          </div>

          {/* Site Links */}
          <div>
            <div className="section-number mb-5">Navigation</div>
            <div className="space-y-3">
              {siteNavLinks.map((link) => (
                <Link key={link.path + link.label} href={link.path} className="block text-sm font-medium transition-colors hover:text-[#5C1010]" style={{ color: '#7A5C3A' }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Portals + Contact */}
          <div>
            <div className="section-number mb-5">Portals</div>
            <div className="space-y-3 mb-8">
              {portalLinks.map((link) => (
                <Link key={link.path} href={link.path} className="block text-sm font-medium transition-colors hover:text-[#5C1010]" style={{ color: '#7A5C3A' }}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="section-number mb-4">Contact</div>
            <div className="space-y-2.5">
              {contactLines.map(({ icon: Icon, text }) => (
                <div key={text} className="flex gap-2 items-start text-xs" style={{ color: '#7A5C3A' }}>
                  <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#B22234]" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4" style={{ borderTop: '1px solid rgba(28,10,4,0.08)' }}>
          <p className="text-xs font-medium" style={{ color: '#B8967A' }}>
            © 2026 Guaranteed Future Model Schools. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs font-medium transition-colors hover:text-[#5C1010]" style={{ color: '#B8967A' }}>Privacy Policy</a>
            <a href="#" className="text-xs font-medium transition-colors hover:text-[#5C1010]" style={{ color: '#B8967A' }}>Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
