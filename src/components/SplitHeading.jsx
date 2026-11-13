import { Fragment, useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { whenReady } from '../lib/ready'

// Splits a heading into words and slides each one up from a mask.
// Pass `lines` as an array; wrap a word in *asterisks* to render it in brand-green italic.
export default function SplitHeading({ lines, as: Tag = 'h2', className = '', delay = 0, onScroll = true }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tween = gsap.from(ref.current.querySelectorAll('.word-inner'), {
        yPercent: 110,
        rotate: 4,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.06,
        delay,
        paused: !onScroll,
        scrollTrigger: onScroll ? { trigger: ref.current, start: 'top 88%', toggleActions: 'play none none none' } : undefined,
      })
      // Headings that animate on mount hold until the loading screen lifts
      if (!onScroll) whenReady().then(() => tween.play())
    }, ref)
    return () => ctx.revert()
  }, [delay, onScroll])

  return (
    <Tag ref={ref} className={`h-display ${className}`}>
      {lines.map((line, li) => (
        <span key={li} className="block">
          {line.split(' ').map((word, wi) => {
            const m = word.match(/^\*(.+)\*(\W*)$/)
            const accent = Boolean(m)
            const text = m ? m[1] : word
            return (
              <Fragment key={wi}>
                {/* the mask span gets a little side room so italic letters are not clipped */}
                <span className="-mx-[0.06em] inline-block overflow-hidden px-[0.06em] pb-[0.12em] align-top">
                  <span className="word-inner inline-block">
                    {accent ? <span className="italic text-brand">{text}</span> : text}
                    {m && m[2]}
                  </span>
                </span>
                {/* a normal space between words lets long lines wrap on small screens */}
                {wi < line.split(' ').length - 1 ? ' ' : ''}
              </Fragment>
            )
          })}
        </span>
      ))}
    </Tag>
  )
}
