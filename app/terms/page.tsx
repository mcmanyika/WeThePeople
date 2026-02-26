import Link from 'next/link'

export default function TermsOfServicePage() {
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
            <Link href="/terms" className="font-medium text-slate-900">
              Terms
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/70 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Legal</p>
            <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">Terms of Service</h1>
            <p className="text-sm text-slate-600 sm:text-base">Last updated: February 25, 2026</p>
          </div>
        </div>
      </section>

      <section className="bg-[#f8fbfa] py-10 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <div>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                Welcome to Diaspora Connect (&quot;DC&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By accessing or using
                our website and related services (collectively, the &quot;Platform&quot;), you agree to be bound by
                these Terms of Service. If you do not agree to these terms, please do not use the Platform.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">1. About the Platform</h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                Diaspora Connect is a non-partisan civic platform focused on civic participation, political awareness,
                youth issues, and broader social concerns. The Platform provides tools for engagement, surveys,
                membership, volunteering, donations, and community dialogue.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">2. Eligibility</h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                You must be at least 18 years of age to create an account, submit applications, sign petitions, or
                make donations on the Platform. By using the Platform, you represent and warrant that you meet this
                age requirement and have the legal capacity to enter into these terms.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">3. Account Registration</h2>
              <p className="mb-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                To access certain features of the Platform, you may need to create an account. When registering, you agree to:
              </p>
              <ul className="ml-5 list-disc space-y-2 text-sm text-slate-600 sm:text-base">
                <li>Provide accurate, current, and complete information.</li>
                <li>Maintain the security and confidentiality of your login credentials.</li>
                <li>Accept responsibility for all activities that occur under your account.</li>
                <li>Notify us immediately of any unauthorised use of your account.</li>
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                We reserve the right to suspend or terminate accounts that violate these terms or engage in harmful conduct.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">4. Membership</h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                Membership applications are subject to review and approval by DC. Membership contributions of $5 per
                month or $60 per year support our civic education, mobilisation, petition outreach, and constitutional
                defence work. Membership may be revoked if a member engages in conduct that is inconsistent with
                DC&apos;s values, mission, or these terms.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">5. Volunteering</h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                Volunteer applications are subject to review and approval. Volunteers are expected to act in good faith,
                represent DC respectfully, and adhere to any guidelines or instructions provided. DC reserves
                the right to decline or revoke volunteer status at its discretion.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">6. Petitions</h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                By signing a petition on the Platform, you confirm that your identity and information are accurate.
                Petition signatures are used to demonstrate civic engagement and may be presented to relevant
                authorities or institutions. Your name and province may be displayed publicly alongside the petition
                as a signatory.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">7. Donations and Payments</h2>
              <p className="mb-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Donations made through the Platform are processed securely via Stripe. By making a donation, you agree that:
              </p>
              <ul className="ml-5 list-disc space-y-2 text-sm text-slate-600 sm:text-base">
                <li>All donations are voluntary and made at your own discretion.</li>
                <li>Donations are non-refundable unless required by law or at DC&apos;s sole discretion.</li>
                <li>Funds will be used to support DC&apos;s mission, programmes, and operational costs.</li>
                <li>You are authorised to use the payment method provided.</li>
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Product purchases through our shop are also processed via Stripe and are subject to stock availability.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">8. User Conduct</h2>
              <p className="mb-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                When using the Platform, you agree not to:
              </p>
              <ul className="ml-5 list-disc space-y-2 text-sm text-slate-600 sm:text-base">
                <li>Use the Platform for any unlawful purpose or in violation of any applicable laws.</li>
                <li>Submit false, misleading, or fraudulent information.</li>
                <li>Attempt to gain unauthorised access to any part of the Platform or its systems.</li>
                <li>Engage in harassment, hate speech, or any conduct that undermines the dignity of others.</li>
                <li>Distribute spam, malware, or any harmful content through the Platform.</li>
                <li>Impersonate any person or misrepresent your affiliation with any entity.</li>
                <li>Use the Platform to promote violence, incite hatred, or undermine constitutional governance.</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">9. Intellectual Property</h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                All content on the Platform, including text, graphics, logos, images, and software, is the property of
                DC or its content providers and is protected by applicable intellectual property laws. You may not
                reproduce, distribute, modify, or create derivative works from any content on the Platform without
                prior written consent from DC.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">10. Third-Party Links and Services</h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                The Platform may contain links to third-party websites or services (such as social media platforms,
                payment processors, and external resources). DC is not responsible for the content, privacy
                practices, or availability of these external sites. Use of third-party services is at your own risk
                and subject to their respective terms and conditions.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">11. Disclaimer of Warranties</h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                The Platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis. DC makes no warranties,
                express or implied, regarding the Platform&apos;s reliability, accuracy, availability, or fitness for a particular
                purpose. We do not guarantee that the Platform will be uninterrupted, error-free, or free from
                viruses or other harmful components.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">12. Limitation of Liability</h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                To the fullest extent permitted by law, DC and its directors, officers, volunteers, and affiliates
                shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising
                from your use of or inability to use the Platform, including but not limited to loss of data, revenue,
                or goodwill.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">13. Indemnification</h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                You agree to indemnify and hold harmless DC, its directors, officers, volunteers, and affiliates
                from any claims, damages, losses, or expenses (including legal fees) arising from your use of the
                Platform, your violation of these terms, or your infringement of any rights of another party.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">14. Termination</h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                We reserve the right to suspend or terminate your access to the Platform at any time, with or without
                notice, for conduct that we believe violates these terms or is harmful to other users, DC, or third
                parties. Upon termination, your right to use the Platform will immediately cease.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">15. Changes to These Terms</h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                We may update these Terms of Service from time to time. Changes will be posted on this page with a
                revised &quot;Last updated&quot; date. Your continued use of the Platform after any changes constitutes
                acceptance of the revised terms. We encourage you to review these terms periodically.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">16. Governing Law</h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                These Terms of Service shall be governed by and construed in accordance with the laws of Zimbabwe.
                Any disputes arising from these terms or your use of the Platform shall be subject to the exclusive
                jurisdiction of the courts of Zimbabwe.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">17. Contact Us</h2>
              <p className="mb-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                If you have any questions or concerns about these Terms of Service, please contact us:
              </p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:text-base">
                <p className="font-semibold">Diaspora Connect (DC)</p>
                <p className="mt-1">
                  Email:{' '}
                  <a href="mailto:contact@wtp.com" className="text-emerald-700 hover:underline">contact@wtp.com</a>
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                Please also review our{' '}
                <Link href="/privacy" className="font-medium text-emerald-700 hover:underline">Privacy Policy</Link>{' '}
                to understand how we collect, use, and protect your personal information.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-slate-600 sm:px-6">
          <p>© 2026 Diaspora Connect (DC). All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
