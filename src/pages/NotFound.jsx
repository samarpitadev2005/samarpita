import Button from '../components/Button'
import Seo from '../components/Seo'

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[80vh] flex-col items-start justify-center pt-32">
      <Seo title="Page not found" description="This page could not be found." noindex />
      <p className="font-display text-[clamp(6rem,20vw,16rem)] leading-none text-brand">404</p>
      <h1 className="h-display mt-4 text-5xl">This page could not be found.</h1>
      <div className="mt-10"><Button to="/">Back to home</Button></div>
    </section>
  )
}
