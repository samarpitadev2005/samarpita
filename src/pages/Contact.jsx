import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MapPin, Phone, EnvelopeSimple, WhatsappLogo, Clock, Siren, Paperclip, CheckCircle, CircleNotch, WarningCircle, Star } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import Button from '../components/Button'
import Accordion from '../components/Accordion'
import SplitHeading from '../components/SplitHeading'
import { site } from '../data/site'
import { sendForm } from '../lib/mail'
import { addFeedback, isLive } from '../lib/store'

const categories = ['Education', 'Health', 'Financial', 'Family / Women issue', 'Elderly care', 'Legal help', 'Other']

const faqs = [
  { q: 'How soon will you reply?', a: 'Our team reads every message. You will usually hear from a coordinator within 24 to 48 hours. Urgent cases are prioritised the same day.' },
  { q: 'Is my information safe?', a: 'Yes. Your details are only seen by our case team and are never shared with anyone without your permission.' },
  { q: 'Do you charge any fee?', a: 'No. All help from Samarpita is completely free of cost. Please beware of anyone asking for money in our name.' },
  { q: 'Can I contact you on behalf of someone else?', a: 'Of course. Just mention their name and how we can reach them in your message.' },
]

function InfoCard({ icon: Icon, title, children, href }) {
  const Tag = href ? 'a' : 'div'
  return (
    <Tag href={href} data-reveal className="group flex gap-4 rounded-2xl border border-line bg-linen p-5 transition-colors hover:border-ink">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-mint group-hover:text-night">
        <Icon size={20} weight="duotone" />
      </span>
      <span className="min-w-0">
        <span className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">{title}</span>
        <span className="mt-1 block font-medium [overflow-wrap:anywhere]">{children}</span>
      </span>
    </Tag>
  )
}

