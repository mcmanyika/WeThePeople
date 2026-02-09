'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardNav from '@/app/components/DashboardNav'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import {
  createSurvey,
  getSurveys,
  updateSurvey,
  deleteSurvey,
  getSurveyResponses,
} from '@/lib/firebase/firestore'
import type { Survey, SurveyQuestion, SurveyQuestionType, SurveyCategory, SurveyStatus, SurveyResponse } from '@/types'

const questionTypes: { value: SurveyQuestionType; label: string }[] = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkbox (Multi-Select)' },
  { value: 'rating', label: 'Rating Scale' },
  { value: 'short_text', label: 'Short Text' },
  { value: 'long_text', label: 'Long Text' },
  { value: 'yes_no', label: 'Yes / No' },
]

const categoryOptions: { value: SurveyCategory; label: string }[] = [
  { value: 'governance', label: 'Governance' },
  { value: 'rights', label: 'Rights' },
  { value: 'community', label: 'Community' },
  { value: 'policy', label: 'Policy' },
  { value: 'general', label: 'General' },
]

const statusColors: Record<SurveyStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  closed: 'bg-red-100 text-red-700',
}

export default function AdminSurveysPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const isAdmin = userProfile?.role === 'admin'

  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteModal, setDeleteModal] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // View responses state
  const [viewingResponses, setViewingResponses] = useState<string | null>(null)
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [responsesLoading, setResponsesLoading] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<SurveyCategory>('general')
  const [status, setStatus] = useState<SurveyStatus>('draft')
  const [isPublic, setIsPublic] = useState(false)
  const [allowAnonymous, setAllowAnonymous] = useState(false)
  const [showResults, setShowResults] = useState(true)
  const [responseGoal, setResponseGoal] = useState('')
  const [deadline, setDeadline] = useState('')
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])

  useEffect(() => {
    if (!isAdmin) return
    loadSurveys()
  }, [isAdmin])

  const loadSurveys = async () => {
    try {
      setLoading(true)
      const all = await getSurveys(false)
      setSurveys(all)
    } catch (err) {
      console.error('Error loading surveys:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('general')
    setStatus('draft')
    setIsPublic(false)
    setAllowAnonymous(false)
    setShowResults(true)
    setResponseGoal('')
    setDeadline('')
    setQuestions([])
    setEditingSurvey(null)
  }

  const openCreate = () => {
    resetForm()
    setShowForm(true)
  }

  const openEdit = (survey: Survey) => {
    setEditingSurvey(survey)
    setTitle(survey.title)
    setDescription(survey.description)
    setCategory(survey.category)
    setStatus(survey.status)
    setIsPublic(survey.isPublic)
    setAllowAnonymous(survey.allowAnonymous)
    setShowResults(survey.showResults)
    setResponseGoal(survey.responseGoal?.toString() || '')
    setDeadline(survey.deadline ? new Date(
      survey.deadline instanceof Date ? survey.deadline.getTime() : (survey.deadline as any)?.toMillis?.() || 0
    ).toISOString().split('T')[0] : '')
    setQuestions(survey.questions.sort((a, b) => a.order - b.order))
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) return
    if (questions.length === 0) return

    setSaving(true)
    try {
      const surveyData = {
        title: title.trim(),
        description: description.trim(),
        category,
        status,
        isPublic,
        allowAnonymous,
        showResults,
        responseGoal: responseGoal ? parseInt(responseGoal) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        questions: questions.map((q, i) => ({ ...q, order: i })),
        createdBy: user!.uid,
      }

      if (editingSurvey) {
        await updateSurvey(editingSurvey.id, surveyData)
      } else {
        await createSurvey(surveyData)
      }

      setShowForm(false)
      resetForm()
      await loadSurveys()
    } catch (err) {
      console.error('Error saving survey:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (surveyId: string) => {
    setDeleting(true)
    try {
      await deleteSurvey(surveyId)
      setDeleteModal(null)
      await loadSurveys()
    } catch (err) {
      console.error('Error deleting survey:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusToggle = async (survey: Survey, newStatus: SurveyStatus) => {
    try {
      await updateSurvey(survey.id, { status: newStatus })
      await loadSurveys()
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const viewResponses = async (surveyId: string) => {
    setViewingResponses(surveyId)
    setResponsesLoading(true)
    try {
      const res = await getSurveyResponses(surveyId)
      setResponses(res)
    } catch (err) {
      console.error('Error loading responses:', err)
    } finally {
      setResponsesLoading(false)
    }
  }

  // Question builder helpers
  const addQuestion = () => {
    const newQ: SurveyQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: 'multiple_choice',
      text: '',
      required: true,
      order: questions.length,
      options: ['Option 1', 'Option 2'],
    }
    setQuestions(prev => [...prev, newQ])
  }

  const updateQuestion = (index: number, updates: Partial<SurveyQuestion>) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, ...updates } : q))
  }

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index))
  }

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    setQuestions(prev => {
      const newQ = [...prev]
      const swapIdx = direction === 'up' ? index - 1 : index + 1
      if (swapIdx < 0 || swapIdx >= newQ.length) return prev
      ;[newQ[index], newQ[swapIdx]] = [newQ[swapIdx], newQ[index]]
      return newQ
    })
  }

  const addOption = (questionIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== questionIndex) return q
      return { ...q, options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] }
    }))
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== questionIndex) return q
      const newOptions = [...(q.options || [])]
      newOptions[optionIndex] = value
      return { ...q, options: newOptions }
    }))
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== questionIndex) return q
      return { ...q, options: (q.options || []).filter((_, oi) => oi !== optionIndex) }
    }))
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardNav />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <p className="text-sm text-slate-500">Access denied. Admin only.</p>
        </div>
      </div>
    )
  }

  // View Responses Modal
  if (viewingResponses) {
    const survey = surveys.find(s => s.id === viewingResponses)
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardNav />
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <button
            onClick={() => { setViewingResponses(null); setResponses([]) }}
            className="mb-4 text-sm text-slate-500 hover:text-slate-900"
          >
            ← Back to Surveys
          </button>

          <h1 className="text-2xl font-bold mb-1">Responses: {survey?.title}</h1>
          <p className="text-sm text-slate-500 mb-6">{responses.length} response{responses.length !== 1 ? 's' : ''}</p>

          {responsesLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-r-transparent"></div>
            </div>
          ) : responses.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No responses yet.</p>
          ) : (
            <div className="space-y-4">
              {survey?.questions.sort((a, b) => a.order - b.order).map(question => (
                <div key={question.id} className="rounded-lg border bg-white p-4">
                  <h3 className="text-sm font-semibold mb-3">{question.text}</h3>
                  <ResponseSummary question={question} responses={responses} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Survey Form
  if (showForm) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardNav />
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <button
            onClick={() => { setShowForm(false); resetForm() }}
            className="mb-4 text-sm text-slate-500 hover:text-slate-900"
          >
            ← Back to Surveys
          </button>

          <h1 className="text-2xl font-bold mb-6">
            {editingSurvey ? 'Edit Survey' : 'Create Survey'}
          </h1>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="rounded-lg border bg-white p-5">
              <h2 className="text-sm font-semibold mb-4">Basic Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Survey title..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
                    placeholder="Brief description..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as SurveyCategory)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      {categoryOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as SurveyStatus)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Response Goal (optional)</label>
                    <input
                      type="number"
                      value={responseGoal}
                      onChange={(e) => setResponseGoal(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="e.g., 500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Deadline (optional)</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="rounded-lg border bg-white p-5">
              <h2 className="text-sm font-semibold mb-4">Settings</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">Allow unauthenticated responses (public survey)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allowAnonymous}
                    onChange={(e) => setAllowAnonymous(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">Allow anonymous submissions</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showResults}
                    onChange={(e) => setShowResults(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">Show results publicly after submission</span>
                </label>
              </div>
            </div>

            {/* Questions */}
            <div className="rounded-lg border bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Questions ({questions.length})</h2>
                <button
                  onClick={addQuestion}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                >
                  + Add Question
                </button>
              </div>

              {questions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No questions added yet. Click &quot;Add Question&quot; to get started.</p>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                          Q{idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveQuestion(idx, 'up')}
                            disabled={idx === 0}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                            title="Move up"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveQuestion(idx, 'down')}
                            disabled={idx === questions.length - 1}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                            title="Move down"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeQuestion(idx)}
                            className="rounded p-1 text-red-400 hover:bg-red-50"
                            title="Remove question"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={q.text}
                          onChange={(e) => updateQuestion(idx, { text: e.target.value })}
                          className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                          placeholder="Question text..."
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={q.type}
                            onChange={(e) => {
                              const newType = e.target.value as SurveyQuestionType
                              const updates: Partial<SurveyQuestion> = { type: newType }
                              if (newType === 'multiple_choice' || newType === 'checkbox') {
                                updates.options = q.options?.length ? q.options : ['Option 1', 'Option 2']
                              }
                              if (newType === 'rating') {
                                updates.minRating = 1
                                updates.maxRating = 5
                              }
                              updateQuestion(idx, updates)
                            }}
                            className="rounded border border-slate-200 px-2 py-1.5 text-xs"
                          >
                            {questionTypes.map(qt => (
                              <option key={qt.value} value={qt.value}>{qt.label}</option>
                            ))}
                          </select>

                          <label className="flex items-center gap-2 text-xs text-slate-600">
                            <input
                              type="checkbox"
                              checked={q.required}
                              onChange={(e) => updateQuestion(idx, { required: e.target.checked })}
                              className="h-3.5 w-3.5 rounded border-slate-300"
                            />
                            Required
                          </label>
                        </div>

                        <input
                          type="text"
                          value={q.description || ''}
                          onChange={(e) => updateQuestion(idx, { description: e.target.value })}
                          className="w-full rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-500"
                          placeholder="Description (optional)..."
                        />

                        {/* Options for multiple choice / checkbox */}
                        {(q.type === 'multiple_choice' || q.type === 'checkbox') && (
                          <div className="space-y-1.5 pl-2">
                            {(q.options || []).map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 w-4">{optIdx + 1}.</span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                                  className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs"
                                />
                                <button
                                  onClick={() => removeOption(idx, optIdx)}
                                  disabled={(q.options?.length || 0) <= 2}
                                  className="text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addOption(idx)}
                              className="text-xs text-slate-500 hover:text-slate-900"
                            >
                              + Add option
                            </button>
                          </div>
                        )}

                        {/* Rating range */}
                        {q.type === 'rating' && (
                          <div className="flex items-center gap-3 text-xs text-slate-600">
                            <span>Range:</span>
                            <input
                              type="number"
                              value={q.minRating || 1}
                              onChange={(e) => updateQuestion(idx, { minRating: parseInt(e.target.value) || 1 })}
                              className="w-16 rounded border border-slate-200 px-2 py-1 text-xs"
                              min="0"
                              max="10"
                            />
                            <span>to</span>
                            <input
                              type="number"
                              value={q.maxRating || 5}
                              onChange={(e) => updateQuestion(idx, { maxRating: parseInt(e.target.value) || 5 })}
                              className="w-16 rounded border border-slate-200 px-2 py-1 text-xs"
                              min="1"
                              max="10"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save / Cancel */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowForm(false); resetForm() }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !title.trim() || !description.trim() || questions.length === 0}
                className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : editingSurvey ? 'Update Survey' : 'Create Survey'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Survey List
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Surveys</h1>
            <p className="text-sm text-slate-500">{surveys.length} survey{surveys.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={openCreate}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            + New Survey
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-r-transparent"></div>
          </div>
        ) : surveys.length === 0 ? (
          <div className="text-center py-12 rounded-lg border bg-white">
            <p className="text-sm text-slate-400 mb-3">No surveys yet.</p>
            <button
              onClick={openCreate}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Create First Survey
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {surveys.map(survey => (
              <div key={survey.id} className="rounded-lg border bg-white p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold truncate">{survey.title}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColors[survey.status]}`}>
                      {survey.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{survey.description}</p>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400">
                    <span>{survey.questions.length} question{survey.questions.length !== 1 ? 's' : ''}</span>
                    <span>{survey.responseCount} response{survey.responseCount !== 1 ? 's' : ''}</span>
                    <span className="capitalize">{survey.category}</span>
                    {survey.deadline && (
                      <span>
                        Deadline: {new Date(
                          survey.deadline instanceof Date ? survey.deadline.getTime() : (survey.deadline as any)?.toMillis?.() || 0
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {survey.status === 'draft' && (
                    <button
                      onClick={() => handleStatusToggle(survey, 'active')}
                      className="rounded px-2 py-1 text-[10px] font-medium text-green-600 hover:bg-green-50"
                    >
                      Activate
                    </button>
                  )}
                  {survey.status === 'active' && (
                    <button
                      onClick={() => handleStatusToggle(survey, 'closed')}
                      className="rounded px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-50"
                    >
                      Close
                    </button>
                  )}
                  {survey.status === 'closed' && (
                    <button
                      onClick={() => handleStatusToggle(survey, 'active')}
                      className="rounded px-2 py-1 text-[10px] font-medium text-green-600 hover:bg-green-50"
                    >
                      Reopen
                    </button>
                  )}
                  <button
                    onClick={() => viewResponses(survey.id)}
                    className="rounded px-2 py-1 text-[10px] font-medium text-blue-600 hover:bg-blue-50"
                  >
                    Responses
                  </button>
                  <button
                    onClick={() => openEdit(survey)}
                    className="rounded px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteModal(survey.id)}
                    className="rounded px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-2">Delete Survey</h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to delete this survey? This action cannot be undone. All responses will also be lost.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteModal(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal)}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Response Summary for admin view
function ResponseSummary({ question, responses }: { question: SurveyQuestion; responses: SurveyResponse[] }) {
  const answersForQ = responses
    .map(r => r.answers.find(a => a.questionId === question.id))
    .filter(Boolean)

  if (answersForQ.length === 0) {
    return <p className="text-xs text-slate-400">No responses.</p>
  }

  if (question.type === 'multiple_choice' || question.type === 'yes_no') {
    const counts: Record<string, number> = {}
    answersForQ.forEach(a => {
      const val = String(a!.value)
      counts[val] = (counts[val] || 0) + 1
    })
    const total = answersForQ.length
    const options = question.type === 'yes_no' ? ['Yes', 'No'] : (question.options || [])

    return (
      <div className="space-y-1.5">
        {options.map(opt => {
          const count = counts[opt] || 0
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={opt} className="flex items-center gap-2 text-xs">
              <span className="w-24 truncate text-slate-600">{opt}</span>
              <div className="flex-1 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-slate-900" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-12 text-right text-slate-500">{count} ({pct}%)</span>
            </div>
          )
        })}
      </div>
    )
  }

  if (question.type === 'checkbox') {
    const counts: Record<string, number> = {}
    answersForQ.forEach(a => {
      const vals = Array.isArray(a!.value) ? a!.value : [String(a!.value)]
      vals.forEach(v => { counts[v] = (counts[v] || 0) + 1 })
    })
    const total = answersForQ.length

    return (
      <div className="space-y-1.5">
        {(question.options || []).map(opt => {
          const count = counts[opt] || 0
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={opt} className="flex items-center gap-2 text-xs">
              <span className="w-24 truncate text-slate-600">{opt}</span>
              <div className="flex-1 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-slate-900" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-12 text-right text-slate-500">{count} ({pct}%)</span>
            </div>
          )
        })}
      </div>
    )
  }

  if (question.type === 'rating') {
    const values = answersForQ.map(a => Number(a!.value)).filter(v => !isNaN(v))
    const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : '0'

    return (
      <div>
        <p className="text-lg font-bold text-slate-900 mb-1">{avg} <span className="text-xs font-normal text-slate-400">average</span></p>
        <p className="text-xs text-slate-400">{values.length} rating{values.length !== 1 ? 's' : ''}</p>
      </div>
    )
  }

  return (
    <div className="space-y-1 max-h-32 overflow-y-auto">
      {answersForQ.slice(0, 5).map((a, i) => (
        <div key={i} className="rounded bg-slate-50 px-2 py-1">
          <p className="text-xs text-slate-600">{String(a!.value)}</p>
        </div>
      ))}
      {answersForQ.length > 5 && (
        <p className="text-[10px] text-slate-400">+{answersForQ.length - 5} more</p>
      )}
    </div>
  )
}

