import logo from '@/assets/logo.png';

interface LogoProps {
  className: string;
  alt?: string;
}

/** School crest. A plain <img> keeps the exact sizing the Tailwind classes give it. */
export function Logo({ className, alt = 'GFMS Logo' }: LogoProps) {
  return <img src={logo.src} alt={alt} className={className} />;
}
