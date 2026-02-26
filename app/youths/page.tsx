'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  getCandidateNominations,
  getClassifiedListings,
  getLeaders,
  getNews,
  getSurveys,
} from '@/lib/firebase/firestore'
import type { CandidateNomination, ClassifiedListing, Leader, News, Survey } from '@/types'

function hasYouthFocus(text: string): boolean {
  const t = text.toLowerCase()
  return (
    t.includes('youth') ||
    t.includes('student') ||
    t.includes('graduates') ||
    t.includes('intern') ||
    t.includes('skills') ||
    t.includes('education') ||
    t.includes('employment')
  )
}

export default function YouthsPage() {
  const [loading, setLoading] = useState(true)
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [articles, setArticles] = useState<News[]>([])
  const [opportunities, setOpportunities] = useState<ClassifiedListing[]>([])
  const [leaders, setLeaders] = useState<Leader[]>([])
  const [nominations, setNominations] = useState<CandidateNomination[]>([])

  useEffect(() => {
    async function loadYouthModuleData() {
      try {
        setLoading(true)
        const [allSurveys, allNews, allClassifieds, allLeaders, allNominations] = await Promise.all([
          getSurveys('published'),
          getNews(true),
          getClassifiedListings('approved'),
          getLeaders(true),
          getCandidateNominations('approved'),
        ])
        setSurveys(allSurveys)
        setArticles(allNews)
        setOpportunities(allClassifieds)
        setLeaders(allLeaders)
        setNominations(allNominations)
      } finally {
        setLoading(false)
      }
    }

    loadYouthModuleData()
  }, [])

  const youthSurveys = useMemo(
    () => surveys.filter((s) => hasYouthFocus(`${s.title} ${s.description}`)).slice(0, 3),
    [surveys]
  )
  const youthArticles = useMemo(
    () => articles.filter((a) => hasYouthFocus(`${a.title} ${a.description}`)).slice(0, 3),
    [articles]
  )
  const youthOpportunities = useMemo(
    () =>
      opportunities
        .filter((o) =>
          o.category === 'jobs' ||
          o.category === 'community' ||
          hasYouthFocus(`${o.title} ${o.description}`)
        )
        .slice(0, 3),
    [opportunities]
  )
  const youthLeaders = useMemo(
    () => leaders.filter((l) => hasYouthFocus(`${l.title} ${l.bio}`)).slice(0, 3),
    [leaders]
  )
  const youthNominations = useMemo(
    () => nominations.filter((n) => hasYouthFocus(`${n.bio} ${n.manifesto || ''}`)).slice(0, 3),
    [nominations]
  )

  return (
    <main className="min-h-screen bg-[#f8fbfa] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-10 items-center justify-center rounded-md bg-emerald-500 text-[10px] font-bold text-white">
              DC
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">Diaspora Connect</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-500 md:flex">
            <Link href="/about" className="transition-colors hover:text-slate-900">About</Link>
            <Link href="/youths" className="font-medium text-slate-900">Youths</Link>
            <Link href="/surveys" className="transition-colors hover:text-slate-900">Surveys</Link>
            <Link href="/nominations" className="transition-colors hover:text-slate-900">Nominations</Link>
          </nav>
          <Link
            href="/signup"
            className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 sm:text-sm"
          >
            Join DC
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/70 py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Youth Module</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-5xl">Youth Voice & Leadership</h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            A focused space for youth priorities: voice, leadership, opportunities, and civic participation.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/surveys" className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600">
              Take Youth Surveys
            </Link>
            <Link href="/nominations/new" className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Nominate Youth Leader
            </Link>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-500 sm:px-6">
          Loading youth module...
        </section>
      ) : (
        <section className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 sm:py-12">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Youth Voice Polls</h2>
              <Link href="/surveys" className="text-sm font-medium text-emerald-700 hover:underline">View all surveys</Link>
            </div>
            {youthSurveys.length === 0 ? (
              <p className="text-sm text-slate-600">No youth-focused surveys yet.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {youthSurveys.map((survey) => (
                  <Link key={survey.id} href={`/surveys/${survey.id}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{survey.title}</p>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">{survey.description}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Youth Nominations</h2>
              <Link href="/nominations" className="text-sm font-medium text-emerald-700 hover:underline">View nominations</Link>
            </div>
            {youthNominations.length === 0 ? (
              <p className="text-sm text-slate-600">No youth-focused nominations yet.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {youthNominations.map((n) => (
                  <Link key={n.id} href={`/nominations/${n.id}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{n.fullName}</p>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">{n.bio}</p>
                    <p className="mt-2 text-[11px] font-medium text-slate-500">{n.voteCount || 0} votes</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Youth Opportunities</h2>
              <Link href="/classifieds" className="text-sm font-medium text-emerald-700 hover:underline">Browse classifieds</Link>
            </div>
            {youthOpportunities.length === 0 ? (
              <p className="text-sm text-slate-600">No opportunities yet.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {youthOpportunities.map((o) => (
                  <Link key={o.id} href={`/classifieds/${o.id}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{o.title}</p>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">{o.description}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Youth Leaders</h2>
              <Link href="/leadership" className="text-sm font-medium text-emerald-700 hover:underline">View leaders directory</Link>
            </div>
            {youthLeaders.length === 0 ? (
              <p className="text-sm text-slate-600">No youth leaders highlighted yet.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {youthLeaders.map((leader) => (
                  <Link key={leader.id} href={`/leadership/${leader.id}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{leader.name}</p>
                    <p className="mt-1 text-xs text-slate-600">{leader.title}</p>
                    {leader.xHandle && <p className="mt-2 text-[11px] font-medium text-slate-500">@{leader.xHandle.replace(/^@/, '')}</p>}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Youth Policy Explainers</h2>
              <Link href="/news" className="text-sm font-medium text-emerald-700 hover:underline">Read articles</Link>
            </div>
            {youthArticles.length === 0 ? (
              <p className="text-sm text-slate-600">No youth-focused articles yet.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {youthArticles.map((article) => (
                  <Link key={article.id} href={`/news/${article.id}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{article.title}</p>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">{article.description}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </section>
      )}
    </main>
  )
}
