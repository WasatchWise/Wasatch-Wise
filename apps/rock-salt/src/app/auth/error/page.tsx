import Container from '@/components/Container'
import Button from '@/components/Button'
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <Container className="py-20">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-zinc-950 border border-zinc-800 rounded-md p-8">
          <h1 className="text-2xl font-semibold text-zinc-100 mb-2">
            Authentication error
          </h1>
          <p className="text-zinc-400 mb-6">
            Something went wrong. Try again.
          </p>
          <Link href="/auth/signin">
            <Button>Back to sign in</Button>
          </Link>
        </div>
      </div>
    </Container>
  )
}
