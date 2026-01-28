import Container from '@/components/Container'
import Button from '@/components/Button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About | The Rock Salt',
  description: 'Mission, scope, and operational focus.',
}

export default function AboutPage() {
  return (
    <Container className="py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-semibold text-zinc-100 mb-8">
          About The Rock Salt
        </h1>

        <div className="prose prose-lg prose-invert max-w-none">
          <p className="text-lg text-zinc-400 mb-8">
            Documentation layer for local music.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              Our Mission
            </h2>
            <p className="text-zinc-400 mb-4">
              The Rock Salt documents the local scene with a focus on logistics, accuracy, and
              archival value.
            </p>
            <p className="text-zinc-400">
              We index bands, venues, shows, and protocols so the town square runs on clean signal.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              What We Do
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-zinc-950 p-6 rounded-md border border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                  Live sessions
                </h3>
                <p className="text-zinc-400">
                  Documented performances and interviews.
                </p>
              </div>
              <div className="bg-zinc-950 p-6 rounded-md border border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                  Band index
                </h3>
                <p className="text-zinc-400">
                  Verified profiles with metadata and links.
                </p>
              </div>
              <div className="bg-zinc-950 p-6 rounded-md border border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                  Show calendar
                </h3>
                <p className="text-zinc-400">
                  Operational schedule and archival records.
                </p>
              </div>
              <div className="bg-zinc-950 p-6 rounded-md border border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                  Network protocols
                </h3>
                <p className="text-zinc-400">
                  Rider standards and booking workflows.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              Coordination channel
            </h2>
            <p className="text-zinc-400 mb-6">
              Use the coordination channel for announcements and logistics.
            </p>
            <Button href="https://discord.gg/hW4dmajPkS" size="lg">
              Open coordination channel
            </Button>
          </section>

          <section className="border border-zinc-800 p-8 rounded-md">
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              Get involved
            </h2>
            <p className="text-zinc-400 mb-4">
              Submit a band, update a profile, or contribute show listings.
            </p>
          </section>
        </div>
      </div>
    </Container>
  )
}
