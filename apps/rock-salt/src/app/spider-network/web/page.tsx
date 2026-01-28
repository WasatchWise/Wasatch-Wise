import Container from '@/components/Container'
import SceneWeb from '@/components/SceneWeb'
import { getSceneNetwork } from '@/lib/supabase/network-queries'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Scene Web | The Rock Salt',
    description: 'Network graph of bands, members, and shared bills.',
}

export const revalidate = 3600 // Cache for 1 hour

export default async function SceneWebPage() {
    const networkData = await getSceneNetwork()
    const bandCount = networkData.nodes.filter(n => n.type === 'band').length
    const musicianCount = networkData.nodes.filter(n => n.type === 'musician').length
    const memberLinks = networkData.links.filter(l => l.type === 'member').length
    const performanceLinks = networkData.links.filter(l => l.type === 'performer').length

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 pb-20">
            <Container className="py-12 md:py-20">
                <header className="mb-12">
                    <div className="inline-block px-3 py-1 border border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-400 mb-6 rounded-md">
                        Network Map
                    </div>
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
                        Spider Network Web
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl">
                        Map of shared members and shared bills across the local scene.
                    </p>
                </header>



                <div className="mb-12">
                    <SceneWeb data={networkData} />
                </div>

                <section className="grid md:grid-cols-4 gap-6 mb-12">
                    <div className="border border-zinc-800 rounded-md p-5">
                        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Bands indexed</div>
                        <div className="text-2xl font-semibold text-zinc-100">{bandCount}</div>
                    </div>
                    <div className="border border-zinc-800 rounded-md p-5">
                        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Musicians indexed</div>
                        <div className="text-2xl font-semibold text-zinc-100">{musicianCount}</div>
                    </div>
                    <div className="border border-zinc-800 rounded-md p-5">
                        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Member links</div>
                        <div className="text-2xl font-semibold text-zinc-100">{memberLinks}</div>
                    </div>
                    <div className="border border-zinc-800 rounded-md p-5">
                        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Shared bills</div>
                        <div className="text-2xl font-semibold text-zinc-100">{performanceLinks}</div>
                    </div>
                </section>

                <section className="grid md:grid-cols-2 gap-6">
                    <div className="border border-zinc-800 rounded-md p-6">
                        <h2 className="text-xl font-semibold mb-3">Add yourself</h2>
                        <p className="text-sm text-zinc-400 mb-4">
                            If your band is listed without members, send a roster update. We’ll link you across projects.
                        </p>
                        <a
                            href="mailto:music@therocksalt.com"
                            className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 rounded-md text-zinc-200 hover:border-amber-500 transition-colors"
                        >
                            Send roster update
                        </a>
                    </div>
                    <div className="border border-zinc-800 rounded-md p-6">
                        <h2 className="text-xl font-semibold mb-3">Claim a band</h2>
                        <p className="text-sm text-zinc-400 mb-4">
                            Claim your band page to publish members and booking data.
                        </p>
                        <a
                            href="/submit"
                            className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 rounded-md text-zinc-200 hover:border-amber-500 transition-colors"
                        >
                            Open intake
                        </a>
                    </div>
                </section>

                {networkData.nodes.length === 0 && (
                    <div className="mt-8 p-8 border border-zinc-800 rounded-md text-center text-zinc-500">
                        No network data available.
                    </div>
                )}
            </Container>
        </div>
    )
}
