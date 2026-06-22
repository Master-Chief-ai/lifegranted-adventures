'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import type { TourImage } from '@/types'

export function TourGallery({ images, fallback }: { images: TourImage[]; fallback: string }) {
  const gallery = images.length > 0 ? images : [{ url: fallback, alt: 'Tour photo' }]
  const [lightbox, setLightbox] = useState<number | null>(null)

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl" style={{ height: 420 }}>
        <button onClick={() => setLightbox(0)} className="relative col-span-2 row-span-2">
          <Image src={gallery[0].url} alt={gallery[0].alt} fill className="object-cover" priority />
        </button>
        {gallery.slice(1, 5).map((img, i) => (
          <button key={i} onClick={() => setLightbox(i + 1)} className="relative">
            <Image src={img.url} alt={img.alt} fill className="object-cover" />
          </button>
        ))}
        {Array.from({ length: Math.max(0, 4 - (gallery.length - 1)) }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-teal-light" />
        ))}
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6" onClick={() => setLightbox(null)}>
          <button className="absolute right-6 top-6 text-white" onClick={() => setLightbox(null)}>
            <X size={28} />
          </button>
          <div className="relative h-[80vh] w-full max-w-4xl">
            <Image src={gallery[lightbox].url} alt={gallery[lightbox].alt} fill className="object-contain" />
          </div>
        </div>
      )}
    </>
  )
}

export default TourGallery
