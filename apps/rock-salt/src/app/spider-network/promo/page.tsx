import Container from '@/components/Container'
import SpiderRiderPromoForm from '@/components/SpiderRiderPromoForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Spider Rider Promo - Get Seen. Get Heard.',
  description: 'Submit your band promo assets to get on the Rock Salt Map and on the air.',
}

export default function SpiderRiderPromoPage() {
  return (
    <Container className="py-12 md:py-20 max-w-4xl">
      <SpiderRiderPromoForm />
    </Container>
  )
}
