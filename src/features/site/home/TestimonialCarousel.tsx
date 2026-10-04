'use client';

import { useEffect, useState } from 'react';
import { testimonials } from './content';

const ROTATE_MS = 5500;

/** Parent quote card that auto-rotates, with dot controls. */
export function TestimonialCarousel() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % testimonials.length), ROTATE_MS);
    return () => clearInterval(t);
  }, []);

  const current = testimonials[testimonialIdx];

  return (
    <div className="relative bg-white p-10 shadow-lg" style={{ borderRadius: 20, borderLeft: '5px solid #E8B830' }}>
      {/* Tape */}
      <div className="absolute -top-4 left-10 w-28 h-5 bg-white/90 shadow-sm rounded-sm -rotate-1" />
      <blockquote className="font-display font-medium text-[#1C0A04] text-xl leading-relaxed mb-6">
        "{current.text}"
      </blockquote>
      <div className="font-playful font-bold text-[#B22234]">{current.name}</div>
      <div className="text-[#B8967A] text-xs mt-0.5">{current.role}</div>
      <div className="flex gap-2 mt-5">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setTestimonialIdx(i)}
            className="transition-all duration-200"
            style={{ width: i === testimonialIdx ? 24 : 8, height: 8, borderRadius: 999, background: i === testimonialIdx ? '#B22234' : '#D9C6B2' }}
          />
        ))}
      </div>
    </div>
  );
}
