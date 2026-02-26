import Link from 'next/link'

export default function OurWorkPage() {
  return (
    <main className="min-h-screen bg-[#f8fbfa] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-10 items-center justify-center rounded-md bg-emerald-500 text-[10px] font-bold text-white">
              DC
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
              Diaspora Connect
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-500 md:flex">
            <Link href="/about" className="transition-colors hover:text-slate-900">
              About
            </Link>
            <Link href="/our-work" className="font-medium text-slate-900">
              Our Work
            </Link>
            <Link href="/news" className="transition-colors hover:text-slate-900">
              Articles
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/70 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Our Work</p>
            <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">What We Do</h1>
            <p className="mx-auto max-w-3xl text-sm text-slate-600 sm:text-base">
              We promote civic participation, political awareness, youth priorities, and social issues that
              concern communities in Zimbabwe and across the diaspora.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f8fbfa] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Our Approach</h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
              We combine credible information, public dialogue, and practical civic tools to help people
              engage meaningfully in the issues shaping society.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Civic Education',
                text: 'Simplify complex public issues so communities can make informed choices and participate effectively.',
              },
              {
                title: 'Political Awareness',
                text: 'Track and explain policy and governance developments with clarity, context, and accountability.',
              },
              {
                title: 'Youth Engagement',
                text: 'Create space for youth voices on employment, education, innovation, leadership, and representation.',
              },
              {
                title: 'Social Impact Issues',
                text: 'Highlight concerns affecting everyday life, including community welfare, public services, and equity.',
              },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Get Involved</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              Join conversations that move society forward
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Participate in surveys, read issue-based articles, and contribute your perspective to a
              growing civic community.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/surveys"
                className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                Take Surveys
              </Link>
              <Link
                href="/news"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Read Articles
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-600 sm:px-6">
          <p className="text-center">© 2026 Diaspora Connect (DC). All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}


