interface DoodleStarProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function DoodleStar({ size = 22, color = '#E8B830', className, style }: DoodleStarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill={color} className={className} style={style}>
      <path d="M11 1.5l2.3 6.4h6.8l-5.5 4 2.1 6.5L11 14.5l-5.7 3.9 2.1-6.5-5.5-4h6.8z" />
    </svg>
  );
}
