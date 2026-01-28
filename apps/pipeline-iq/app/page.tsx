import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function Home() {
  redirect('/groove-in-45-seconds')
}
