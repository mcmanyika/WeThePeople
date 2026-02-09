'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/app/components/Header'
import { getGalleryCategories, getGalleryImages } from '@/lib/firebase/firestore'
import type { GalleryCategory, GalleryImage } from '@/types'

const ITEMS_PER_PAGE = 12

export default function GalleryPage() {
  const [categories, setCategories] = useState<GalleryCategory[]>([])
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [cats, imgs] = await Promise.all([
          getGalleryCategories(true),
          getGalleryImages(true),
        ])
        setCategories(cats)
        setImages(imgs)
      } catch (err) {
        console.error('Error fetching gallery data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  const filteredImages = selectedCategory === 'all'
    ? images
    : images.filter(img => img.categoryId === selectedCategory)

  const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE)
  const paginatedImages = filteredImages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePrevLightbox = useCallback(() => {
    if (!lightboxImage) return
    const idx = filteredImages.findIndex(i => i.id === lightboxImage.id)
    if (idx > 0) setLightboxImage(filteredImages[idx - 1])
  }, [lightboxImage, filteredImages])

  const handleNextLightbox = useCallback(() => {
    if (!lightboxImage) return
    const idx = filteredImages.findIndex(i => i.id === lightboxImage.id)
    if (idx < filteredImages.length - 1) setLightboxImage(filteredImages[idx + 1])
  }, [lightboxImage, filteredImages])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxImage) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxImage(null)
      if (e.key === 'ArrowLeft') handlePrevLightbox()
      if (e.key === 'ArrowRight') handleNextLightbox()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxImage, handlePrevLightbox, handleNextLightbox])

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 pt-24 pb-8 text-white sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Our Gallery</p>
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">Photo Gallery</h1>
          <p className="mt-3 text-sm text-slate-300 max-w-2xl mx-auto sm:text-base">
            Browse photos from our events, campaigns, and community activities.
          </p>
        </div>
      </section>

      {/* Category Filters */}
      <section className="border-b bg-white sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
                <p className="text-slate-600">Loading gallery...</p>
              </div>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="py-20 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-4 text-slate-600">No images found in this category.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 sm:gap-4">
                {paginatedImages.map((image) => (
                  <div
                    key={image.id}
                    onClick={() => setLightboxImage(image)}
                    className="group cursor-pointer overflow-hidden rounded-lg bg-slate-100 aspect-square relative"
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.title || 'Gallery image'}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/placeholder.png'
                      }}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-start p-3">
                      {(image.title || image.categoryName) && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          {image.title && (
                            <p className="text-sm font-semibold text-white drop-shadow-lg">{image.title}</p>
                          )}
                          <p className="text-xs text-white/80 drop-shadow-lg">{image.categoryName}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}

              <p className="mt-4 text-center text-xs text-slate-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredImages.length)} of {filteredImages.length} images
              </p>
            </>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxImage(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous button */}
          {filteredImages.findIndex(i => i.id === lightboxImage.id) > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); handlePrevLightbox() }}
              className="absolute left-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {filteredImages.findIndex(i => i.id === lightboxImage.id) < filteredImages.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleNextLightbox() }}
              className="absolute right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.imageUrl}
              alt={lightboxImage.title || 'Gallery image'}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            />
            {/* Caption */}
            {(lightboxImage.title || lightboxImage.description) && (
              <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent p-4 pt-8">
                {lightboxImage.title && (
                  <h3 className="text-lg font-semibold text-white">{lightboxImage.title}</h3>
                )}
                {lightboxImage.description && (
                  <p className="mt-1 text-sm text-white/80">{lightboxImage.description}</p>
                )}
                <p className="mt-1 text-xs text-white/60">{lightboxImage.categoryName}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

