import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Preloader from './components/Preloader'
import Home from './pages/Home'
import About from './pages/About'
import Support from './pages/Support'
import Contact from './pages/Contact'
import BloodDonation from './pages/BloodDonation'
import { PrivacyPolicy, Terms } from './pages/Legal'
import NotFound from './pages/NotFound'
import { useLenis, scrollToTop } from './lib/lenis'
import { ScrollTrigger } from './lib/gsap'

// The admin panel is a separate page now (admin.html); send old /#/admin bookmarks there
function AdminRedirect() {
  useEffect(() => {
    window.location.replace(`${import.meta.env.BASE_URL}admin`)
  }, [])
  return <section className="min-h-[80vh]" />
}

const ease = [0.76, 0, 0.24, 1]

function Page({ children }) {
  return (
    <motion.div className="relative">
      {/* Curtain that wipes up on enter and down on exit */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-[60] origin-top bg-night"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0, transition: { duration: 0.8, ease, delay: 0.1 } }}
        exit={{ scaleY: 0 }}
      />
      <motion.div
        className="pointer-events-none fixed inset-0 z-[60] origin-bottom bg-night"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1, transition: { duration: 0.6, ease } }}
      />
      <motion.main
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.35 } }}
        exit={{ opacity: 0, transition: { duration: 0.3 } }}
      >
        {children}
      </motion.main>
      <Footer />
    </motion.div>
  )
}

export default function App() {
  useLenis()
  const location = useLocation()

  return (
    <>
      <Preloader />
      <Navbar />
      <AnimatePresence
        mode="wait"
        onExitComplete={() => {
          scrollToTop()
          requestAnimationFrame(() => ScrollTrigger.refresh())
        }}
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/about" element={<Page><About /></Page>} />
          <Route path="/blood-donation" element={<Page><BloodDonation /></Page>} />
          <Route path="/support" element={<Page><Support /></Page>} />
          <Route path="/contact" element={<Page><Contact /></Page>} />
          <Route path="/admin" element={<AdminRedirect />} />
          <Route path="/privacy-policy" element={<Page><PrivacyPolicy /></Page>} />
          <Route path="/terms" element={<Page><Terms /></Page>} />
          <Route path="*" element={<Page><NotFound /></Page>} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
