'use client';

import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

const categories = ['All', 'Academics', 'Sports', 'Events', 'Arts', 'Excursions'];

const images = [
  { id: 1, src: 'photo-1509062522246-3755977927d7', cat: 'Academics', title: 'Classroom Learning', size: 'large' },
  { id: 2, src: 'photo-1574623452334-1e0ac2b3ccb4', cat: 'Academics', title: 'Science Laboratory', size: 'normal' },
  { id: 3, src: 'photo-1558618666-fcd25c85cd64', cat: 'Sports', title: 'Sports Day Champions', size: 'normal' },
  { id: 4, src: 'photo-1484820540004-14229fe36ca4', cat: 'Arts', title: 'Art Class Creations', size: 'large' },
  { id: 5, src: 'photo-1605371924599-2d0365da1ae0', cat: 'Academics', title: 'Computer Lesson', size: 'normal' },
  { id: 6, src: 'photo-1560439514-4e9645039924', cat: 'Events', title: 'Cultural Day Celebration', size: 'normal' },
  { id: 7, src: 'photo-1577896851231-70ef18881754', cat: 'Academics', title: 'Teacher Interaction', size: 'normal' },
  { id: 8, src: 'photo-1545987796-200677ee1011', cat: 'Arts', title: 'Music Performance', size: 'large' },
  { id: 9, src: 'photo-1580582932707-520aed937b7b', cat: 'Events', title: 'Graduation Ceremony', size: 'normal' },
  { id: 10, src: 'photo-1524178232363-1fb2b075b655', cat: 'Academics', title: 'Reading Programme', size: 'normal' },
  { id: 11, src: 'photo-1571260899304-425eee4c7efc', cat: 'Academics', title: 'CBT Examination', size: 'normal' },
  { id: 12, src: 'photo-1503676260728-1c00da094a0b', cat: 'Academics', title: 'Group Study', size: 'normal' },
];

/** Category filter, polaroid masonry grid and click-to-zoom lightbox. */
export function GalleryBrowser() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = activeCategory === 'All' ? images : images.filter(img => img.cat === activeCategory);
  const current = lightbox !== null ? images.find(i => i.id === lightbox) : null;

  return (
    <>
      {/* Gallery */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-5 py-2.5 text-sm font-medium transition-all"
                style={{
                  background: activeCategory === cat ? '#5C1010' : 'transparent',
                  color: activeCategory === cat ? '#fff' : '#7A5C3A',
                  border: `1.5px solid ${activeCategory === cat ? '#5C1010' : 'rgba(28,10,4,0.18)'}`,
                  borderRadius: 4,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Masonry grid — polaroid style */}
          <div className="columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
            {filtered.map((img, idx) => (
              <div
                key={img.id}
                className="relative group cursor-pointer bg-white p-2 pb-8 shadow-md break-inside-avoid transition-transform duration-300 hover:-rotate-1"
                style={{ transform: `rotate(${idx % 3 === 0 ? -1.5 : idx % 3 === 1 ? 0.8 : -0.5}deg)` }}
                onClick={() => setLightbox(img.id)}
              >
                {/* Tape */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4" style={{ background: 'rgba(255,255,255,0.88)', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', borderRadius: 2 }} />
                <img
                  src={`https://images.unsplash.com/${img.src}?w=500&h=${img.size === 'large' ? 600 : 400}&fit=crop&auto=format`}
                  alt={img.title}
                  className="w-full object-cover"
                />
                <div className="absolute inset-0 bg-[#5C1010]/0 group-hover:bg-[#5C1010]/40 transition-all duration-300 flex items-center justify-center" style={{ top: 8, left: 8, right: 8, bottom: 32 }}>
                  <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-medium text-[#7A5C3A]">{img.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(28,10,4,0.88)' }} onClick={() => setLightbox(null)}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)} className="absolute -top-10 right-0 text-white/60 hover:text-white p-2 transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="bg-white p-3 pb-10 shadow-2xl" style={{ transform: 'rotate(-0.5deg)' }}>
              <div className="absolute -top-3 left-16 w-24 h-5" style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', borderRadius: 2 }} />
              <img
                src={`https://images.unsplash.com/${current.src}?w=1200&h=700&fit=crop&auto=format`}
                alt={current.title}
                className="w-full object-cover"
                style={{ maxHeight: '75vh' }}
              />
              <div className="flex items-center justify-between mt-3 px-1">
                <span className="font-display font-bold text-[#1C0A04] text-lg">{current.title}</span>
                <span className="text-[#7A5C3A] text-xs font-medium uppercase tracking-widest">{current.cat}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
