import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { toPng } from 'html-to-image'
import {
  Drop,
  Phone,
  WhatsappLogo,
  MagnifyingGlass,
  DownloadSimple,
  Trash,
  Star,
  SignOut,
  Heart,
  X,
  UsersThree,
  ChatCircleText,
  ArrowsClockwise,
  Eye,
  EyeSlash,
  EyeClosed,
  LockKey,
  ArrowSquareOut,
  ShieldCheck,
  Info,
  Envelope,
  EnvelopeOpen,
  Tray,
  Siren,
} from '@phosphor-icons/react'
import ThankYouCard from '../components/ThankYouCard'
import ThemeToggle from '../components/ThemeToggle'
import Select from '../components/Select'
import { LogoMark } from '../components/Logo'
import {
  signIn,
  signOut,
  currentAdmin,
  changePassword,
  listDonors,
  updateDonor,
  deleteDonor,
  listFeedback,
  updateFeedback,
  deleteFeedback,
  listMessages,
  updateMessage,
  deleteMessage,
} from '../lib/store'

/*
  Samarpita admin panel: a separate page (admin.html) from the public website.
  Sign-in is email + password against the API; the session is an httpOnly cookie,
  and the panel signs itself out after IDLE_MINUTES without any activity.
*/

const IDLE_MINUTES = 30
const GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const STATUSES = {
  registered: { label: 'Registered', cls: 'bg-sand text-ink' },
  contacted: { label: 'Contacted', cls: 'bg-royal/15 text-royal dark:text-[#7fb2ff]' },
  donated: { label: 'Donated', cls: 'bg-brand-soft text-brand' },
  inactive: { label: 'Inactive', cls: 'bg-blood/10 text-blood' },
}
const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not given')
const telLink = (p) => `tel:${String(p).replace(/[^\d+]/g, '')}`
const waLink = (p, text) => {
  let n = String(p).replace(/\D/g, '')
  if (n.length === 10) n = '91' + n
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}
const siteUrl = import.meta.env.BASE_URL

function PasswordField({ id, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="field pr-12"
      />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
        {show ? <EyeClosed size={20} /> : <Eye size={20} />}
      </button>
    </div>
  )
}

function Login({ onDone }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      onDone(await signIn(email, pw))
    } catch (x) {
      setErr(x.message || 'Could not sign in.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="container-x grid min-h-screen place-items-center py-16">
      <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-line bg-linen p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] sm:p-10">
        <LogoMark className="mx-auto h-20 w-20" size={192} />
        <h1 className="mt-6 text-center font-display text-5xl">Admin</h1>
        <p className="mt-2 text-center text-muted">Blood donors &amp; feedback</p>
        <label className="label mt-8" htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required autoFocus className="field" placeholder="you@example.com" />
        <label className="label mt-4" htmlFor="password">Password</label>
        <PasswordField id="password" value={pw} onChange={setPw} autoComplete="current-password" placeholder="Your password" />
        {err && <p className="mt-4 rounded-xl bg-blood/10 px-4 py-3 text-[14px] text-blood">{err}</p>}
        <button type="submit" disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 font-semibold text-cream disabled:opacity-60">
          <LockKey weight="bold" /> {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="mt-6 flex items-start gap-2 text-[12px] leading-relaxed text-muted">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand" />
          Only for the Samarpita team. Five wrong passwords lock the account for 15 minutes. Forgot your password? Ask the site admin to reset it.
        </p>
        <a href={siteUrl} className="mt-4 block text-center text-[13px] font-semibold text-muted hover:text-ink">← Back to website</a>
      </form>
    </main>
  )
}

