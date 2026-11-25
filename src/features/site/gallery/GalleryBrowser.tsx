"use client"

/** Category filter, polaroid masonry grid and click-to-zoom lightbox. */ /* Gallery */ /* Filters */ /* Masonry grid — polaroid style */ /* Tape */ /* Lightbox */

import { useState } from "react"
import { X, ZoomIn } from "lucide-react"
import { ALL_SCHOOL_PHOTOS } from "@/features/site/schoolPhotos"

/** The school's own photos (features/site/schoolPhotos.ts); categories follow the photos. */
const images = ALL_SCHOOL_PHOTOS.map((photo, index) => ({
  id: index + 1,
  src: photo.src,
  alt: photo.alt,
  cat: photo.category,
  title: photo.title,
  size: photo.orientation === "portrait" ? "large" : "normal",
}))
const categories = ["All", ...Array.from(new Set(images.map((img) => img.cat)))]

export function GalleryBrowser() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [lightbox, setLightbox] = useState<number | null>(null)

  const filtered =
    activeCategory === "All"
      ? images
      : images.filter((img) => img.cat === activeCategory)
  const current =
    lightbox !== null ? images.find((i) => i.id === lightbox) : null

  return (
    <>
      {}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {}
          <div className="flex flex-wrap gap-3 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-5 py-2.5 text-sm font-medium transition-all"
                style={{
                  background:
                    activeCategory === cat ? "#5C1010" : "transparent",
                  color: activeCategory === cat ? "#fff" : "#7A5C3A",
                  border: `1.5px solid ${
                    activeCategory === cat ? "#5C1010" : "rgba(28,10,4,0.18)"
                  }`,
                  borderRadius: 4,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {}
          <div className="columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
            {filtered.map((img, idx) => (
              <div
                key={img.id}
                className="relative group cursor-pointer bg-white p-2 pb-8 shadow-md break-inside-avoid transition-transform duration-300 hover:-rotate-1"
                style={{
                  transform: `rotate(${
                    idx % 3 === 0 ? -1.5 : idx % 3 === 1 ? 0.8 : -0.5
                  }deg)`,
                }}
                onClick={() => setLightbox(img.id)}
              >
                {}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4"
                  style={{
                    background: "rgba(255,255,255,0.88)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                    borderRadius: 2,
                  }}
                />
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-[#5C1010]/0 group-hover:bg-[#5C1010]/40 transition-all duration-300 flex items-center justify-center"
                  style={{ top: 8, left: 8, right: 8, bottom: 32 }}
                >
                  <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-medium text-[#7A5C3A]">
                  {img.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      {lightbox !== null && current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(28,10,4,0.88)" }}
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div
              className="bg-white p-3 pb-10 shadow-2xl"
              style={{ transform: "rotate(-0.5deg)" }}
            >
              <div
                className="absolute -top-3 left-16 w-24 h-5"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                  borderRadius: 2,
                }}
              />
              <img
                src={current.src}
                alt={current.alt}
                className="w-full object-cover"
                style={{ maxHeight: "75vh" }}
              />
              <div className="flex items-center justify-between mt-3 px-1">
                <span className="font-display font-bold text-[#1C0A04] text-lg">
                  {current.title}
                </span>
                <span className="text-[#7A5C3A] text-xs font-medium uppercase tracking-widest">
                  {current.cat}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
