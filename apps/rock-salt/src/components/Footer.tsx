import Link from 'next/link'
import Container from './Container'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-zinc-950 text-zinc-400 mt-auto border-t border-zinc-800 mb-24">
      <Container>
        <div className="py-8">
          {/* Single compact row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-zinc-500">
                &copy; {currentYear} The Rock Salt · Utah music index
              </p>
              <div className="flex items-center gap-4">
                <Link href="/about" className="text-zinc-500 hover:text-zinc-100 transition-colors">
                  About
                </Link>
                <Link href="/terms" className="text-zinc-500 hover:text-zinc-100 transition-colors">
                  Terms
                </Link>
                <Link href="/privacy" className="text-zinc-500 hover:text-zinc-100 transition-colors">
                  Privacy
                </Link>
                <a
                  href="https://discord.gg/hW4dmajPkS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-zinc-100 transition-colors"
                >
                  Discord Community
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
