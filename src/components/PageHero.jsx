import { Link } from 'react-router-dom'
import { CaretRight } from '@phosphor-icons/react'
import SplitHeading from './SplitHeading'
import { motion } from 'framer-motion'
import { useAppReady } from '../lib/ready'

// Shared header for inner pages
export default function PageHero({ eyebrow, crumb, lines, text, children }) {
  const ready = useAppReady()
  return (
    <section className="relative overflow-hidden pb-16 pt-36 sm:pb-24 sm:pt-44">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,var(--c-brand),transparent)] opacity-15" />
      <div className="container-x relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 flex items-center gap-2 text-[13px] text-muted"
        >
          <Link to="/" className="hover:text-ink">Home</Link>
          <CaretRight size={12} />
          <span className="text-ink">{crumb}</span>
        </motion.div>
        <span className="eyebrow">{eyebrow}</span>
        <SplitHeading as="h1" lines={lines} onScroll={false} delay={0.25} className="mt-6 text-[clamp(3rem,9vw,8.5rem)]" />
        {text && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-xl text-lg leading-relaxed text-muted"
          >
            {text}
          </motion.p>
        )}
        {children}
      </div>
    </section>
  )
}
