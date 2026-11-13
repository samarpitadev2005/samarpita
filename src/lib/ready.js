import { useEffect, useState } from 'react'

/*
  "App ready" = the loading screen has started to lift. Entrance animations on the first
  page (hero text, chips) wait for this, otherwise they would play underneath the loader
  and be over before anyone sees them. Pages opened later get `ready` immediately.
*/
let ready = false
const waiting = []

export function markReady() {
  if (ready) return
  ready = true
  waiting.splice(0).forEach((fn) => fn())
}

export const isReady = () => ready

export const whenReady = () => (ready ? Promise.resolve() : new Promise((resolve) => waiting.push(resolve)))

// Safety net: if no loader ever reports in (it should), release everything after a few seconds
if (typeof window !== 'undefined') setTimeout(markReady, 6000)

export function useAppReady() {
  const [state, setState] = useState(ready)
  useEffect(() => {
    if (!ready) whenReady().then(() => setState(true))
  }, [])
  return state
}
