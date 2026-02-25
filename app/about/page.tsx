import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f8fbfa] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-10 items-center justify-center rounded-md bg-emerald-500 text-[10px] font-bold text-white">
              WTP
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
              We The People
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-500 md:flex">
            <Link href="/about" className="font-medium text-slate-900">
              About
            </Link>
            <Link href="/news" className="transition-colors hover:text-slate-900">
              Articles
            </Link>
            <Link href="/signup" className="transition-colors hover:text-slate-900">
              Join
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/70 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">About WTP</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-5xl">Why We The People</h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-lg">
            We The People is a non-partisan platform that promotes civic participation, political awareness,
            youth priorities, and the social issues that matter most to society.
          </p>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-emerald-50/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">What We Stand For</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Civic Participation',
                text: 'We encourage active citizen engagement through accessible information, public dialogue, and practical participation pathways.',
              },
              {
                title: 'Political & Governance Issues',
                text: 'We provide clear context on policy, governance, and democratic processes so communities can engage from an informed position.',
              },
              {
                title: 'Youth & Social Priorities',
                text: 'We amplify youth perspectives and spotlight social issues affecting livelihoods, equity, and long-term national development.',
              },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Our Commitment</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            Built for confidence, clarity, and impact
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            We The People is a trusted civic platform that connects people to the conversations, institutions,
            and actions needed to address political, youth, and societal challenges responsibly.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              Join WTP
            </Link>
            <Link
              href="/news"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Read Articles
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-600 sm:px-6">
          <p className="text-center">© 2026 We The People (WTP). All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

