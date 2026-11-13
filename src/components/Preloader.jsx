import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LogoMark } from './Logo'
import OdiaWord from './OdiaWord'
import { site } from '../data/site'
import { ScrollTrigger } from '../lib/gsap'
import { markReady } from '../lib/ready'

// Branded loading screen on first paint: logo, the Odia wordmark and a progress line.
// It waits for fonts and the window load event (at most MAX_MS), stays at least MIN_MS so it
// never flickers, then lifts away. Later page loads in the same tab get a much shorter version.

const MIN_MS = 1200
const MAX_MS = 3500
const KEY = 'samarpita-booted'
const ease = [0.76, 0, 0.24, 1]

export default function Preloader() {
  const [show, setShow] = useState(true)
  const [repeat] = useState(() => {
    try {
      return sessionStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    // The static shell in index.html did its job once React is here
    document.getElementById('boot')?.remove()
    const started = performance.now()
    const min = repeat ? 350 : MIN_MS
    const loaded = new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })))
    const fonts = document.fonts?.ready ?? Promise.resolve()
    const timeout = new Promise((r) => setTimeout(r, MAX_MS))
    let t
    Promise.race([Promise.all([loaded, fonts]), timeout]).then(() => {
      const wait = Math.max(0, min - (performance.now() - started))
      t = setTimeout(() => {
        setShow(false)
        markReady()
        try {
          sessionStorage.setItem(KEY, '1')
        } catch {}
      }, wait)
    })
    return () => clearTimeout(t)
  }, [repeat])

  // Keep the page from scrolling underneath while the loader is up
  useEffect(() => {
    document.documentElement.style.overflow = show ? 'hidden' : ''
    if (!show) requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          role="status"
          aria-label="Loading"
          className="theme-dark fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden bg-night text-cream"
          exit={{ y: '-100%', transition: { duration: 0.9, ease } }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(70,201,28,0.18),transparent_60%)]" />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <LogoMark size={192} className="h-20 w-20 shadow-[0_0_0_6px_rgba(247,196,8,0.25)] sm:h-24 sm:w-24" />
          </motion.div>
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-6 text-center"
          >
            <OdiaWord className="text-[clamp(3rem,10vw,5.5rem)] leading-none text-brand" />
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-cream/60">{site.tagline}</p>
          </motion.div>
          {/* Progress line: fills over the minimum time, then snaps to full as the loader leaves */}
          <div className="absolute bottom-0 left-0 h-[3px] w-full bg-cream/10">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: (repeat ? 350 : MIN_MS) / 1000, ease: 'easeInOut' }}
              className="h-full w-full origin-left bg-[linear-gradient(90deg,#46c91c,#f7c408)]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
