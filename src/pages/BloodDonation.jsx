import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Drop,
  CheckCircle,
  XCircle,
  UserPlus,
  PhoneCall,
  Heartbeat,
  Phone,
  WhatsappLogo,
  CircleNotch,
  WarningCircle,
  Cake,
  Barbell,
  CalendarCheck,
  FirstAidKit,
} from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import SplitHeading from '../components/SplitHeading'
import Reveal from '../components/Reveal'
import Button from '../components/Button'
import Select from '../components/Select'
import Accordion from '../components/Accordion'
import { site } from '../data/site'
import { addDonor, listHeroes } from '../lib/store'
import Seo from '../components/Seo'
import ThankYouCard from '../components/ThankYouCard'
import OdiaWord from '../components/OdiaWord'

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

// Who each blood group can give red cells to
const DONATE_TO = {
  'O-': GROUPS,
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
}
const RECEIVE_FROM = Object.fromEntries(GROUPS.map((g) => [g, GROUPS.filter((d) => DONATE_TO[d].includes(g))]))

const DISTRICTS = [
  'Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack', 'Deogarh', 'Dhenkanal', 'Gajapati',
  'Ganjam', 'Jagatsinghpur', 'Jajpur', 'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha', 'Koraput',
  'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh',
]

const daysSince = (date) => Math.floor((Date.now() - new Date(date).getTime()) / 86400000)