function CardModal({ donor, onClose }) {
  const ref = useRef(null)
  const [busy, setBusy] = useState(false)
  const download = async () => {
    setBusy(true)
    try {
      const url = await toPng(ref.current, { pixelRatio: 2, cacheBust: true })
      const a = document.createElement('a')
      a.href = url
      a.download = `samarpita-thank-you-${donor.name.replace(/\s+/g, '-').toLowerCase()}.png`
      a.click()
    } finally {
      setBusy(false)
    }
  }
  const msg = `Dear ${donor.name}, thank you for donating ${donor.group} blood and giving the gift of life. With gratitude, Samarpita Social Foundation Trust`
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-night/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ y: 40, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[520px]"
      >
        <button onClick={onClose} aria-label="Close" className="absolute -right-2 -top-12 grid h-10 w-10 place-items-center rounded-full bg-cream text-ink">
          <X weight="bold" />
        </button>
        <ThankYouCard ref={ref} name={donor.name} group={donor.group} district={donor.district} donatedAt={donor.donatedAt || new Date().toISOString()} />
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button onClick={download} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 font-semibold text-night disabled:opacity-60">
            <DownloadSimple weight="bold" /> {busy ? 'Preparing…' : 'Download card'}
          </button>
          <a href={waLink(donor.phone, msg)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-mint px-5 py-3 font-semibold text-night">
            <WhatsappLogo weight="bold" /> Send thanks on WhatsApp
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Donors({ onAuthError }) {
  const [rows, setRows] = useState(null)
  const [q, setQ] = useState('')
  const [group, setGroup] = useState('')
  const [district, setDistrict] = useState('')
  const [status, setStatus] = useState('')
  const [card, setCard] = useState(null)
  const [err, setErr] = useState('')

  const guard = (p) =>
    p.catch((e) => {
      if (e.status === 401) onAuthError()
      else setErr(e.message)
    })
  const load = () => guard(listDonors().then(setRows)).then(() => setRows((r) => r || []))
  useEffect(() => {
    load()
  }, [])

  const districts = useMemo(() => [...new Set((rows || []).map((r) => r.district).filter(Boolean))].sort(), [rows])
  const filtered = useMemo(
    () =>
      (rows || []).filter(
        (r) =>
          (!group || r.group === group) &&
          (!district || r.district === district) &&
          (!status || r.status === status) &&
          (!q || `${r.name} ${r.phone} ${r.area}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [rows, q, group, district, status],
  )

  const patch = (r, p) => {
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, ...p } : x)))
    return guard(updateDonor(r.id, p))
  }
  const changeStatus = async (r, s) => {
    const p = { status: s, ...(s === 'donated' && !r.donatedAt ? { donatedAt: new Date().toISOString() } : {}) }
    await patch(r, p)
    if (s === 'donated') setCard({ ...r, ...p })
  }
  const toggleWall = (r) => patch(r, { showOnWall: !r.showOnWall })
  const remove = (r) => {
    if (!confirm(`Delete ${r.name}? This cannot be undone.`)) return
    setRows((rs) => rs.filter((x) => x.id !== r.id))
    guard(deleteDonor(r.id))
  }
  const exportCsv = () => {
    const cols = ['name', 'group', 'phone', 'email', 'gender', 'age', 'weight', 'district', 'area', 'lastDonation', 'availability', 'status', 'donatedAt', 'createdAt']
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const csv = [cols.join(','), ...filtered.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `samarpita-donors-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }
  const counts = useMemo(() => Object.fromEntries(GROUPS.map((g) => [g, (rows || []).filter((r) => r.group === g).length])), [rows])

  return (
    <div>
      {err && <p className="mb-4 rounded-xl bg-blood/10 px-4 py-3 text-[14px] text-blood">{err}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Total donors', rows?.length ?? '…'],
          ['Donated', rows?.filter((r) => r.status === 'donated').length ?? '…'],
          ['Contacted', rows?.filter((r) => r.status === 'contacted').length ?? '…'],
          ['New', rows?.filter((r) => r.status === 'registered').length ?? '…'],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-line bg-linen p-5">
            <p className="font-display text-5xl leading-none">{v}</p>
            <p className="mt-2 text-[13px] text-muted">{l}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setGroup('')} className={`rounded-full border px-4 py-2 text-[14px] font-semibold ${!group ? 'border-ink bg-ink text-cream' : 'border-line'}`}>
          All groups
        </button>
        {GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setGroup(group === g ? '' : g)}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-[14px] font-semibold ${group === g ? 'border-blood bg-blood text-white' : 'border-line'}`}
          >
            <Drop weight="fill" className={group === g ? 'text-white' : 'text-blood'} /> {g}
            <span className="opacity-60">{counts[g]}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto_auto]">
        <label className="relative">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone or area" className="field pl-11" />
        </label>
        <Select
          aria-label="District"
          value={district}
          onChange={setDistrict}
          options={[{ value: '', label: 'All districts' }, ...districts]}
          className="min-w-[11rem]"
        />
        <Select
          aria-label="Status"
          value={status}
          onChange={setStatus}
          options={[{ value: '', label: 'Any status' }, ...Object.entries(STATUSES).map(([k, v]) => ({ value: k, label: v.label }))]}
          className="min-w-[10rem]"
        />
        <button onClick={load} className="field flex items-center justify-center gap-2 font-semibold" aria-label="Refresh"><ArrowsClockwise /></button>
        <button onClick={exportCsv} className="flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-4 text-[14px] font-semibold text-cream">
          <DownloadSimple weight="bold" /> CSV
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {rows === null && <p className="text-muted">Loading…</p>}
        {rows && filtered.length === 0 && <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">No donors match these filters.</p>}
        {filtered.map((r) => (
          <motion.div layout key={r.id} className="grid gap-4 rounded-2xl border border-line bg-linen p-4 sm:p-5 lg:grid-cols-[auto_1.4fr_1fr_auto] lg:items-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[radial-gradient(circle_at_30%_30%,#ff6b6e,#b3141a)] font-display text-2xl text-white">{r.group}</span>
            <div className="min-w-0">
              <p className="truncate font-display text-2xl">{r.name}</p>
              <p className="text-[13px] text-muted">{[r.gender, r.age && `${r.age} yrs`, r.weight && `${r.weight} kg`].filter(Boolean).join(' · ')}</p>
              <p className="text-[13px] text-muted">{[r.area, r.district].filter(Boolean).join(', ')}</p>
            </div>
            <div className="text-[13px] leading-relaxed text-muted">
              <p><b className="text-ink">Last donation:</b> {r.lastDonation || 'Not given'}</p>
              <p><b className="text-ink">Call:</b> {r.availability || 'Not given'}</p>
              <p><b className="text-ink">Registered:</b> {fmt(r.createdAt)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <Select
                aria-label="Status"
                variant="pill"
                value={r.status || 'registered'}
                onChange={(v) => changeStatus(r, v)}
                options={Object.entries(STATUSES).map(([k, v]) => ({ value: k, label: v.label }))}
                triggerClassName={STATUSES[r.status || 'registered'].cls}
              />
              <a href={telLink(r.phone)} title={r.phone} className="grid h-10 w-10 place-items-center rounded-full bg-ink text-cream"><Phone weight="bold" /></a>
              <a href={waLink(r.phone)} target="_blank" rel="noreferrer" title="WhatsApp" className="grid h-10 w-10 place-items-center rounded-full bg-mint text-night"><WhatsappLogo weight="bold" /></a>
              <button onClick={() => setCard(r)} title="Thank-you card" className="grid h-10 w-10 place-items-center rounded-full bg-gold text-night"><Heart weight="fill" /></button>
              <button onClick={() => toggleWall(r)} title={r.showOnWall ? 'Shown on heroes wall (after donating)' : 'Hidden from heroes wall'} className="grid h-10 w-10 place-items-center rounded-full border border-line">
                {r.showOnWall ? <Eye /> : <EyeSlash className="text-muted" />}
              </button>
              <button onClick={() => remove(r)} title="Delete" className="grid h-10 w-10 place-items-center rounded-full border border-line text-blood"><Trash /></button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>{card && <CardModal donor={card} onClose={() => setCard(null)} />}</AnimatePresence>
    </div>
  )
}

function Feedback({ onAuthError }) {
  const [rows, setRows] = useState(null)
  const guard = (p) => p.catch((e) => (e.status === 401 ? onAuthError() : null))
  useEffect(() => {
    guard(listFeedback().then(setRows)).then(() => setRows((r) => r || []))
  }, [])
  const toggle = (f) => {
    setRows((rs) => rs.map((x) => (x.id === f.id ? { ...x, featured: !f.featured } : x)))
    guard(updateFeedback(f.id, { featured: !f.featured }))
  }
  const remove = (f) => {
    if (!confirm('Delete this feedback?')) return
    setRows((rs) => rs.filter((x) => x.id !== f.id))
    guard(deleteFeedback(f.id))
  }
  if (rows === null) return <p className="text-muted">Loading…</p>
  if (!rows.length) return <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">No feedback yet.</p>
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rows.map((f) => (
        <div key={f.id} className="flex flex-col rounded-2xl border border-line bg-linen p-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-0.5 text-gold">{[1, 2, 3, 4, 5].map((n) => <Star key={n} weight={n <= f.rating ? 'fill' : 'regular'} />)}</div>
            <span className="text-[12px] text-muted">{fmt(f.createdAt)}</span>
          </div>
          <p className="mt-4 flex-1 leading-relaxed">“{f.message}”</p>
          <p className="mt-4 text-[14px]"><b>{f.name}</b>{f.place && <span className="text-muted"> · {f.place}</span>}</p>
          <div className="mt-4 flex gap-2">
            <button onClick={() => toggle(f)} className={`rounded-full px-4 py-2 text-[13px] font-semibold ${f.featured ? 'bg-brand text-cream' : 'border border-line'}`}>
              {f.featured ? 'Shown on website' : 'Show on website'}
            </button>
            <button onClick={() => remove(f)} className="grid h-9 w-9 place-items-center rounded-full border border-line text-blood" aria-label="Delete"><Trash /></button>
          </div>
        </div>
      ))}
    </div>
  )
}

// Problems sent from the Contact page and volunteer sign-ups from Support
function Messages({ onAuthError }) {
  const [rows, setRows] = useState(null)
  const [kind, setKind] = useState('all') // all | problem | volunteer
  const [open, setOpen] = useState(null)
  const guard = (p) => p.catch((e) => (e.status === 401 ? onAuthError() : null))
  const load = () => guard(listMessages().then(setRows)).then(() => setRows((r) => r || []))
  useEffect(() => {
    load()
  }, [])
  const list = (rows || []).filter((m) => kind === 'all' || m.type === kind)
  const unread = (rows || []).filter((m) => !m.read).length
  const toggleRead = (m, read = !m.read) => {
    setRows((rs) => rs.map((x) => (x.id === m.id ? { ...x, read } : x)))
    guard(updateMessage(m.id, { read }))
  }
  const openOne = (m) => {
    setOpen(open === m.id ? null : m.id)
    if (!m.read) toggleRead(m, true)
  }
  const remove = (m) => {
    if (!confirm('Delete this message?')) return
    setRows((rs) => rs.filter((x) => x.id !== m.id))
    guard(deleteMessage(m.id))
  }
  const detail = (m) =>
    m.type === 'problem'
      ? [
          ['Category', m.category],
          ['Urgency', m.urgency],
          ['City / Village', m.city],
          ['Email', m.email],
          ['Attachment', m.attachmentNote],
        ]
      : [
          ['Area of interest', m.interest],
          ['Availability', m.availability],
          ['City / Village', m.city],
          ['Email', m.email],
        ]
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {[
          ['all', 'All'],
          ['problem', 'Problems'],
          ['volunteer', 'Volunteers'],
        ].map(([k, l]) => (
          <button key={k} onClick={() => setKind(k)} className={`rounded-full border px-4 py-2 text-[14px] font-semibold ${kind === k ? 'border-ink bg-ink text-cream' : 'border-line'}`}>
            {l}
          </button>
        ))}
        <span className="ml-auto text-[13px] text-muted">{unread ? `${unread} unread` : 'All read'}</span>
        <button onClick={load} className="grid h-10 w-10 place-items-center rounded-full border border-line" aria-label="Refresh"><ArrowsClockwise /></button>
      </div>
      <div className="mt-6 space-y-3">
        {rows === null && <p className="text-muted">Loading…</p>}
        {rows && list.length === 0 && (
          <p className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-line p-10 text-center text-muted"><Tray /> No messages yet.</p>
        )}
        {list.map((m) => (
          <motion.div layout key={m.id} className={`rounded-2xl border bg-linen p-4 sm:p-5 ${m.read ? 'border-line' : 'border-brand/60 shadow-[0_0_0_3px_rgba(42,138,18,0.08)]'}`}>
            <button onClick={() => openOne(m)} className="grid w-full gap-3 text-left sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${m.type === 'problem' ? (m.urgency === 'Urgent' ? 'bg-blood text-white' : 'bg-brand-soft text-brand') : 'bg-gold/20 text-night dark:text-gold'}`}>
                {m.type === 'problem' ? (m.urgency === 'Urgent' ? <Siren weight="fill" /> : <ChatCircleText weight="duotone" />) : <UsersThree weight="duotone" />}
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <b className="truncate font-display text-2xl font-normal">{m.name}</b>
                  <span className="rounded-full bg-sand px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{m.type === 'problem' ? 'Problem' : 'Volunteer'}</span>
                  {m.type === 'problem' && m.urgency === 'Urgent' && <span className="rounded-full bg-blood/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-blood">Urgent</span>}
                  {!m.read && <span className="h-2 w-2 rounded-full bg-brand" aria-label="Unread" />}
                </span>
                <span className="mt-1 block truncate text-[14px] text-muted">{m.type === 'problem' ? m.subject : [m.interest, m.availability].filter(Boolean).join(' · ') || 'Wants to volunteer'}</span>
              </span>
              <span className="text-[12px] text-muted sm:text-right">{fmt(m.createdAt)}</span>
            </button>
            <AnimatePresence initial={false}>
              {open === m.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-4 border-t border-line pt-4">
                    {m.message && <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>}
                    <dl className="mt-4 grid gap-x-6 gap-y-1 text-[13px] sm:grid-cols-2">
                      {detail(m)
                        .filter(([, v]) => v)
                        .map(([k, v]) => (
                          <div key={k} className="flex gap-2"><dt className="shrink-0 font-semibold text-ink">{k}:</dt><dd className="min-w-0 break-words text-muted">{v}</dd></div>
                        ))}
                    </dl>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <a href={telLink(m.phone)} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-cream"><Phone weight="bold" /> {m.phone}</a>
                      <a href={waLink(m.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2.5 text-[13px] font-semibold text-night"><WhatsappLogo weight="bold" /> WhatsApp</a>
                      {m.email && <a href={`mailto:${m.email}`} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-[13px] font-semibold"><Envelope weight="bold" /> Email</a>}
                      <button onClick={() => toggleRead(m)} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-[13px] font-semibold">
                        {m.read ? <><Envelope /> Mark unread</> : <><EnvelopeOpen /> Mark read</>}
                      </button>
                      <button onClick={() => remove(m)} className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-line text-blood" aria-label="Delete"><Trash /></button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function Security({ email, onPasswordChanged }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [again, setAgain] = useState('')
  const [msg, setMsg] = useState(null) // { ok, text }
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    if (next !== again) return setMsg({ ok: false, text: 'The new passwords do not match.' })
    setBusy(true)
    setMsg(null)
    try {
      await changePassword(current, next)
      setMsg({ ok: true, text: 'Password changed. Please sign in again with the new password.' })
      setTimeout(onPasswordChanged, 1800)
    } catch (x) {
      setMsg({ ok: false, text: x.message })
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={submit} className="rounded-2xl border border-line bg-linen p-6 sm:p-8">
        <h2 className="font-display text-3xl">Change password</h2>
        <p className="mt-1 text-[14px] text-muted">Signed in as <b className="text-ink">{email}</b></p>
        <label className="label mt-6" htmlFor="cur">Current password</label>
        <PasswordField id="cur" value={current} onChange={setCurrent} autoComplete="current-password" />
        <label className="label mt-4" htmlFor="new">New password</label>
        <PasswordField id="new" value={next} onChange={setNext} autoComplete="new-password" placeholder="At least 10 characters, letters and numbers" />
        <label className="label mt-4" htmlFor="again">Repeat new password</label>
        <PasswordField id="again" value={again} onChange={setAgain} autoComplete="new-password" />
        {msg && <p className={`mt-4 rounded-xl px-4 py-3 text-[14px] ${msg.ok ? 'bg-brand-soft text-brand' : 'bg-blood/10 text-blood'}`}>{msg.text}</p>}
        <button type="submit" disabled={busy} className="mt-6 rounded-full bg-ink px-6 py-3.5 font-semibold text-cream disabled:opacity-60">{busy ? 'Saving…' : 'Update password'}</button>
      </form>
      <div className="rounded-2xl border border-line bg-linen p-6 text-[14px] leading-relaxed text-muted sm:p-8">
        <h2 className="font-display text-3xl text-ink">How your data is protected</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Passwords are stored only as bcrypt hashes; nobody can read them back.</li>
          <li>Your session is a signed token in an httpOnly cookie that page scripts cannot read. It expires after 8 hours, and this page signs out after {IDLE_MINUTES} minutes without activity.</li>
          <li>Five wrong passwords lock the account for 15 minutes, and sign-in attempts are rate limited.</li>
          <li>Donor details (phone, email) are only ever sent to signed-in admins. The public heroes wall shows name, blood group and district only.</li>
          <li>To add or reset an admin, run <code className="rounded bg-sand px-1.5 py-0.5 text-ink">npm run admin</code> on the server project (see README).</li>
        </ul>
      </div>
    </div>
  )
}

export default function AdminApp() {
  const [admin, setAdmin] = useState(undefined) // undefined = checking, null = signed out
  const [tab, setTab] = useState('messages')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    currentAdmin().then(setAdmin).catch(() => setAdmin(null))
  }, [])

  const leave = async (text = '') => {
    try {
      await signOut()
    } catch {}
    setAdmin(null)
    setNotice(text)
  }

  // Auto sign-out after a stretch with no clicks, keys or scrolling
  useEffect(() => {
    if (!admin) return
    let t
    const arm = () => {
      clearTimeout(t)
      t = setTimeout(() => leave(`Signed out after ${IDLE_MINUTES} minutes of inactivity.`), IDLE_MINUTES * 60000)
    }
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, arm, { passive: true }))
    arm()
    return () => {
      clearTimeout(t)
      events.forEach((e) => window.removeEventListener(e, arm))
    }
  }, [admin])

  if (admin === undefined) return <main className="min-h-screen" />
  if (!admin) {
    return (
      <>
        {notice && (
          <p className="fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3 text-[14px] text-cream shadow-xl">
            <Info /> {notice}
          </p>
        )}
        <Login
          onDone={(a) => {
            setNotice('')
            setAdmin(a)
          }}
        />
      </>
    )
  }

  const onAuthError = () => leave('Your session has expired. Please sign in again.')

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
        <div className="container-x flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoMark size={96} className="h-11 w-11" />
            <div className="leading-tight">
              <p className="font-display text-2xl">Samarpita</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Admin panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={siteUrl} target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-full border border-line px-4 py-3 text-[14px] font-semibold sm:inline-flex">
              <ArrowSquareOut /> Website
            </a>
            <ThemeToggle />
            <button onClick={() => leave()} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-3 text-[14px] font-semibold">
              <SignOut /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container-x pb-24 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Signed in as {admin.email}</span>
            <h1 className="h-display mt-3 text-[clamp(2.75rem,6vw,4.5rem)]">Dashboard</h1>
          </div>
        </div>
        <div className="relative mt-8 inline-grid grid-cols-2 rounded-full bg-sand p-1.5 sm:grid-cols-4">
          {[
            ['messages', 'Messages', Tray],
            ['donors', 'Blood donors', UsersThree],
            ['feedback', 'Feedback', ChatCircleText],
            ['security', 'Security', LockKey],
          ].map(([k, l, Icon]) => (
            <button key={k} onClick={() => setTab(k)} className="relative z-10 flex items-center gap-2 rounded-full px-4 py-3 text-[14px] font-semibold sm:px-5">
              {tab === k && <motion.span layoutId="admintab" className="absolute inset-0 -z-10 rounded-full bg-ink" />}
              <Icon className={tab === k ? 'text-cream' : ''} /> <span className={tab === k ? 'text-cream' : 'text-ink/70'}>{l}</span>
            </button>
          ))}
        </div>
        <div className="mt-8">
          {tab === 'messages' && <Messages onAuthError={onAuthError} />}
          {tab === 'donors' && <Donors onAuthError={onAuthError} />}
          {tab === 'feedback' && <Feedback onAuthError={onAuthError} />}
          {tab === 'security' && <Security email={admin.email} onPasswordChanged={() => leave('Password changed. Sign in with your new password.')} />}
        </div>
      </main>
    </>
  )
}
