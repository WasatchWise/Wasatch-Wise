import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function SlugRedirectPage({ params }: Props) {
  const { slug } = await params

  if (!slug || slug.includes('.')) {
    notFound()
  }

  const supabase = await createClient()

  const { data: band } = await supabase
    .from('bands')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle()

  if (band?.slug) {
    redirect(`/bands/${band.slug}`)
  }

  const { data: venue } = await supabase
    .from('venues')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle()

  if (venue?.slug) {
    redirect(`/venues/${venue.slug}`)
  }

  const { data: musician } = await supabase
    .from('musicians')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle()

  if (musician?.slug) {
    redirect(`/musicians/${musician.slug}`)
  }

  notFound()
}