function useEligibility({ age, weight, gender, lastDonation, neverDonated }) {
  return useMemo(() => {
    const gap = gender === 'Female' ? 120 : 90
    const checks = [
      { label: 'Age between 18 and 65', ok: age === '' ? null : age >= 18 && age <= 65 },
      { label: 'Weight 50 kg or more', ok: weight === '' ? null : weight >= 50 },
      {
        label: `At least ${gap / 30} months since last donation`,
        ok: neverDonated ? true : lastDonation ? daysSince(lastDonation) >= gap : null,
      },
    ]
    const failed = checks.some((c) => c.ok === false)
    const nextDate =
      !neverDonated && lastDonation && daysSince(lastDonation) < gap
        ? new Date(new Date(lastDonation).getTime() + gap * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : null
    return { checks, failed, nextDate }
  }, [age, weight, gender, lastDonation, neverDonated])
}

function DonorCard({ name, group, district }) {
  return (
    <div className="theme-dark grain relative overflow-hidden rounded-3xl bg-cream p-6 ring-1 ring-line">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(closest-side,var(--color-blood),transparent)] opacity-40" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Samarpita donor card</p>
          <p className="mt-3 max-w-[220px] truncate font-display text-3xl">{name || 'Your name'}</p>
          <p className="mt-1 text-[13px] text-muted">{district || 'District'}, Odisha</p>
        </div>
        <div className="text-right">
          <Drop size={28} weight="fill" className="ml-auto text-blood" />
          <AnimatePresence mode="wait">
            <motion.p
              key={group || 'none'}
              initial={{ y: 16, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="mt-1 font-display text-6xl leading-none text-blood"
            >
              {group || '?'}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <div className="relative mt-6 flex items-center justify-between border-t border-line pt-4 text-[12px] text-muted">
        <OdiaWord className="text-2xl text-brand" />
        <span>On call when a life needs you</span>
      </div>
    </div>
  )
}

function Check({ ok, label }) {
  const Icon = ok === false ? XCircle : CheckCircle
  return (
    <li className={`flex items-center gap-2 text-[14px] transition-colors ${ok === null ? 'text-muted' : ok ? 'text-ink' : 'text-blood'}`}>
      <Icon size={18} weight={ok === null ? 'regular' : 'fill'} className={ok === null ? 'text-muted' : ok ? 'text-brand' : 'text-blood'} />
      {label}
    </li>
  )
}

function RegisterForm() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    group: '',
    gender: '',
    age: '',
    weight: '',
    district: '',
    area: '',
    lastDonation: '',
    neverDonated: false,
    availability: 'Anytime',
    showOnWall: true,
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const { checks, failed, nextDate } = useEligibility({
    age: form.age === '' ? '' : Number(form.age),
    weight: form.weight === '' ? '' : Number(form.weight),
    gender: form.gender,
    lastDonation: form.lastDonation,
    neverDonated: form.neverDonated,
  })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.group || failed) return
    setStatus('sending')
    const lastDonation = form.neverDonated ? 'Never donated' : form.lastDonation
    const record = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      group: form.group,
      gender: form.gender,
      age: form.age,
      weight: form.weight,
      district: form.district,
      area: form.area.trim(),
      lastDonation,
      availability: form.availability,
      showOnWall: form.showOnWall,
    }
    try {
      await addDonor(record)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="register" className="container-x pb-24 sm:pb-32">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <div className="lg:sticky lg:top-28 lg:space-y-6">
            <DonorCard name={form.name} group={form.group} district={form.district} />
            <div className="mt-6 rounded-3xl border border-line bg-linen p-6 lg:mt-0">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-muted">Can you donate?</p>
              <ul className="mt-4 space-y-3">
                {checks.map((c) => <Check key={c.label} {...c} />)}
              </ul>
              {nextDate && (
                <p className="mt-4 rounded-xl bg-blood/10 px-4 py-3 text-[14px] text-blood">
                  You can donate again from <b>{nextDate}</b>. You can still register now.
                </p>
              )}
              <p className="mt-4 text-[13px] leading-relaxed text-muted">
                You should also be healthy on the day, with haemoglobin of at least 12.5 g/dL. Our team will confirm everything before you donate.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-[2rem] border border-line bg-linen p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] sm:p-10">
            <AnimatePresence mode="wait">
              {status === 'sent' ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="flex min-h-[560px] flex-col items-center justify-center text-center"
                >
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="grid h-24 w-24 place-items-center rounded-full bg-blood/10">
                    <Drop size={56} weight="fill" className="text-blood" />
                  </motion.span>
                  <h3 className="mt-8 font-display text-5xl">Thank you, {form.name.split(' ')[0]}!</h3>
                  <p className="mt-4 max-w-sm leading-relaxed text-muted">
                    You are now a registered <b className="text-ink">{form.group}</b> donor with Team Samarpita. When someone needs your blood group, our team will call you.
                  </p>
                  <Link to="/" className="mt-8 text-[14px] font-semibold underline underline-offset-4">Back to home</Link>
                </motion.div>
              ) : (
                <motion.form key="form" exit={{ opacity: 0 }} onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <h2 className="font-display text-4xl">Register as a donor</h2>
                    <p className="mt-2 text-[15px] text-muted">Takes one minute. Fields marked * are required.</p>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="label">Blood group *</span>
                    <div className="grid grid-cols-4 gap-2">
                      {GROUPS.map((g) => (
                        <button
                          type="button"
                          key={g}
                          onClick={() => setForm((f) => ({ ...f, group: g }))}
                          className={`relative rounded-2xl border py-4 font-display text-2xl transition-all duration-300 ${
                            form.group === g ? 'border-blood bg-blood text-white shadow-lg shadow-blood/30' : 'border-line bg-cream hover:border-blood/60'
                          }`}
                          aria-pressed={form.group === g}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label" htmlFor="b-name">Full name *</label>
                    <input id="b-name" required value={form.name} onChange={set('name')} className="field" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="label" htmlFor="b-phone">Phone number *</label>
                    <input id="b-phone" required type="tel" pattern="[0-9+\s-]{10,15}" value={form.phone} onChange={set('phone')} className="field" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="label" htmlFor="b-gender">Gender *</label>
                    <Select
                      id="b-gender"
                      name="gender"
                      required
                      value={form.gender}
                      onChange={(v) => setForm((f) => ({ ...f, gender: v }))}
                      options={['Male', 'Female', 'Other']}
                      placeholder="Select"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label" htmlFor="b-age">Age *</label>
                      <input id="b-age" required type="number" min="1" max="100" value={form.age} onChange={set('age')} className="field" placeholder="25" />
                    </div>
                    <div>
                      <label className="label" htmlFor="b-weight">Weight (kg) *</label>
                      <input id="b-weight" required type="number" min="1" max="250" value={form.weight} onChange={set('weight')} className="field" placeholder="60" />
                    </div>
                  </div>
                  <div>
                    <label className="label" htmlFor="b-district">District *</label>
                    <Select
                      id="b-district"
                      name="district"
                      required
                      value={form.district}
                      onChange={(v) => setForm((f) => ({ ...f, district: v }))}
                      options={DISTRICTS}
                      placeholder="Select district"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="b-area">City / Village *</label>
                    <input id="b-area" required value={form.area} onChange={set('area')} className="field" placeholder="Where do you live?" />
                  </div>
                  <div>
                    <label className="label" htmlFor="b-last">Last blood donation</label>
                    <input
                      id="b-last"
                      type="date"
                      max={new Date().toISOString().slice(0, 10)}
                      value={form.lastDonation}
                      onChange={set('lastDonation')}
                      disabled={form.neverDonated}
                      className="field disabled:opacity-50"
                    />
                    <label className="mt-2 flex items-center gap-2 text-[14px] text-muted">
                      <input type="checkbox" checked={form.neverDonated} onChange={set('neverDonated')} className="h-4 w-4 accent-[#e5383b]" />
                      I have never donated
                    </label>
                  </div>
                  <div>
                    <label className="label" htmlFor="b-email">Email</label>
                    <input id="b-email" type="email" value={form.email} onChange={set('email')} className="field" placeholder="Optional" />
                  </div>

                  <div className="sm:col-span-2">
                    <span className="label">When can we call you?</span>
                    <div className="flex flex-wrap gap-2">
                      {['Anytime', 'Daytime only', 'Weekends', 'Only emergencies'].map((a) => (
                        <button
                          type="button"
                          key={a}
                          onClick={() => setForm((f) => ({ ...f, availability: a }))}
                          className={`rounded-full border px-4 py-2 text-[14px] font-medium transition-colors ${
                            form.availability === a ? 'border-ink bg-ink text-cream' : 'border-line hover:border-ink'
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-start gap-3 text-[14px] text-muted sm:col-span-2">
                    <input type="checkbox" required className="mt-1 h-4 w-4 accent-[#e5383b]" />
                    <span>
                      I am in good health and agree to be contacted by Team Samarpita when blood is needed. I accept the{' '}
                      <Link to="/privacy-policy" className="font-semibold text-ink underline underline-offset-2">Privacy Policy</Link>.
                    </span>
                  </label>
                  <label className="-mt-2 flex items-start gap-3 text-[14px] text-muted sm:col-span-2">
                    <input type="checkbox" checked={form.showOnWall} onChange={set('showOnWall')} className="mt-1 h-4 w-4 accent-[#e5383b]" />
                    <span>After I donate, Samarpita may show my name, blood group and district on the Blood Heroes wall.</span>
                  </label>

                  {!form.group && status === 'tried' && (
                    <p className="text-[14px] text-blood sm:col-span-2">Please select your blood group.</p>
                  )}
                  {failed && (
                    <p className="flex items-center gap-2 rounded-xl bg-blood/10 px-4 py-3 text-[14px] text-blood sm:col-span-2">
                      <WarningCircle size={18} /> Based on your age or weight you may not be able to donate right now.
                    </p>
                  )}
                  {status === 'error' && (
                    <p className="flex items-center gap-2 rounded-xl bg-blood/10 px-4 py-3 text-[14px] text-blood sm:col-span-2">
                      <WarningCircle size={18} /> Something went wrong. Please try again or call {site.phone}.
                    </p>
                  )}

                  <div className="sm:col-span-2">
                    <Button
                      type="submit"
                      variant="blood"
                      disabled={status === 'sending' || failed}
                      onClick={() => !form.group && setStatus('tried')}
                    >
                      {status === 'sending' ? (
                        <span className="flex items-center gap-2"><CircleNotch className="animate-spin" /> Registering…</span>
                      ) : (
                        'Register as donor'
                      )}
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

function HowItWorks() {
  const steps = [
    { icon: UserPlus, title: 'Register once', text: 'Fill the form with your blood group, district and phone number.' },
    { icon: PhoneCall, title: 'We call when needed', text: 'When a patient near you needs your blood group, our team calls you directly.' },
    { icon: Heartbeat, title: 'Donate & save a life', text: 'We guide you to the hospital or blood bank and stay with you through the process.' },
  ]
  return (
    <section className="bg-linen py-24 sm:py-32">
      <div className="container-x">
        <span className="eyebrow">How it works</span>
        <SplitHeading lines={['Three steps to', 'becoming a *hero*']} className="mt-5 text-[clamp(2.75rem,5.5vw,5rem)]" />
        <Reveal className="mt-14 grid gap-4 md:grid-cols-3" stagger={0.12}>
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div data-reveal key={title} className="relative overflow-hidden rounded-[1.75rem] border border-line bg-cream p-8">
              <span className="absolute right-6 top-4 font-display text-8xl text-ink/[0.06]">{i + 1}</span>
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blood/10 text-blood">
                <Icon size={28} weight="duotone" />
              </span>
              <h3 className="mt-12 font-display text-3xl">{title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

function Compatibility() {
  const [g, setG] = useState('O+')
  return (
    <section className="container-x py-24 sm:py-32">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <span className="eyebrow">Blood group guide</span>
          <SplitHeading lines={['Who can you', '*help*?']} className="mt-5 text-[clamp(2.75rem,5.5vw,5rem)]" />
          <p className="mt-6 max-w-sm leading-relaxed text-muted">Pick a blood group to see who it can donate to and receive from (red blood cells).</p>
          <div className="mt-8 grid grid-cols-4 gap-2">
            {GROUPS.map((x) => (
              <button
                key={x}
                onClick={() => setG(x)}
                className={`rounded-2xl border py-4 font-display text-2xl transition-all ${g === x ? 'border-blood bg-blood text-white' : 'border-line hover:border-blood/60'}`}
              >
                {x}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4 lg:col-span-6 lg:col-start-7">
          {[
            { title: `${g} can donate to`, list: DONATE_TO[g] },
            { title: `${g} can receive from`, list: RECEIVE_FROM[g] },
          ].map((row) => (
            <div key={row.title} className="rounded-[1.75rem] border border-line bg-linen p-6 sm:p-8">
              <p className="font-display text-3xl">{row.title}</p>
              <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-8">
                {GROUPS.map((x) => {
                  const on = row.list.includes(x)
                  return (
                    <motion.span
                      key={x}
                      layout
                      animate={{ opacity: on ? 1 : 0.25, scale: on ? 1 : 0.92 }}
                      transition={{ duration: 0.35 }}
                      className={`grid aspect-square place-items-center rounded-xl text-[15px] font-bold ${on ? 'bg-blood text-white' : 'bg-sand text-muted'}`}
                    >
                      {x}
                    </motion.span>
                  )
                })}
              </div>
            </div>
          ))}
          {g === 'O-' && <p className="text-[14px] text-muted"><b className="text-ink">O-</b> is the universal donor. It can help anyone in an emergency.</p>}
          {g === 'AB+' && <p className="text-[14px] text-muted"><b className="text-ink">AB+</b> is the universal receiver. It can receive from every group.</p>}
        </div>
      </div>
    </section>
  )
}

function Eligibility() {
  const items = [
    { icon: Cake, title: '18 to 65 years', text: 'Healthy adults in this age group can donate.' },
    { icon: Barbell, title: '50 kg or more', text: 'Minimum body weight for a safe donation.' },
    { icon: CalendarCheck, title: '3 to 4 months gap', text: 'Men every 3 months, women every 4 months.' },
    { icon: FirstAidKit, title: 'Hb 12.5 g/dL+', text: 'Haemoglobin is checked before every donation.' },
  ]
  return (
    <section className="container-x pb-24 sm:pb-32">
      <Reveal className="grid gap-px overflow-hidden rounded-3xl bg-line sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <div data-reveal key={title} className="bg-cream p-8">
            <Icon size={32} weight="duotone" className="text-brand" />
            <h3 className="mt-8 font-display text-3xl">{title}</h3>
            <p className="mt-2 text-[15px] text-muted">{text}</p>
          </div>
        ))}
      </Reveal>
    </section>
  )
}

function Heroes() {
  const [heroes, setHeroes] = useState([])
  useEffect(() => {
    listHeroes().then(setHeroes).catch(() => {})
  }, [])
  if (!heroes.length) return null
  return (
    <section className="container-x pb-24 sm:pb-32">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <span className="eyebrow">Blood heroes</span>
          <SplitHeading lines={['With love &', '*gratitude*']} className="mt-5 text-[clamp(2.75rem,5.5vw,5rem)]" />
        </div>
        <p className="max-w-sm leading-relaxed text-muted">Every name here gave blood through Samarpita and helped save a life. Thank you.</p>
      </div>
      <Reveal className="mt-14 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
        {heroes.map((h) => (
          <div data-reveal key={h.id} className="transition-transform duration-500 hover:-translate-y-2">
            <ThankYouCard compact name={h.name} group={h.group} district={h.district} donatedAt={h.donatedAt} />
          </div>
        ))}
      </Reveal>
    </section>
  )
}

function NeedBlood() {
  return (
    <section className="container-x pb-24 sm:pb-32">
      <div className="relative overflow-hidden rounded-[2rem] bg-blood p-8 text-white sm:rounded-[3rem] sm:p-14">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,#fff,transparent)] opacity-15" />
        <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-white/80">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
              </span>
              Need blood urgently?
            </p>
            <h2 className="h-display mt-5 text-[clamp(2.5rem,5.5vw,5rem)]">Call Team Samarpita.<br />We’ll find a donor.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={`tel:${site.phoneRaw}`} className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-4 font-semibold text-blood transition-transform hover:-translate-y-0.5">
              <Phone size={20} weight="bold" /> {site.phone}
            </a>
            <a href={site.whatsappLink} className="inline-flex items-center gap-3 rounded-full border border-white/40 px-6 py-4 font-semibold transition-colors hover:bg-white hover:text-blood">
              <WhatsappLogo size={20} weight="bold" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

const faqs = [
  { q: 'Is donating blood safe?', a: 'Yes. Only sterile, single-use equipment is used. Your body replaces the donated blood within a few weeks.' },
  { q: 'How long does a donation take?', a: 'The donation itself takes about 10 minutes. With registration and rest, plan for around 45 minutes.' },
  { q: 'Will Samarpita share my number?', a: 'No. Your details stay with our team. We only call you when a patient needs your blood group.' },
  { q: 'Can I stop being a donor later?', a: `Of course. Just call or email us at ${site.email} and we will remove your details.` },
]

export default function BloodDonation() {
  return (
    <>
      <Seo title="Blood Donation" description="Register as a blood donor with Team Samarpita, Odisha. When a patient needs your blood group, our team calls you. Free registration, every group welcome." />
      <PageHero
        eyebrow="Blood donation"
        crumb="Blood Donation"
        lines={['Donate blood,', 'give *life*.']}
        text="Register once as a blood donor with Team Samarpita. Whenever a patient in Odisha needs your blood group, our team will call you."
      >
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="#register" variant="blood">Register now</Button>
          <Button href={`tel:${site.phoneRaw}`} variant="outline" icon={false}>
            <span className="flex items-center gap-2"><Phone weight="bold" /> Need blood? Call us</span>
          </Button>
        </div>
      </PageHero>
      <RegisterForm />
      <HowItWorks />
      <Compatibility />
      <Heroes />
      <Eligibility />
      <NeedBlood />
      <section className="container-x pb-24 sm:pb-36">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <span className="eyebrow">FAQ</span>
            <SplitHeading lines={['Donor', '*questions*']} className="mt-5 text-[clamp(2.5rem,4.5vw,4rem)]" />
          </div>
          <div className="lg:col-span-8">
            <Accordion items={faqs} />
          </div>
        </div>
      </section>
    </>
  )
}
