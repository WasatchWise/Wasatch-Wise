'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Send, Phone, CheckCircle2, ArrowRight, Clock } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { LogCallModal } from '@/components/dashboard/LogCallModal'
import { BumpModal } from '@/components/dashboard/BumpModal'

interface FeedItem {
    id: string
    type: 'sure_bet' | 'follow_up' | 'hot_lead' | 'at_risk'
    score: number
    title: string
    subtitle: string
    drivers: string[]
    action: string
    data: any
}

export function FocusFeed() {
    const [items, setItems] = useState<FeedItem[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [logCallProject, setLogCallProject] = useState<{ id: string, title: string } | null>(null)
    const [bumpProject, setBumpProject] = useState<{ id: string, title: string } | null>(null)

    useEffect(() => {
        fetchFeed(1)
    }, [])

    const fetchFeed = async (pageNum: number) => {
        try {
            const res = await fetch(`/api/focus?page=${pageNum}`)
            if (!res.ok) throw new Error('Failed to load feed')
            const data = await res.json()

            if (pageNum === 1) {
                setItems(data.feed)
            } else {
                setItems(prev => [...prev, ...data.feed])
            }

            setHasMore(!!data.nextPage)
        } catch (error) {
            toast.error('Failed to load your Focus Feed')
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    const loadMore = async () => {
        setLoadingMore(true)
        const nextPage = page + 1
        setPage(nextPage)
        await fetchFeed(nextPage)
    }

    const handleAction = (item: FeedItem) => {
        if (item.action === 'Log Call') {
            const projectId = item.data.projectId || item.data.activityId 
            setLogCallProject({ id: projectId, title: item.title })
        } else if (item.action === 'Bump') {
            const projectId = item.data.projectId
            setBumpProject({ id: projectId, title: item.title })
        }
    }

    // Refresh function for modals to call on success
    const refreshFeed = () => {
        setPage(1)
        setLoading(true)
        fetchFeed(1)
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight">Morning Focus</h2>
                <p className="text-muted-foreground">Here are your top priorities for today.</p>
            </div>

            <div className="space-y-4">
                {items.map((item) => (
                    <Card key={item.id} className="p-0 overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-primary/50">
                        <div className="p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={
                                            item.type === 'sure_bet' ? 'default' :
                                                item.type === 'hot_lead' ? 'destructive' :
                                                    item.type === 'follow_up' ? 'outline' : 'secondary'
                                        }>
                                            {item.type === 'sure_bet' ? 'New Opportunity' :
                                                item.type === 'hot_lead' ? 'Hot Lead' :
                                                    item.type === 'follow_up' ? 'Follow Up' : 'No Reply'}
                                        </Badge>
                                        <span className="text-sm font-medium text-green-600">
                                            Score: {item.score}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold">{item.title}</h3>
                                    <p className="text-muted-foreground">{item.subtitle}</p>
                                </div>

                                <div className="flex-shrink-0">
                                    {item.action === 'Log Call' ? (
                                        <Button size="lg" className="bg-orange-600 hover:bg-orange-700" onClick={() => handleAction(item)}>
                                            <Phone className="mr-2 h-4 w-4" />
                                            Log Call
                                        </Button>
                                    ) : item.action === 'Bump' ? (
                                        <Button size="lg" variant="outline" onClick={() => handleAction(item)}>
                                            <Clock className="mr-2 h-4 w-4" />
                                            Bump
                                        </Button>
                                    ) : (item.type === 'sure_bet' || item.type === 'follow_up') ? (
                                        <Link href={`/projects/${item.data.projectId}`}>
                                            <Button size="lg" className={item.type === 'follow_up' ? 'variant-outline' : ''}>
                                                {item.type === 'sure_bet' ? 'Draft Email' : 'Visit Project'}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button size="lg" variant="outline" disabled>
                                            <Send className="mr-2 h-4 w-4" />
                                            {item.action}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* The "Why" Section */}
                            <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                                {item.drivers.map((driver, i) => (
                                    <div key={i} className="flex items-center text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">
                                        <CheckCircle2 className="mr-1.5 h-3 w-3 text-primary" />
                                        {driver}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}

                {items.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">You&apos;re all caught up!</p>
                        <p className="mb-6">Great work clearing the deck.</p>
                        <Link href="/projects">
                            <Button variant="outline">
                                Go Find More Work
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {hasMore && items.length > 0 && (
                <div className="flex justify-center pt-4">
                    <Button
                        variant="ghost"
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        {loadingMore ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Load 10 More'
                        )}
                    </Button>
                </div>
            )}

            {logCallProject && (
                <LogCallModal
                    open={!!logCallProject}
                    onOpenChange={(open) => !open && setLogCallProject(null)}
                    projectId={logCallProject.id}
                    projectTitle={logCallProject.title}
                    onSuccess={refreshFeed}
                />
            )}

            {bumpProject && (
                <BumpModal
                    open={!!bumpProject}
                    onOpenChange={(open) => !open && setBumpProject(null)}
                    projectId={bumpProject.id}
                    projectTitle={bumpProject.title}
                    onSuccess={refreshFeed}
                />
            )}
        </div>
    )
}
