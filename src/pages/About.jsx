import { useLayoutEffect, useRef } from 'react'
import { Target, Eye, Phone, EnvelopeSimple, Drop } from '@phosphor-icons/react'
import { gsap } from '../lib/gsap'
import PageHero from '../components/PageHero'
import SplitHeading from '../components/SplitHeading'
import Reveal from '../components/Reveal'
import Img from '../components/Img'
import Button from '../components/Button'
import CTABand from '../components/CTABand'
import { images, values, services, site } from '../data/site'
import OdiaWord from '../components/OdiaWord'
import TeamArc from '../components/TeamArc'
import Seo from '../components/Seo'

function TeamPhoto() {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.team-photo', {
        clipPath: 'inset(10% 8% 10% 8% round 48px)',
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top 90%', end: 'top 30%', scrub: true },
      })
      gsap.fromTo('.team-photo img', { scale: 1.2 }, {
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top 90%', end: 'bottom top', scrub: true },
      })
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={ref} className="container-x pb-24 sm:pb-36">
      <Img
        src={images.team}
        alt="Team Samarpita volunteers"
        className="team-photo aspect-[4/3] rounded-[2rem] sm:aspect-[16/9] sm:rounded-[2.5rem]"
        imgClassName="object-[50%_62%]"
      />
      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <span className="eyebrow">Who we are</span>
          <h2 className="h-display mt-5 text-[clamp(2.5rem,4.5vw,4rem)]">
            Young hearts, one <i className="text-brand">promise.</i>
          </h2>
        </div>
        <Reveal className="space-y-4 text-lg leading-relaxed text-muted lg:col-span-6 lg:col-start-7">
          <p data-reveal>
            Team Samarpita is a group of young social workers and volunteers from Odisha. We come from different backgrounds, but share one belief: nobody should be left alone with their problems.
          </p>
          <p data-reveal>
            “Samarpita” means <em>one who is dedicated</em>. That is what we try to be: dedicated to every family, every patient and every child who reaches out to us.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function FounderCard() {
  return (
    <section className="bg-linen py-24 sm:py-32">
      <div className="container-x grid items-center gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <div data-reveal className="relative">
            <Img src={images.founder} alt="Founder of Team Samarpita" className="aspect-[4/5] rounded-[2rem]" imgClassName="object-top" />
            <div className="theme-dark absolute -bottom-6 -right-2 rounded-2xl bg-cream px-6 py-4 shadow-2xl sm:-right-6">
              <OdiaWord className="text-5xl text-brand" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Founder</p>
            </div>
          </div>
        </Reveal>
        <div className="lg:col-span-6 lg:col-start-7">
          <span className="eyebrow">Our founder</span>
          <SplitHeading lines={['The person who', 'started it *all*']} className="mt-5 text-[clamp(2.75rem,5.5vw,5rem)]" />
          <Reveal>
            <p data-reveal className="mt-6 text-lg leading-relaxed text-muted">
              Our founder brought Team Samarpita together with a simple idea: whenever someone in need knocks, the door must open. Today that idea guides every volunteer, every camp and every blood donation call we make.
            </p>
            <div data-reveal className="mt-10 flex flex-wrap gap-3">
              <Button href={`tel:${site.phoneRaw}`} variant="accent">
                <span className="flex items-center gap-2"><Phone weight="bold" /> {site.phone}</span>
              </Button>
              <Button href={`mailto:${site.email}`} variant="outline" icon={false}>
                <span className="flex items-center gap-2"><EnvelopeSimple weight="bold" /> Email us</span>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function MissionVision() {
  const cards = [
    { icon: Target, title: 'Our Mission', text: 'To reach every person in need with timely, dignified and practical help, in education, health, blood donation, livelihood and justice.', dark: true },
    { icon: Eye, title: 'Our Vision', text: 'An Odisha where no one is left alone with their problems, and every community has the strength to care for its own.', dark: false },
  ]
  return (
    <section className="container-x py-24 sm:py-36">
      <Reveal className="grid gap-4 md:grid-cols-2" stagger={0.12}>
        {cards.map(({ icon: Icon, title, text, dark }) => (
          <div
            data-reveal
            key={title}
            className={`grain relative overflow-hidden rounded-[2rem] p-10 sm:p-14 ${dark ? 'theme-dark bg-forest ring-1 ring-line' : 'bg-brand-soft'}`}
          >
            <Icon size={44} weight="duotone" className="text-brand" />
            <h3 className="mt-16 font-display text-5xl">{title}</h3>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink/70">{text}</p>
          </div>
        ))}
      </Reveal>
    </section>
  )
}

function Values() {
  return (
    <section className="bg-linen py-24 sm:py-32">
      <div className="container-x">
        <span className="eyebrow">Core values</span>
        <SplitHeading lines={['What we *stand* for']} className="mt-5 text-[clamp(2.75rem,5.5vw,5rem)]" />
        <Reveal className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-line sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, text }) => (
            <div data-reveal key={title} className="group bg-linen p-8 transition-colors duration-500 hover:bg-cream sm:p-10">
              <Icon size={36} weight="duotone" className="text-brand transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110" />
              <h3 className="mt-10 font-display text-3xl">{title}</h3>
              <p className="mt-2 text-[15px] text-muted">{text}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

// Horizontal, scroll-driven strip of the areas the team works in.
// Uses CSS sticky (not GSAP pinning) so the section never jumps when it locks in place.
function FocusAreas() {
  const ref = useRef(null)
  const track = useRef(null)
  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px)', () => {
      const distance = () => Math.max(0, track.current.scrollWidth - window.innerWidth + 96)
      const setHeight = () => {
        ref.current.style.height = `${window.innerHeight + distance()}px`
      }
      setHeight()
      const tween = gsap.to(track.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onRefreshInit: setHeight,
        },
      })
      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
        ref.current && (ref.current.style.height = '')
      }
    })
    return () => mm.revert()
  }, [])
  const areas = [{ icon: Drop, title: 'Blood Donation', text: 'A growing registry of donors we call whenever a patient needs blood.' }, ...services]
  return (
    <section ref={ref} className="theme-dark relative bg-cream">
      <div className="py-24 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:overflow-hidden lg:py-0">
        <div className="container-x">
          <span className="eyebrow">Where we work</span>
          <SplitHeading lines={['Our areas of *seva*']} className="mt-5 text-[clamp(2.75rem,5.5vw,5rem)]" />
        </div>
        <div ref={track} className="mt-14 flex flex-col gap-6 px-5 will-change-transform sm:px-8 lg:w-max lg:flex-row lg:px-12">
          {areas.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="relative w-full shrink-0 rounded-[1.75rem] border border-line bg-linen p-8 lg:w-[400px] lg:p-10">
              <div className="flex items-start justify-between">
                <Icon size={48} weight="duotone" className={i === 0 ? 'text-blood' : 'text-brand'} />
                <span className="font-display text-6xl text-ink/15">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="mt-16 font-display text-4xl">{title}</h3>
              <p className="mt-3 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function About() {
  return (
    <>
      <Seo title="About Us" description="Team Samarpita is a group of young social workers and volunteers from Odisha dedicated to education, healthcare, blood donation, women's empowerment and relief for anyone in need." />
      <PageHero
        eyebrow="About Team Samarpita"
        crumb="About Us"
        lines={['Dedicated to', '*humanity*, always.']}
        text="We are a team of social workers from Odisha who believe every person deserves to be heard, supported and treated with dignity."
      />
      <TeamPhoto />
      <TeamArc />
      <FounderCard />
      <MissionVision />
      <Values />
      <FocusAreas />
      <CTABand
        lines={['Want to be part', 'of our *journey*?']}
        text="Join our volunteers who give their time and skills to make a difference in people’s lives."
        primary={{ label: 'Become a volunteer', to: '/support' }}
        secondary={{ label: 'Contact us', to: '/contact' }}
      />
    </>
  )
}
