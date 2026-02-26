import Link from 'next/link'
import TwitterEmbed from '@/app/components/TwitterEmbed'
import LandingAuthActions from '@/app/components/LandingAuthActions'

const offerings = [
  {
    title: 'Investment & Property',
    icon: 'investment',
    description:
      'Discover safer investment pathways, property ownership guidance, and trusted professionals to reduce risk and improve outcomes.',
  },
  {
    title: 'Banking, Remittances & Pensions',
    icon: 'banking',
    description:
      'Access practical guidance on remittance channels, banking options, pensions, and cross-border financial decision-making.',
  },
  {
    title: 'Legal, Citizenship & Return Planning',
    icon: 'legal',
    description:
      'Get clarity on legal and citizenship matters, business setup considerations, and structured planning for returning home.',
  },
  {
    title: 'Voting & Civic Participation',
    icon: 'civic',
    href: '/nominations',
    description:
      'Stay informed on voting processes and civic updates so diaspora Zimbabweans can participate meaningfully in national development.',
  },
]

const experts = [
  { title: 'Youths', subtitle: 'Youth leaders & advocates', href: '/youths' },
  { title: 'Lawyers', subtitle: 'Legal & citizenship specialists' },
  { title: 'Investors', subtitle: 'Investment & property advisors' },
  { title: 'Policymakers', subtitle: 'Government & policy leaders', href: '/leadership' },
]

const stats = [
  { value: '$1B+', label: 'Annual Diaspora Remittances' },
  { value: '3M+', label: 'Zimbabweans Abroad' },
  { value: '50+', label: 'Expert Interviews' },
  { value: '24/7', label: 'Platform Access' },
  { value: '100%', label: 'Verified & Trusted' },
]

const differentiators = [
  {
    title: 'Expert-Verified Knowledge',
    description:
      'Every guide, directory, and resource is built from structured interviews with bankers, lawyers, investors, and policymakers.',
  },
  {
    title: 'Trusted Service Providers',
    description:
      'Connect with vetted professionals — from property agents to legal advisors — reducing fraud and increasing confidence.',
  },
  {
    title: 'Built for the Diaspora',
    description:
      'Designed specifically for Zimbabweans abroad — accessible from anywhere, anytime, on any device.',
  },
]

