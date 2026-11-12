import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HandCoins, UsersThree, Handshake, QrCode, Phone, WhatsappLogo, EnvelopeSimple, Certificate, ShieldCheck, Seal, CheckCircle } from '@phosphor-icons/react'
import { gsap } from '../lib/gsap'
import PageHero from '../components/PageHero'
import SplitHeading from '../components/SplitHeading'
import Reveal from '../components/Reveal'
import Button from '../components/Button'
import { sendForm } from '../lib/mail'
import { getLenis } from '../lib/lenis'
import { site } from '../data/site'

const ways = [
  { icon: HandCoins, title: 'Contribute', text: 'Your contribution funds education kits, medicines and relief for families in need.', href: '#donate', cta: 'Contact us to contribute' },
  { icon: UsersThree, title: 'Volunteer', text: 'Give a few hours a week to teach, organise camps or help people with paperwork.', href: '#volunteer', cta: 'Join as volunteer' },
  { icon: Handshake, title: 'Partner with us', text: 'Companies and institutions can partner through CSR to create lasting impact.', href: '#volunteer', cta: 'Become a partner' },
]

const allocation = [
  { label: 'Education', pct: 40 },
  { label: 'Healthcare', pct: 30 },
  { label: 'Relief & food', pct: 20 },
  { label: 'Operations', pct: 10 },
]

function Ways() {
  return (
    <section className="container-x pb-24 sm:pb-32">
      <Reveal className="grid gap-4 md:grid-cols-3" stagger={0.1}>
        {ways.map(({ icon: Icon, title, text, href, cta }, i) => (
          <a
            data-reveal
            key={title}
            href={href}
            onClick={(e) => {
              e.preventDefault()
              getLenis()?.scrollTo(href, { offset: -100 })
            }}
            className={`group flex min-h-[340px] flex-col rounded-[2rem] p-9 transition-transform duration-500 hover:-translate-y-2 ${
              i === 0 ? 'bg-mint text-night' : i === 1 ? 'theme-dark bg-forest ring-1 ring-line' : 'border border-line bg-linen'
            }`}
          >
            <Icon size={44} weight="duotone" />
            <h3 className="mt-auto font-display text-4xl">{title}</h3>
            <p className={`mt-3 leading-relaxed ${i === 2 ? 'text-muted' : 'opacity-75'}`}>{text}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold">
              {cta}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </a>
        ))}
      </Reveal>
    </section>
  )
}

