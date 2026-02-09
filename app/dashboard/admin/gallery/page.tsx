'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import AdminRoute from '@/app/components/AdminRoute'
import DashboardNav from '@/app/components/DashboardNav'
import Link from 'next/link'
import {
  getGalleryCategories,
  createGalleryCategory,
  updateGalleryCategory,
  deleteGalleryCategory,
  getGalleryImages,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} from '@/lib/firebase/firestore'
import { uploadFile } from '@/lib/firebase/storage'
import type { GalleryCategory, GalleryImage } from '@/types'

export default function AdminGalleryPage() {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <div className="min-h-screen bg-slate-50">
          <div className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Gallery Management</h1>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  &larr; Back to Dashboard
                </Link>
              </div>
            </div>
          </div>

          <DashboardNav />

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-10">
            <CategoryManagement />
            <ImageManagement />
          </div>
        </div>
      </AdminRoute>
    </ProtectedRoute>
  )
}

// ─── CATEGORY MANAGEMENT ────────────────────────────────────────────────────

function CategoryManagement() {
  const [categories, setCategories] = useState<GalleryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<GalleryCategory | null>(null)
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', isActive: true, order: 0 })
  const [saving, setSaving] = useState(false)
  const [deleteModal, setDeleteModal] = useState<GalleryCategory | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { loadCategories() }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const cats = await getGalleryCategories(false)
      setCategories(cats)
      setError('')
    } catch (err: any) {
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', isActive: true, order: categories.length })
    setEditing(null)
  }

  const openCreate = () => {
    resetForm()
    setFormData(prev => ({ ...prev, order: categories.length }))
    setShowModal(true)
  }

  const openEdit = (cat: GalleryCategory) => {
    setEditing(cat)
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      isActive: cat.isActive,
      order: cat.order,
    })
    setShowModal(true)
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')

    try {
      const slug = formData.slug || generateSlug(formData.name)
      if (editing) {
        await updateGalleryCategory(editing.id, { ...formData, slug })
      } else {
        await createGalleryCategory({ ...formData, slug })
      }
      await loadCategories()
      setShowModal(false)
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    setDeleting(true)
    try {
      await deleteGalleryCategory(deleteModal.id)
      await loadCategories()
      setDeleteModal(null)
    } catch (err: any) {
      setError('Failed to delete category')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggle = async (cat: GalleryCategory) => {
    try {
      await updateGalleryCategory(cat.id, { isActive: !cat.isActive })
      await loadCategories()
    } catch { setError('Failed to update') }
  }

  const handleMoveUp = async (cat: GalleryCategory) => {
    const idx = categories.findIndex(c => c.id === cat.id)
    if (idx <= 0) return
    try {
      const prev = categories[idx - 1]
      await updateGalleryCategory(cat.id, { order: prev.order })
      await updateGalleryCategory(prev.id, { order: cat.order })
      await loadCategories()
    } catch {}
  }

  const handleMoveDown = async (cat: GalleryCategory) => {
    const idx = categories.findIndex(c => c.id === cat.id)
    if (idx >= categories.length - 1) return
    try {
      const next = categories[idx + 1]
      await updateGalleryCategory(cat.id, { order: next.order })
      await updateGalleryCategory(next.id, { order: cat.order })
      await loadCategories()
    } catch {}
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Categories</h2>
          <p className="text-sm text-slate-600">
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} &bull; {categories.filter(c => c.isActive).length} active
          </p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
          + Add Category
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-900 border-r-transparent"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600 mb-3">No categories yet.</p>
          <button onClick={openCreate} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">+ Add Category</button>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat, idx) => (
            <div key={cat.id} className={`flex items-center gap-4 rounded-lg border bg-white p-3 ${!cat.isActive ? 'opacity-60' : ''}`}>
              {/* Reorder */}
              <div className="flex flex-col items-center gap-0.5">
                <button onClick={() => handleMoveUp(cat)} disabled={idx === 0} className="rounded p-0.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-colors">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>
                <span className="text-xs font-bold text-slate-500">{idx + 1}</span>
                <button onClick={() => handleMoveDown(cat)} disabled={idx === categories.length - 1} className="rounded p-0.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-colors">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{cat.name}</h3>
                {cat.description && <p className="text-xs text-slate-500 truncate">{cat.description}</p>}
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggle(cat)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${cat.isActive ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                  {cat.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => openEdit(cat)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors">Edit</button>
                <button onClick={() => setDeleteModal(cat)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => { setShowModal(false); resetForm() }} />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[450px] bg-white shadow-2xl overflow-y-auto animate-[slide-in-right_0.3s_ease-out]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{editing ? 'Edit Category' : 'Add Category'}</h2>
                <button onClick={() => { setShowModal(false); resetForm() }} className="rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setFormData(prev => ({
                        ...prev,
                        name,
                        slug: editing ? prev.slug : generateSlug(name),
                      }))
                    }}
                    placeholder="e.g. Events, Campaigns"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="auto-generated-from-name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} className="sr-only peer" />
                    <div className="w-10 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                  <span className="text-sm font-medium text-slate-700">{formData.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors">
                    {saving ? (editing ? 'Updating...' : 'Creating...') : (editing ? 'Update Category' : 'Add Category')}
                  </button>
                  <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Category</h3>
            <p className="text-sm text-slate-600 mb-1">Are you sure you want to delete &ldquo;{deleteModal.name}&rdquo;?</p>
            <p className="text-xs text-red-600 mb-4">Images in this category will not be deleted but will become uncategorized.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting} className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button onClick={() => setDeleteModal(null)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── IMAGE MANAGEMENT ───────────────────────────────────────────────────────

function ImageManagement() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [categories, setCategories] = useState<GalleryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<GalleryImage | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '', categoryId: '', isPublished: true, order: 0 })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deleteModal, setDeleteModal] = useState<GalleryImage | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [imgs, cats] = await Promise.all([
        getGalleryImages(false),
        getGalleryCategories(false),
      ])
      setImages(imgs)
      setCategories(cats)
      setError('')
    } catch (err: any) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ title: '', description: '', categoryId: categories[0]?.id || '', isPublished: true, order: images.length })
    setImageFile(null)
    setImagePreview(null)
    setImageUrl('')
    setEditing(null)
  }

  const openCreate = () => {
    resetForm()
    setFormData(prev => ({ ...prev, order: images.length, categoryId: categories[0]?.id || '' }))
    setShowModal(true)
  }

  const openEdit = (img: GalleryImage) => {
    setEditing(img)
    setFormData({
      title: img.title || '',
      description: img.description || '',
      categoryId: img.categoryId,
      isPublished: img.isPublished,
      order: img.order,
    })
    setImageUrl(img.imageUrl)
    setImagePreview(img.imageUrl)
    setShowModal(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.categoryId) { setError('Please select a category'); return }
    setUploading(true)
    setError('')

    try {
      let finalImageUrl = imageUrl

      if (imageFile) {
        const timestamp = Date.now()
        const path = `gallery/${timestamp}-${imageFile.name}`
        finalImageUrl = await uploadFile(imageFile, path)
      }

      if (!finalImageUrl) {
        setError('Please upload an image or provide an image URL')
        setUploading(false)
        return
      }

      const categoryName = categories.find(c => c.id === formData.categoryId)?.name || ''

      if (editing) {
        await updateGalleryImage(editing.id, {
          imageUrl: finalImageUrl,
          title: formData.title,
          description: formData.description,
          categoryId: formData.categoryId,
          categoryName,
          isPublished: formData.isPublished,
          order: formData.order,
        })
      } else {
        await createGalleryImage({
          imageUrl: finalImageUrl,
          title: formData.title,
          description: formData.description,
          categoryId: formData.categoryId,
          categoryName,
          isPublished: formData.isPublished,
          order: formData.order,
        })
      }

      await loadData()
      setShowModal(false)
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Failed to save image')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    setDeleting(true)
    try {
      await deleteGalleryImage(deleteModal.id)
      await loadData()
      setDeleteModal(null)
    } catch (err: any) {
      setError('Failed to delete image')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggle = async (img: GalleryImage) => {
    try {
      await updateGalleryImage(img.id, { isPublished: !img.isPublished })
      await loadData()
    } catch { setError('Failed to update') }
  }

  const filteredImages = filterCategory === 'all'
    ? images
    : images.filter(i => i.categoryId === filterCategory)

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Images</h2>
          <p className="text-sm text-slate-600">
            {images.length} image{images.length !== 1 ? 's' : ''} &bull; {images.filter(i => i.isPublished).length} published
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button onClick={openCreate} disabled={categories.length === 0} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            + Add Image
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">{error}</div>}

      {categories.length === 0 && !loading && (
        <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-yellow-700 text-sm">
          Create at least one category before adding images.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-900 border-r-transparent"></div>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600 mb-3">No images{filterCategory !== 'all' ? ' in this category' : ''} yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {filteredImages.map((img) => (
            <div key={img.id} className={`group rounded-lg border bg-white overflow-hidden ${!img.isPublished ? 'opacity-60' : ''}`}>
              <div className="aspect-square relative bg-slate-100">
                <img
                  src={img.imageUrl}
                  alt={img.title || 'Gallery image'}
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png' }}
                />
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button onClick={() => openEdit(img)} className="rounded-full bg-white p-2 text-slate-900 hover:bg-slate-100 shadow-lg transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => setDeleteModal(img)} className="rounded-full bg-white p-2 text-red-600 hover:bg-red-50 shadow-lg transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs font-semibold text-slate-900 truncate">{img.title || 'Untitled'}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">{img.categoryName}</span>
                  <button onClick={() => handleToggle(img)} className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${img.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {img.isPublished ? 'Published' : 'Draft'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => { setShowModal(false); resetForm() }} />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[50%] bg-white shadow-2xl overflow-y-auto animate-[slide-in-right_0.3s_ease-out]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{editing ? 'Edit Image' : 'Add Image'}</h2>
                <button onClick={() => { setShowModal(false); resetForm() }} className="rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Or Image URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => { setImageUrl(e.target.value); if (e.target.value) setImagePreview(e.target.value) }}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                {imagePreview && (
                  <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png' }} />
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Image title"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="">Select category...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Published Toggle */}
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.isPublished} onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))} className="sr-only peer" />
                    <div className="w-10 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                  <span className="text-sm font-medium text-slate-700">{formData.isPublished ? 'Published' : 'Draft'}</span>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={uploading} className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors">
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                        {editing ? 'Updating...' : 'Uploading...'}
                      </span>
                    ) : (editing ? 'Update Image' : 'Add Image')}
                  </button>
                  <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Image</h3>
            <p className="text-sm text-slate-600 mb-1">Are you sure you want to delete this image?</p>
            {deleteModal.title && <p className="text-sm font-semibold text-slate-900 mb-2">{deleteModal.title}</p>}
            {deleteModal.imageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden border border-slate-200">
                <img src={deleteModal.imageUrl} alt="Image to delete" className="w-full h-32 object-cover" />
              </div>
            )}
            <p className="text-xs text-red-600 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting} className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button onClick={() => setDeleteModal(null)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