export default function Home() {
  const renderOfferingIcon = (icon: string) => {
    if (icon === 'investment') {
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 10h6M9 14h6" />
        </svg>
      )
    }
    if (icon === 'banking') {
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l9 4.5-9 4.5-9-4.5L12 3zm0 9v9m-6-6h12" />
        </svg>
      )
    }
    if (icon === 'legal') {
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M6 7h12M8 11l-3 5h6l-3-5zm8 0l-3 5h6l-3-5z" />
        </svg>
      )
    }
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10v10H7zM3 11h4m10 0h4M11 3v4m0 10v4" />
      </svg>
    )
  }

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
            <Link href="/news" className="transition-colors hover:text-slate-900">
              Articles
            </Link>
            <Link href="/directory" className="transition-colors hover:text-slate-900">
              Directory
            </Link>
            <Link href="/classifieds" className="transition-colors hover:text-slate-900">
              Classifieds
            </Link>
            <Link href="/nominations" className="transition-colors hover:text-slate-900">
              Nominations
            </Link>
            <Link href="/youths" className="transition-colors hover:text-slate-900">
              Youths
            </Link>
          </nav>
          <LandingAuthActions />
        </div>
      </header>

      <section className="relative flex min-h-[calc(100vh-73px)] items-center overflow-hidden border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-600">
            Zimbabwe&apos;s Diaspora Platform
          </p>
          <p className="-mt-2 mb-4 text-center text-lg" aria-label="Zimbabwe flag">
            🇿🇼
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-slate-900 sm:text-6xl">Diaspora Connect</h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-xl">
            Zimbabwe&apos;s Diaspora Intelligence Platform — connecting Zimbabwe and its global diaspora through
            trusted information, verified services, and structured economic and civic participation.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-emerald-500 px-7 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
            >
              Get Started
            </Link>
            <Link
              href="#learn-more"
              className="rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Learn More
            </Link>
          </div>
        </div>
        <Link
          href="#learn-more"
          className="group absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
          aria-label="Scroll to learn more"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400 transition-colors group-hover:text-slate-500">
            Scroll
          </p>
          <span className="mx-auto flex h-16 w-9 items-start justify-center rounded-full border-4 border-slate-200 p-1.5">
            <span className="h-3 w-5 rounded-full bg-emerald-400 animate-scroll-nudge" />
          </span>
        </Link>
      </section>

      <section id="learn-more" className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">What We Offer</p>
        <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
          Everything Zimbabwe&apos;s Diaspora Needs
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-slate-600">
          DC provides a centralized, trusted digital infrastructure where diaspora Zimbabweans can access
          verified knowledge, connect with trusted professionals, discover secure opportunities, and make
          informed decisions.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {offerings.map((offering) => {
            const card = (
              <article className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  {renderOfferingIcon(offering.icon)}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{offering.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{offering.description}</p>
              </article>
            )

            if (offering.href) {
              return (
                <Link key={offering.title} href={offering.href} className="block">
                  {card}
                </Link>
              )
            }

            return <div key={offering.title}>{card}</div>
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-emerald-50/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Powered by Expertise</p>
          <h2 className="mt-3 text-center text-3xl font-bold text-slate-900 sm:text-4xl">Knowledge from Industry Leaders</h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-slate-600">
            The platform is powered by expert knowledge gathered through structured consultations with
            bankers, lawyers, policymakers, investors, and industry leaders.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {experts.map((expert) => {
              const card = (
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
                  <h3 className="text-lg font-semibold text-slate-900">{expert.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{expert.subtitle}</p>
                </article>
              )

              if (expert.href) {
                return (
                  <Link key={expert.title} href={expert.href} className="block">
                    {card}
                  </Link>
                )
              }

              return <div key={expert.title}>{card}</div>
            })}
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                <p className="text-2xl font-bold text-emerald-600">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Why Choose DC</p>
        <h2 className="mt-3 text-center text-3xl font-bold text-slate-900 sm:text-4xl">What makes DC different?</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {differentiators.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-gradient-to-r from-emerald-100 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Mission</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">From fragmented support to structured development</h2>
          <p className="mx-auto mt-4 max-w-3xl text-slate-600">
            DC transforms diaspora contribution into trusted, scalable national development by improving
            transparency, reducing fraud, and enabling confident participation in Zimbabwe&apos;s economic and
            civic future.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              Join DC
            </Link>
            <Link
              href="/news"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Explore Articles
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 text-center md:grid-cols-4">
            <div className="flex flex-col items-center">
              <p className="text-base font-semibold text-slate-900">DC Diaspora Connect</p>
              <p className="mt-2 text-sm text-slate-600">
                Zimbabwe&apos;s diaspora intelligence platform — trusted information, verified services, and
                structured participation for our global community.
              </p>
              <button
                type="button"
                className="mt-4 inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Download for Android
              </button>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-semibold text-slate-900">Explore</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <Link href="/about" className="block transition-colors hover:text-slate-900">
                  About Us
                </Link>
                <Link href="/our-work" className="block transition-colors hover:text-slate-900">
                  Our Work
                </Link>
                <Link href="/surveys" className="block transition-colors hover:text-slate-900">
                  Surveys
                </Link>
                <Link href="/youths" className="block transition-colors hover:text-slate-900">
                  Youths
                </Link>
                <Link href="/signup" className="block transition-colors hover:text-slate-900">
                  Join DC
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-semibold text-slate-900">Engage</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <Link href="/news" className="block transition-colors hover:text-slate-900">
                  Articles
                </Link>
                <Link href="/directory" className="block transition-colors hover:text-slate-900">
                  Directory
                </Link>
                <Link href="/classifieds" className="block transition-colors hover:text-slate-900">
                  Classifieds
                </Link>
                <Link href="/nominations" className="block transition-colors hover:text-slate-900">
                  Nominations
                </Link>
              </div>
            </div>
            <div id="footer-contact" className="flex flex-col items-center">
              <h3 className="text-sm font-semibold text-slate-900">Follow Us</h3>
              <p className="mt-3 text-sm text-slate-600">Connect with us on social media.</p>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
            <p>© 2026 Diaspora Connect (DC). All rights reserved.</p>
            <p className="mt-1">
              <Link href="/privacy" className="transition-colors hover:text-slate-900">
                Privacy Policy
              </Link>
              <span className="mx-2">·</span>
              <Link href="/terms" className="transition-colors hover:text-slate-900">
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </footer>

      <TwitterEmbed />
    </main>
  )
}
