import { Link } from 'react-router-dom'
import { images } from '../data/site'

// Files in /public need the site's base path
export const asset = (path) => `${import.meta.env.BASE_URL}${path}`

export function LogoMark({ className = 'h-11 w-11', size = 96 }) {
  return (
    <img
      src={images.logo(size)}
      alt="Samarpita logo"
      width={size}
      height={size}
      className={`rounded-full bg-white object-contain shadow-sm ring-1 ring-black/5 ${className}`}
    />
  )
}

export default function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-3 text-ink" aria-label="Samarpita home">
      <LogoMark className="h-11 w-11 transition-transform duration-700 ease-[var(--ease-premium)] group-hover:rotate-[360deg]" />
      <span className="leading-none">
        <span className="block font-display text-[26px] tracking-tight">Samarpita</span>
        <span className="hidden text-[10px] font-semibold uppercase tracking-[0.24em] text-muted sm:block">Social Foundation Trust</span>
      </span>
    </Link>
  )
}
