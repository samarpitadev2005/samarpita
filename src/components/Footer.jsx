import { Link } from 'react-router-dom'
import { FacebookLogo, InstagramLogo, YoutubeLogo, WhatsappLogo, ArrowUp, EnvelopeSimple, Phone, MapPin } from '@phosphor-icons/react'
import { LogoMark } from './Logo'
import { nav, site } from '../data/site'
import { scrollToTop } from '../lib/lenis'
import OdiaWord from './OdiaWord'

const socials = [
  { icon: FacebookLogo, href: site.socials.facebook, label: 'Facebook' },
  { icon: InstagramLogo, href: site.socials.instagram, label: 'Instagram' },
  { icon: YoutubeLogo, href: site.socials.youtube, label: 'YouTube' },
  { icon: WhatsappLogo, href: site.socials.whatsapp, label: 'WhatsApp' },
]

export default function Footer() {
  return (
    <footer className="theme-dark relative overflow-hidden bg-[linear-gradient(180deg,#0b3318_0%,#06200f_70%,#041509_100%)]">
      <div className="h-1.5 bg-[linear-gradient(90deg,#46c91c,#f7c408_50%,#0a4f9f)]" />
      <div className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(70,201,28,0.25),transparent)]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(247,196,8,0.12),transparent)]" />
      <div className="container-x relative pt-20 sm:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-5">
              <LogoMark size={192} className="h-24 w-24 shadow-[0_0_0_4px_rgba(247,196,8,0.35)]" />
              <div>
                <p className="font-display text-4xl leading-none">Samarpita</p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">Social Foundation Trust</p>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-ink/70">
              A team of social workers from Odisha dedicated to supporting anyone in need, with compassion, honesty and dignity.
            </p>
            <div className="mt-8 flex gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 text-ink/80 transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:bg-gold hover:text-night"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h4 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.22em] text-gold">Explore</h4>
              <ul className="space-y-3">
                {nav.map((n) => (
                  <li key={n.to}>
                    <Link to={n.to} className="text-ink/80 transition-colors hover:text-brand">{n.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.22em] text-gold">Legal</h4>
              <ul className="space-y-3">
                <li><Link to="/privacy-policy" className="text-ink/80 transition-colors hover:text-brand">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-ink/80 transition-colors hover:text-brand">Terms &amp; Conditions</Link></li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h4 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.22em] text-gold">Reach us</h4>
              <ul className="space-y-4 text-[14px] text-ink/80">
                <li className="flex gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-brand" />{site.address}</li>
                <li className="flex gap-3">
                  <Phone size={18} className="mt-0.5 shrink-0 text-brand" />
                  <span className="flex flex-col gap-1.5">
                    {site.phones.map((p) => (
                      <a key={p.raw} href={`tel:${p.raw}`} className="hover:text-brand">{p.number}</a>
                    ))}
                  </span>
                </li>
                <li className="flex gap-3"><EnvelopeSimple size={18} className="mt-0.5 shrink-0 text-brand" /><a href={`mailto:${site.email}`} className="hover:text-brand">{site.email.split('@')[0]}@<wbr />{site.email.split('@')[1]}</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pointer-events-none mt-16 select-none text-center leading-[1.1] text-gold opacity-25">
          <OdiaWord className="text-[30vw] lg:text-[19rem]" />
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-ink/10 py-8 text-[13px] text-ink/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Samarpita Social Foundation Trust. All rights reserved. Made with 💚 in Odisha.</p>
          <button onClick={() => scrollToTop(false)} className="group flex items-center gap-2 transition-colors hover:text-ink">
            Back to top
            <span className="grid h-8 w-8 place-items-center rounded-full border border-ink/20 transition-transform group-hover:-translate-y-1">
              <ArrowUp size={14} />
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}