// Online payment is not live yet. Until the QR code is ready, people who want to contribute
// are asked to reach the team directly.
function Donate() {
  const helpline = site.phones[0]
  return (
    <section id="donate" className="bg-linen py-24 sm:py-32">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <span className="eyebrow">Contribute</span>
          <SplitHeading lines={['Every rupee', 'reaches a *life*']} className="mt-5 text-[clamp(2.75rem,5.5vw,5rem)]" />
          <p className="mt-6 max-w-md leading-relaxed text-muted">
            Every contribution goes directly into education kits, medicines, blood donation camps and relief for families in need. We share with every supporter how their help was used.
          </p>
        </div>

        <Reveal className="lg:col-span-7">
          <div data-reveal className="rounded-[2rem] border border-line bg-cream p-6 shadow-[0_30px_80px_-40px_rgba(16,35,31,0.35)] sm:p-10">
            <h3 className="font-display text-4xl leading-tight sm:text-5xl">
              Want to contribute? <span className="italic text-brand">Talk to us.</span>
            </h3>
            <p className="mt-4 max-w-lg leading-relaxed text-muted">
              Online payments are being set up. Until then, please call, WhatsApp or email our team and we will guide you personally on how to contribute, whether it is money, materials or your time.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <a href={`tel:${helpline.raw}`} className="group flex flex-col gap-3 rounded-2xl border border-line bg-linen p-5 transition-colors hover:border-ink">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-mint group-hover:text-night"><Phone size={22} weight="duotone" /></span>
                <span>
                  <span className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">Call</span>
                  <span className="mt-1 block font-semibold">{helpline.number}</span>
                </span>
              </a>
              <a href={site.whatsappLink} target="_blank" rel="noreferrer" className="group flex flex-col gap-3 rounded-2xl border border-line bg-linen p-5 transition-colors hover:border-ink">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-mint group-hover:text-night"><WhatsappLogo size={22} weight="duotone" /></span>
                <span>
                  <span className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">WhatsApp</span>
                  <span className="mt-1 block font-semibold">{site.whatsapp}</span>
                </span>
              </a>
              <a href={`mailto:${site.email}?subject=I%20want%20to%20contribute`} className="group flex flex-col gap-3 rounded-2xl border border-line bg-linen p-5 transition-colors hover:border-ink">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-mint group-hover:text-night"><EnvelopeSimple size={22} weight="duotone" /></span>
                <span>
                  <span className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">Email</span>
                  <span className="mt-1 block break-all font-semibold">{site.email}</span>
                </span>
              </a>
            </div>

            <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-2xl bg-sand/60 p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl border border-dashed border-ink/30 text-muted"><QrCode size={34} weight="thin" /></span>
                <div>
                  <p className="font-semibold">UPI QR code coming soon</p>
                  <p className="mt-0.5 text-[13px] text-muted">Scan-and-pay will appear here once it is ready.</p>
                </div>
              </div>
              <Button to="/contact" variant="accent">Contact us</Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Allocation() {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.alloc-bar', {
        scaleX: 0,
        duration: 1.6,
        ease: 'expo.out',
        stagger: 0.12,
        scrollTrigger: { trigger: ref.current, start: 'top 75%', toggleActions: 'play none none none' },
      })
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={ref} className="container-x py-24 sm:py-32">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <span className="eyebrow">Transparency</span>
          <SplitHeading lines={['Where your', 'money *goes*']} className="mt-5 text-[clamp(2.5rem,4.5vw,4rem)]" />
        </div>
        <div className="space-y-8 lg:col-span-8">
          {allocation.map((a, i) => (
            <div key={a.label}>
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-lg font-semibold">{a.label}</span>
                <span className="font-display text-4xl">{a.pct}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-sand">
                <div
                  className={`alloc-bar h-full origin-left rounded-full ${['bg-mint', 'bg-brand', 'bg-moss', 'bg-ink'][i]}`}
                  style={{ width: `${a.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function VolunteerForm() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    setStatus('sending')
    try {
      await sendForm({ ...data, _subject: `[Volunteer] ${data.name} | ${data.interest || 'General'}` })
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }
  return (
    <section id="volunteer" className="container-x pb-24 sm:pb-32">
      <div className="theme-dark grain relative overflow-hidden rounded-[2rem] bg-forest p-6 ring-1 ring-line sm:rounded-[3rem] sm:p-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,var(--c-brand),transparent)] opacity-25" />
        <div className="relative grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="eyebrow">Volunteer with us</span>
            <SplitHeading lines={['Lend a hand,', 'change a *life*']} className="mt-5 text-[clamp(2.5rem,5vw,4.5rem)]" />
            <p className="mt-6 max-w-sm leading-relaxed text-muted">Fill in your details and our team will contact you about upcoming programs near you.</p>
          </div>
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {status === 'sent' ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex h-full flex-col items-center justify-center rounded-3xl bg-linen p-10 text-center"
                >
                  <CheckCircle size={64} weight="duotone" className="text-brand" />
                  <h3 className="mt-6 font-display text-4xl">Welcome to the family!</h3>
                  <p className="mt-3 text-muted">We’ll get in touch with you very soon.</p>
                </motion.div>
              ) : (
                <motion.form key="form" exit={{ opacity: 0 }} onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
                  <input name="name" required className="field" placeholder="Full name" />
                  <input name="email" required type="email" className="field" placeholder="Email" />
                  <input name="phone" required type="tel" className="field" placeholder="Phone" />
                  <input name="city" className="field" placeholder="City / Village" />
                  <select name="interest" className="field" defaultValue="">
                    <option value="" disabled>Area of interest</option>
                    <option>Teaching</option>
                    <option>Health camps</option>
                    <option>Blood donation camps</option>
                    <option>Relief work</option>
                    <option>Women’s support</option>
                    <option>CSR partnership</option>
                  </select>
                  <select name="availability" className="field" defaultValue="">
                    <option value="" disabled>Availability</option>
                    <option>Weekdays</option>
                    <option>Weekends</option>
                    <option>Flexible</option>
                  </select>
                  {status === 'error' && (
                    <p className="text-[14px] text-blood sm:col-span-2">Something went wrong. Please try again or call us.</p>
                  )}
                  <div className="sm:col-span-2">
                    <Button type="submit" variant="accent" disabled={status === 'sending'}>
                      {status === 'sending' ? 'Sending…' : 'Join now'}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

function Trust() {
  const badges = [
    { icon: Certificate, label: '80G tax exemption' },
    { icon: ShieldCheck, label: '12A registered' },
    { icon: Seal, label: 'Audited accounts' },
  ]
  const partners = ['Seva Trust', 'Odisha Cares', 'HopeWorks', 'GreenRoots', 'Asha Foundation', 'Udaan']
  return (
    <section className="border-t border-line py-20">
      <div className="container-x">
        <div className="flex flex-wrap justify-center gap-3">
          {badges.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-[14px] font-semibold">
              <Icon size={18} className="text-brand" weight="duotone" /> {label}
            </span>
          ))}
        </div>
        <p className="mt-14 text-center text-[12px] font-semibold uppercase tracking-[0.22em] text-muted">Supported by</p>
        <div className="mt-8 grid grid-cols-2 gap-8 text-center sm:grid-cols-3 lg:grid-cols-6">
          {partners.map((p) => (
            <span key={p} className="font-display text-2xl text-ink/40 transition-colors hover:text-ink">{p}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Support() {
  return (
    <>
      <PageHero
        eyebrow="Support us"
        crumb="Support Us"
        lines={['Together we can', '*change* lives.']}
        text="Your time, skills or contribution can be the reason someone gets a second chance. Choose how you’d like to help."
      />
      <Ways />
      <Donate />
      <Allocation />
      <VolunteerForm />
      <Trust />
    </>
  )
}
