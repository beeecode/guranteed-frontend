import Link from 'next/link';
import { DoodleStar } from '@/components/ui/DoodleStar';

/* ── Inline SVG doodles & playful building blocks used across the home page ── */

export function DoodlePaperPlane({ size = 32, style, className = '' }: { size?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style} className={className}>
      <path d="M2 16L30 4L23 16L30 28L2 16Z" stroke="#B22234" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(178,34,52,0.1)" />
      <path d="M2 16L16 19" stroke="#B22234" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function DoodlePencil({ size = 28, style, className = '' }: { size?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 18 28" style={style} className={className}>
      <rect x="4" y="2" width="10" height="18" rx="2" fill="#E8B830" />
      <rect x="4" y="2" width="10" height="5" rx="2" fill="#D9C6B2" />
      <rect x="4" y="16" width="10" height="4" fill="#F5DEB3" />
      <polygon points="4,20 14,20 9,28" fill="#A0522D" />
      <line x1="9" y1="24" x2="9" y2="28" stroke="#1C0A04" strokeWidth="1" />
    </svg>
  );
}

export function DoodleRuler({ size = 60, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size * 0.35} viewBox="0 0 60 21" style={style}>
      <rect x="0" y="4" width="60" height="13" rx="2" fill="#D9C6B2" opacity="0.7" />
      {[6, 12, 18, 24, 30, 36, 42, 48, 54].map((x, i) => (
        <line key={i} x1={x} y1="4" x2={x} y2={i % 2 === 0 ? 10 : 8} stroke="#7A5C3A" strokeWidth="1" opacity="0.7" />
      ))}
    </svg>
  );
}

export function DoodleBooks({ size = 30, style, className = '' }: { size?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 30 27" style={style} className={className}>
      <rect x="0" y="5" width="8" height="22" rx="1" fill="#B22234" />
      <rect x="1" y="5" width="2" height="22" rx="1" fill="rgba(255,255,255,0.3)" />
      <rect x="9" y="2" width="9" height="25" rx="1" fill="#8B0000" />
      <rect x="10" y="2" width="2.5" height="25" rx="1" fill="rgba(255,255,255,0.25)" />
      <rect x="19" y="6" width="7" height="21" rx="1" fill="#A0522D" />
      <rect x="20" y="6" width="2" height="21" rx="1" fill="rgba(255,255,255,0.25)" />
    </svg>
  );
}

export function PlayfulBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-4 py-2 mb-5" style={{ background: '#B22234', borderRadius: 999, transform: 'rotate(-1.5deg)', boxShadow: '0 3px 10px rgba(178,34,52,0.3)' }}>
      <DoodleStar size={12} color="#FFD700" />
      <span className="text-white text-xs font-bold uppercase tracking-widest font-playful">{children}</span>
      <DoodleStar size={12} color="#FFD700" />
    </div>
  );
}

export function RoundBtn({ href, children, primary = true }: { href: string; children: React.ReactNode; primary?: boolean }) {
  const base = "inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl active:scale-95 font-playful";
  if (primary) {
    return (
      <Link href={href} className={base} style={{ background: '#B22234', color: '#fff', borderRadius: 999, boxShadow: '0 4px 16px rgba(178,34,52,0.3)', fontSize: '0.95rem' }}>
        {children}
      </Link>
    );
  }
  return (
    <Link href={href} className={base} style={{ background: '#fff', color: '#8B0000', borderRadius: 999, border: '2.5px solid #B22234', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '0.95rem' }}>
      {children}
    </Link>
  );
}

export function FloatingCard({ emoji, text, style, rotate = 0, className = '' }: { emoji: string; text: string; style?: React.CSSProperties; rotate?: number; className?: string }) {
  return (
    <div
      className={`flex items-center gap-2 bg-white px-3 py-2 shadow-lg ${className}`}
      style={{ borderRadius: 14, transform: `rotate(${rotate}deg)`, border: '1.5px solid rgba(217,198,178,0.4)', ...style }}
    >
      <span className="text-lg leading-none">{emoji}</span>
      <span className="text-xs font-bold whitespace-nowrap font-playful" style={{ color: '#1C0A04' }}>{text}</span>
    </div>
  );
}

export function StatBadge({ value, label, emoji }: { value: string; label: string; emoji: string }) {
  return (
    <div className="flex flex-col items-center group">
      <div
        className="w-28 h-28 flex flex-col items-center justify-center shadow-md mb-3 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl"
        style={{ background: '#fff', borderRadius: '50%', border: '3px solid rgba(217,198,178,0.6)' }}
      >
        <span className="text-2xl mb-0.5 leading-none">{emoji}</span>
        <span className="font-playful font-bold text-2xl leading-none" style={{ color: '#8B0000' }}>{value}</span>
      </div>
      <span className="text-xs font-semibold text-center uppercase tracking-wide max-w-[90px]" style={{ color: '#7A5C3A' }}>{label}</span>
    </div>
  );
}

export function ActivityCard({ emoji, title, desc, rotate = 0 }: { emoji: string; title: string; desc: string; rotate?: number }) {
  return (
    <div
      className="bg-white p-6 cursor-default transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
      style={{ borderRadius: 20, transform: `rotate(${rotate}deg)`, border: '2px solid rgba(217,198,178,0.4)', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}
    >
      <div className="text-3xl mb-3 group-hover:animate-wiggle inline-block">{emoji}</div>
      <h3 className="font-playful font-bold text-[#1C0A04] mb-2" style={{ fontSize: '1rem' }}>{title}</h3>
      <p className="text-[#7A5C3A] text-xs leading-relaxed">{desc}</p>
    </div>
  );
}
