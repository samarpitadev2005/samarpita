import { useEffect, useState } from 'react'
import PageHero from '../components/PageHero'
import Seo from '../components/Seo'
import { getLenis } from '../lib/lenis'
import { site } from '../data/site'

const privacy = [
  { id: 'collect', title: 'Information we collect', body: ['When you contact us or fill a form, we collect details you choose to share, such as your name, email, phone number, location and a description of your problem.', 'We may also collect basic, anonymous usage data (like pages visited) to improve this website.'] },
  { id: 'use', title: 'How we use your information', body: ['To understand your problem and contact you with help.', 'To coordinate with volunteers or partner experts working on your case, only with your consent.', 'To send updates about programs if you have asked to receive them.'] },
  { id: 'protection', title: 'Data protection', body: ['Your information is accessible only to authorised members of our case team. We use reasonable technical and organisational measures to keep it safe.'] },
  { id: 'sharing', title: 'Sharing of information', body: ['We never sell or rent your personal information. We share it only when needed to help you (with your consent) or when required by law.'] },
  { id: 'cookies', title: 'Cookies', body: ['This website uses only essential cookies and local storage needed for it to function. We do not use advertising cookies.'] },
  { id: 'rights', title: 'Your rights', body: ['You can ask us to view, correct or delete the information you have shared with us at any time by writing to us.'] },
  { id: 'contact', title: 'Contact us', body: [`For any privacy-related question, write to ${site.email} or call ${site.phone}.`] },
]

const terms = [
  { id: 'acceptance', title: 'Acceptance of terms', body: ['By using the Samarpita website you agree to these Terms & Conditions. If you do not agree, please do not use the website.'] },
  { id: 'use', title: 'Use of website', body: ['You agree to share true and accurate information when contacting us.', 'You must not misuse the website, submit harmful content or attempt to disrupt its working.'] },
  { id: 'donations', title: 'Donations & refunds', body: ['All donations are voluntary and are used for Samarpita’s charitable activities.', 'Donations made in error may be refunded if requested within 7 days, by writing to us with the transaction details.'] },
  { id: 'volunteers', title: 'Volunteer conduct', body: ['Volunteers must treat every person with respect and dignity, protect the privacy of those we serve and follow the guidance of program coordinators.'] },
  { id: 'liability', title: 'Limitation of liability', body: ['Samarpita provides guidance and support in good faith. We are not liable for any loss arising from decisions made based on information on this website.'] },
  { id: 'changes', title: 'Changes to terms', body: ['We may update these terms from time to time. The latest version will always be available on this page.'] },
  { id: 'contact', title: 'Contact us', body: [`Questions about these terms? Write to ${site.email}.`] },
]

function LegalPage({ title, crumb, sections }) {
  const [active, setActive] = useState(sections[0].id)

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-30% 0px -60% 0px' },
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [sections])

  const go = (id) => {
    const el = document.getElementById(id)
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(el, { offset: -120 })
    else el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Seo title={crumb} description={`${crumb} of Samarpita Social Foundation Trust, Odisha.`} />
      <PageHero eyebrow="Legal" crumb={crumb} lines={[title]} text="Last updated: October 2026" />
      <section className="container-x pb-24 sm:pb-36">
        <div className="grid gap-12 border-t border-line pt-12 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <nav className="lg:sticky lg:top-32">
              <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-muted">On this page</p>
              <ul className="space-y-1">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <button
                      onClick={() => go(s.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[15px] transition-all ${
                        active === s.id ? 'bg-ink text-cream' : 'text-ink/60 hover:bg-sand hover:text-ink'
                      }`}
                    >
                      <span className={`font-display text-lg ${active === s.id ? 'text-brand' : ''}`}>{String(i + 1).padStart(2, '0')}</span>
                      {s.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          <div className="space-y-14 lg:col-span-7 lg:col-start-6">
            {sections.map((s, i) => (
              <article key={s.id} id={s.id} className="scroll-mt-32">
                <p className="font-display text-xl text-brand">{String(i + 1).padStart(2, '0')}</p>
                <h2 className="mt-2 font-display text-4xl">{s.title}</h2>
                <div className="mt-5 space-y-3 text-[17px] leading-relaxed text-muted">
                  {s.body.map((p, k) => <p key={k}>{p}</p>)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export const PrivacyPolicy = () => <LegalPage title="Privacy *Policy*" crumb="Privacy Policy" sections={privacy} />
export const Terms = () => <LegalPage title="Terms & *Conditions*" crumb="Terms & Conditions" sections={terms} />
