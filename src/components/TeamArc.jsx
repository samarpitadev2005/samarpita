import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import ArcGallery from '../ApexUI-Kit/ArcGallery/ArcGallery'
import SplitHeading from './SplitHeading'
import JhotiPattern from './JhotiPattern'
import { team, images } from '../data/site'

// Team photos on a half wheel (ApexUI arc gallery in radius mode) that turns around a
// mandala motif. It drifts on its own, pauses on hover, and can be dragged, flicked
// or stepped with the arrows below. Each card carries the member's name and role.

const items = team.map((m) => ({ image: m.photo, text: m.name, subtext: m.role }))

// Wheel radius: wide enough for a proper semicircle, never so big the section gets tall
const radius = ({ w, spacing }) => Math.max(w * 0.4, spacing * 1.55)

export default function TeamArc() {
  const api = useRef(null)
  const [active, setActive] = useState(0)
  const current = team[active] || team[0]

  return (
    <section className="relative overflow-hidden bg-linen py-24 sm:py-32">
      {/* Faint jhoti chita pattern behind everything, fading out around the arc so the cards stay clean */}
      <JhotiPattern className="pointer-events-none absolute inset-0 h-full w-full text-brand opacity-[0.11] [mask-image:radial-gradient(ellipse_55%_60%_at_50%_72%,transparent_30%,black_80%)] dark:opacity-[0.16]" />
      <div className="container-x relative">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="eyebrow">Meet the team</span>
            <SplitHeading lines={['The faces behind', 'the *seva*']} className="mt-5 text-[clamp(2.75rem,5.5vw,5rem)]" />
          </div>
          <p className="max-w-sm leading-relaxed text-muted">
            Volunteers, coordinators and friends who give their time so that nobody in Odisha has to face a problem alone.
          </p>
        </div>
      </div>

      {/* Full-bleed wheel so the arc runs edge to edge */}
      <ArcGallery
        items={items}
        apiRef={api}
        onChange={setActive}
        radius={radius}
        cardText
        showTitles={false}
        cardWidth={0.19}
        minCardWidth={132}
        maxCardWidth={250}
        aspectRatio={0.78}
        gap={0.36}
        cornerRadius={0.07}
        autoScroll={34}
        fadeEdges={0}
        topPadding={28}
        className="relative mt-14 focus-visible:ring-brand/40"
      >
        {/* Mandala sits inside the arc, a little above the wheel centre so it reads as the middle of the bowl.
            --arc-cx / --arc-cy / --arc-inner come from ArcGallery (inner = radius minus half a card).
            The JPEG has a white background: multiply hides it on light, invert+screen on dark. */}
        <div
          className="absolute"
          style={{
            width: 'calc(var(--arc-inner, 300px) * 1.04)',
            height: 'calc(var(--arc-inner, 300px) * 1.04)',
            left: 'calc(var(--arc-cx, 50%) - var(--arc-inner, 300px) * 0.52)',
            top: 'calc(var(--arc-cy, 100%) - var(--arc-inner, 300px) * 1.02)',
          }}
        >
          <div className="absolute inset-[-10%] rounded-full bg-[radial-gradient(closest-side,rgba(247,196,8,0.22),transparent)]" />
          <img
            src={images.mandala}
            alt=""
            draggable={false}
            className="relative h-full w-full mix-blend-multiply motion-reduce:animate-none animate-[spin_240s_linear_infinite] dark:invert dark:hue-rotate-180 dark:mix-blend-screen"
          />
        </div>
      </ArcGallery>

      {/* Name of whoever is at the top of the arc right now */}
      <div className="container-x relative mt-8 flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="relative min-h-[64px] sm:min-h-[72px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-display text-4xl sm:text-5xl">{current.name}</p>
              <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.22em] text-brand">{current.role}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => api.current?.step(-1)}
            aria-label="Previous member"
            className="grid h-12 w-12 place-items-center rounded-full border border-ink/15 transition-colors hover:bg-ink hover:text-cream"
          >
            <ArrowLeft />
          </button>
          <span className="text-[13px] tabular-nums text-muted">
            {String(active + 1).padStart(2, '0')} / {String(team.length).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={() => api.current?.step(1)}
            aria-label="Next member"
            className="grid h-12 w-12 place-items-center rounded-full border border-ink/15 transition-colors hover:bg-ink hover:text-cream"
          >
            <ArrowRight />
          </button>
        </div>
      </div>
    </section>
  )
}