function ProblemForm() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [urgency, setUrgency] = useState('Normal')
  const [fileName, setFileName] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    // Attachments are not uploaded; the mail notes the file name so the team can ask for it
    const file = data.attachment
    delete data.attachment
    setStatus('sending')
    try {
      await sendForm({
        ...data,
        urgency,
        attachment_note: file && file.name ? `User has a file to share: ${file.name}` : '',
        _subject: `[${urgency}] New problem: ${data.subject}`,
      })
      setStatus('sent')
      form.reset()
      setFileName('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="relative rounded-[2rem] border border-line bg-cream p-6 shadow-[0_30px_80px_-40px_rgba(16,35,31,0.35)] sm:p-10">
      <AnimatePresence mode="wait">
        {status === 'sent' ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-h-[560px] flex-col items-center justify-center text-center"
          >
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
              <CheckCircle size={88} weight="duotone" className="text-brand" />
            </motion.span>
            <h3 className="mt-8 font-display text-5xl">Thank you!</h3>
            <p className="mt-4 max-w-sm leading-relaxed text-muted">Your message has been sent. Our team will contact you within 24 to 48 hours.</p>
            <button onClick={() => setStatus('idle')} className="mt-8 text-[14px] font-semibold underline underline-offset-4">Send another message</button>
          </motion.div>
        ) : (
          <motion.form key="form" exit={{ opacity: 0 }} onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <h2 className="font-display text-4xl">Share your problem</h2>
              <p className="mt-2 text-[15px] text-muted">Fields marked * are required.</p>
            </div>
            <div>
              <label className="label" htmlFor="name">Full name *</label>
              <input id="name" name="name" required className="field" placeholder="Your name" />
            </div>
            <div>
              <label className="label" htmlFor="email">Email *</label>
              <input id="email" name="email" type="email" required className="field" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone number *</label>
              <input id="phone" name="phone" type="tel" required pattern="[0-9+\s-]{10,15}" className="field" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="label" htmlFor="city">City / Village</label>
              <input id="city" name="city" className="field" placeholder="Where do you live?" />
            </div>
            <div>
              <label className="label" htmlFor="category">Problem category *</label>
              <select id="category" name="category" required defaultValue="" className="field">
                <option value="" disabled>Select a category</option>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <span className="label">Urgency</span>
              <div className="relative grid grid-cols-2 rounded-2xl border border-line bg-linen p-1">
                {['Normal', 'Urgent'].map((u) => (
                  <button key={u} type="button" onClick={() => setUrgency(u)} className="relative z-10 rounded-xl py-3 text-[15px] font-semibold">
                    {urgency === u && (
                      <motion.span
                        layoutId="urgency"
                        className={`absolute inset-0 -z-10 rounded-xl ${u === 'Urgent' ? 'bg-blood' : 'bg-ink'}`}
                        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                      />
                    )}
                    <span className={urgency === u ? (u === 'Urgent' ? 'text-white' : 'text-cream') : 'text-ink/60'}>{u}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="subject">Subject *</label>
              <input id="subject" name="subject" required className="field" placeholder="In a few words, what is the problem?" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="message">Describe your problem *</label>
              <textarea id="message" name="message" required rows={6} className="field resize-none" placeholder="Tell us what happened and how we can help…" data-lenis-prevent />
            </div>
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-line bg-linen px-5 py-4 transition-colors hover:border-ink">
                <Paperclip size={22} className="text-brand" />
                <span className="text-[14px]">
                  <b>{fileName || 'Attach documents or photos'}</b>
                  <span className="block text-muted">Optional · PDF, JPG or PNG</span>
                </span>
                <input type="file" name="attachment" accept=".pdf,image/*" className="sr-only" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} />
              </label>
            </div>
            <label className="flex items-start gap-3 text-[14px] text-muted sm:col-span-2">
              <input type="checkbox" required className="mt-1 h-4 w-4 accent-[#0e9f5e]" />
              <span>
                I agree to the <Link to="/privacy-policy" className="font-semibold text-ink underline underline-offset-2">Privacy Policy</Link> and{' '}
                <Link to="/terms" className="font-semibold text-ink underline underline-offset-2">Terms &amp; Conditions</Link>.
              </span>
            </label>
            {status === 'error' && (
              <p className="flex items-center gap-2 rounded-xl bg-blood/10 px-4 py-3 text-[14px] text-blood sm:col-span-2">
                <WarningCircle size={18} /> Something went wrong. Please try again or email us at {site.email}.
              </p>
            )}
            <div className="sm:col-span-2">
              <Button type="submit" variant="accent" disabled={status === 'sending'}>
                {status === 'sending' ? (
                  <span className="flex items-center gap-2"><CircleNotch className="animate-spin" /> Sending…</span>
                ) : (
                  'Send message'
                )}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

function FeedbackForm() {
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [status, setStatus] = useState('idle')
  const onSubmit = async (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const fb = { name: data.name.trim(), place: data.place.trim(), rating, message: data.message.trim() }
    setStatus('sending')
    const mail = sendForm({ ...fb, rating: `${rating} / 5`, _subject: `[Feedback] ${rating}★ from ${fb.name}` })
    try {
      if (isLive) {
        await addFeedback(fb)
        mail.catch(() => {})
      } else {
        await mail
        await addFeedback(fb)
      }
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }
  return (
    <section className="container-x pb-24 sm:pb-32">
      <div className="theme-dark relative overflow-hidden rounded-[2rem] bg-forest p-6 ring-1 ring-line sm:rounded-[3rem] sm:p-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(247,196,8,0.18),transparent)]" />
        <div className="relative grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="eyebrow">Feedback</span>
            <SplitHeading lines={['How did we', '*do*?']} className="mt-5 text-[clamp(2.5rem,5vw,4.5rem)]" />
            <p className="mt-6 max-w-sm leading-relaxed text-muted">Has Samarpita helped you or someone you know? Your words help us improve and encourage our volunteers.</p>
          </div>
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {status === 'sent' ? (
                <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex h-full flex-col items-center justify-center rounded-3xl bg-linen p-10 text-center">
                  <CheckCircle size={64} weight="duotone" className="text-brand" />
                  <h3 className="mt-6 font-display text-4xl">Thank you for your feedback!</h3>
                </motion.div>
              ) : (
                <motion.form key="f" exit={{ opacity: 0 }} onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <span className="label">Your rating</span>
                    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          type="button"
                          key={n}
                          onClick={() => setRating(n)}
                          onMouseEnter={() => setHover(n)}
                          aria-label={`${n} star${n > 1 ? 's' : ''}`}
                          className="transition-transform hover:scale-110"
                        >
                          <Star size={34} weight={n <= (hover || rating) ? 'fill' : 'regular'} className="text-gold" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input name="name" required maxLength={100} className="field" placeholder="Your name" />
                  <input name="place" maxLength={100} className="field" placeholder="City / Village" />
                  <textarea name="message" required maxLength={2000} rows={4} className="field resize-none sm:col-span-2" placeholder="Write your feedback…" data-lenis-prevent />
                  {status === 'error' && <p className="text-[14px] text-blood sm:col-span-2">Something went wrong. Please try again.</p>}
                  <div className="sm:col-span-2">
                    <Button type="submit" variant="accent" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send feedback'}</Button>
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

export default function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Contact us"
        crumb="Contact Us"
        lines={['Tell us your', 'problem. We’re *here*.']}
        text="Your information is kept 100% confidential. Every message is read by our team. No problem is too big or too small."
      />

      <section className="container-x pb-24 sm:pb-32">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <ProblemForm />
          </div>
          <Reveal className="space-y-3 lg:col-span-4" stagger={0.06}>
            <a
              data-reveal
              href={`tel:${site.phoneRaw}`}
              className="block overflow-hidden rounded-2xl bg-blood p-6 text-white"
            >
              <span className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/80">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                </span>
                Urgent help · Call us
              </span>
              <span className="mt-4 flex items-center gap-3 font-display text-3xl sm:text-4xl">
                <Siren size={32} weight="duotone" className="shrink-0" /> {site.phone}
              </span>
            </a>
            <InfoCard icon={MapPin} title="Office">{site.address}</InfoCard>
            <InfoCard icon={Phone} title="Phone">
              <span className="flex flex-col gap-1">
                {site.phones.map((p) => (
                  <a key={p.raw} href={`tel:${p.raw}`} className="hover:text-brand">{p.number}</a>
                ))}
              </span>
            </InfoCard>
            <InfoCard icon={EnvelopeSimple} title="Email" href={`mailto:${site.email}`}>{site.email}</InfoCard>
            <InfoCard icon={WhatsappLogo} title="WhatsApp" href={site.whatsappLink}>{site.whatsapp}</InfoCard>
            <InfoCard icon={Clock} title="Working hours">{site.hours}</InfoCard>
          </Reveal>
        </div>
      </section>

      <section className="container-x pb-24 sm:pb-32">
        <div className="overflow-hidden rounded-[2rem] border border-line">
          <iframe
            title="Samarpita office location"
            src="https://www.google.com/maps?q=Odisha,India&output=embed"
            className="h-[420px] w-full grayscale-[0.6] contrast-[1.05] dark:invert-[0.9] dark:hue-rotate-180"
            loading="lazy"
          />
        </div>
      </section>

      <FeedbackForm />

      <section className="container-x pb-24 sm:pb-36">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <span className="eyebrow">FAQ</span>
            <SplitHeading lines={['Questions,', '*answered*']} className="mt-5 text-[clamp(2.5rem,4.5vw,4rem)]" />
          </div>
          <div className="lg:col-span-8">
            <Accordion items={faqs} />
          </div>
        </div>
      </section>
    </>
  )
}
