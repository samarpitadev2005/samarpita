import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
// Mobile address-bar show/hide resizes the viewport; don't recalculate (and jump) on that
ScrollTrigger.config({ ignoreMobileResize: true })

// Sections that size themselves after mount (the WebGL team gallery, late fonts and images)
// change the page height after ScrollTrigger has measured it, which shifts every pinned or
// scrubbed section below them. Re-measure whenever the document's height actually changes.
if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
  let lastHeight = 0
  let timer = 0
  const ro = new ResizeObserver(() => {
    const h = document.documentElement.scrollHeight
    if (Math.abs(h - lastHeight) < 2) return
    lastHeight = h
    clearTimeout(timer)
    timer = setTimeout(() => ScrollTrigger.refresh(), 120)
  })
  ro.observe(document.body)

  // Belt and braces: late fonts, images and the gallery's own sizing all land within the first
  // seconds after load, so re-measure a few times then too, and once the web fonts are in.
  const settle = () => [400, 1200, 3000].forEach((ms) => setTimeout(() => ScrollTrigger.refresh(), ms))
  if (document.readyState === 'complete') settle()
  else window.addEventListener('load', settle, { once: true })
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
}

// Handy in the browser console during development (not included in production builds)
if (import.meta.env.DEV) window.__ScrollTrigger = ScrollTrigger

export { gsap, ScrollTrigger }
