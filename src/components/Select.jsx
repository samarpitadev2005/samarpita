import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CaretDown, Check } from '@phosphor-icons/react'

/*
  Custom dropdown that replaces the browser's <select>.

  - Works controlled (`value` + `onChange(value)`) or uncontrolled (`defaultValue`).
  - With `name` it also renders a hidden input, so plain FormData forms keep working, and
    `required` still blocks submit with the browser's own validation bubble.
  - Keyboard: ArrowUp/Down open and move, Enter/Space pick, Escape closes, Home/End jump,
    typing a letter jumps to the first matching option.
  - Opens upward when there is not enough room below.

  options: ['A', 'B'] or [{ value: 'a', label: 'A' }]
  variant: 'field' (form input look) | 'pill' (compact rounded pill, e.g. status chips)
*/
export default function Select({
  options,
  value,
  defaultValue = '',
  onChange,
  placeholder = 'Select',
  name,
  id,
  required = false,
  disabled = false,
  variant = 'field',
  className = '',
  triggerClassName = '',
  'aria-label': ariaLabel,
}) {
  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  const controlled = value !== undefined
  const [inner, setInner] = useState(defaultValue)
  const current = controlled ? value : inner
  const selected = items.find((o) => o.value === current)

  const [open, setOpen] = useState(false)
  const [up, setUp] = useState(false)
  const [active, setActive] = useState(-1)
  const wrap = useRef(null)
  const button = useRef(null)
  const list = useRef(null)
  const typed = useRef({ text: '', at: 0 })
  const listId = useId()

  const pick = (v) => {
    if (!controlled) setInner(v)
    onChange?.(v)
    setOpen(false)
    button.current?.focus()
  }

  const show = () => {
    if (disabled) return
    const idx = Math.max(0, items.findIndex((o) => o.value === current))
    setActive(idx)
    setOpen(true)
  }

  // Decide direction right before the panel paints
  useLayoutEffect(() => {
    if (!open || !button.current) return
    const r = button.current.getBoundingClientRect()
    const need = Math.min(items.length, 7) * 44 + 24
    setUp(window.innerHeight - r.bottom < need && r.top > window.innerHeight - r.bottom)
  }, [open, items.length])

  // Close on outside click or when the page scrolls away
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!wrap.current?.contains(e.target)) setOpen(false)
    }
    const onScroll = (e) => {
      if (!list.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open])

  // Keep the highlighted option in view
  useEffect(() => {
    if (!open || active < 0) return
    list.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  const onKeyDown = (e) => {
    if (disabled) return
    const last = items.length - 1
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        show()
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActive((i) => Math.min(last, i + 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActive((i) => Math.max(0, i - 1))
        break
      case 'Home':
        e.preventDefault()
        setActive(0)
        break
      case 'End':
        e.preventDefault()
        setActive(last)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (active >= 0) pick(items[active].value)
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
      case 'Tab':
        setOpen(false)
        break
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const now = Date.now()
          typed.current = { text: (now - typed.current.at < 600 ? typed.current.text : '') + e.key.toLowerCase(), at: now }
          const i = items.findIndex((o) => o.label.toLowerCase().startsWith(typed.current.text))
          if (i >= 0) setActive(i)
        }
    }
  }

  const pill = variant === 'pill'
  const trigger = pill
    ? `inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-brand/40 ${triggerClassName}`
    : `field flex items-center justify-between gap-3 text-left ${selected ? '' : 'text-muted/70'} ${open ? 'border-brand ring-4 ring-brand/15' : ''} ${triggerClassName}`

  return (
    <div ref={wrap} className={`relative ${pill ? 'inline-block' : ''} ${className}`}>
      <button
        ref={button}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        className={`${trigger} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <CaretDown size={pill ? 12 : 16} weight="bold" className={`shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''} ${pill ? '' : 'text-muted'}`} />
      </button>

      {/* Hidden twin so FormData picks the value up and `required` still blocks the submit */}
      {name && (
        <input
          tabIndex={-1}
          aria-hidden="true"
          name={name}
          value={current}
          required={required}
          onChange={() => {}}
          onInvalid={() => button.current?.focus()}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        />
      )}

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={list}
            id={listId}
            role="listbox"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            data-lenis-prevent
            initial={{ opacity: 0, y: up ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: up ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute z-50 max-h-[19.5rem] overflow-y-auto rounded-2xl border border-line bg-linen p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] ${
              up ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]'
            } ${pill ? 'left-0 min-w-[11rem]' : 'left-0 right-0'}`}
          >
            {items.map((o, i) => {
              const isSel = o.value === current
              return (
                <li
                  key={o.value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={isSel}
                  onPointerMove={() => setActive(i)}
                  onClick={() => pick(o.value)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-[15px] transition-colors ${
                    i === active ? 'bg-sand' : ''
                  } ${isSel ? 'font-semibold text-brand' : 'text-ink'} ${pill ? 'text-[13px]' : ''}`}
                >
                  <span className="truncate">{o.label}</span>
                  {isSel && <Check size={16} weight="bold" className="shrink-0" />}
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
