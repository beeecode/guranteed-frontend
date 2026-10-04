interface GoldWaveProps {
  width?: number;
  /** The home page uses a taller, thicker stroke. */
  bold?: boolean;
}

/** Hand-drawn gold underline used under headings. */
export function GoldWave({ width, bold = false }: GoldWaveProps) {
  const w = width ?? (bold ? 180 : 160);

  if (bold) {
    return (
      <svg width={w} height="14" viewBox={`0 0 ${w} 14`} fill="none" className="mt-1">
        <path
          d={`M2 9 C${w*0.12} 4 ${w*0.25} 12 ${w*0.38} 7 C${w*0.5} 2 ${w*0.63} 12 ${w*0.76} 7 C${w*0.88} 2 ${w*0.95} 9 ${w-2} 7`}
          stroke="#E8B830" strokeWidth="3" strokeLinecap="round" fill="none"
        />
      </svg>
    );
  }

  return (
    <svg width={w} height="12" viewBox={`0 0 ${w} 12`} fill="none" className="mt-1">
      <path d={`M2 7 C${w*0.12} 3 ${w*0.25} 10 ${w*0.38} 6 C${w*0.5} 2 ${w*0.63} 10 ${w*0.76} 6 C${w*0.88} 2 ${w*0.95} 7 ${w-2} 6`} stroke="#E8B830" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
