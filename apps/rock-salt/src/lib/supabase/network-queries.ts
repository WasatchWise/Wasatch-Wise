import { createClient } from '@/lib/supabase/server'
import { Tables } from '@/types/database'

export interface NetworkNode {
    id: string
    name: string
    type: 'band' | 'musician'
    slug: string
    image_url?: string | null
}

export interface NetworkLink {
    source: string
    target: string
    type: 'member' | 'performer' | 'bandmate' | 'suggested'
    label?: string
}

export interface NetworkData {
    nodes: NetworkNode[]
    links: NetworkLink[]
}

export async function getSceneNetwork(): Promise<NetworkData> {
    const supabase = await createClient()

    // 1. Fetch all bands and musicians
    const [{ data: bands, error: bandsError }, { data: musicians, error: musiciansError }] = await Promise.all([
        supabase.from('bands').select('id, name, slug, image_url, origin_city'),
        supabase.from('musicians').select('id, name, slug')
    ])

    // 2. Fetch memberships
    const { data: memberships } = await supabase
        .from('band_members')
        .select('band_id, musician_id, role, bands (name)')

    // 3. Fetch shared performances
    // We identify shared performances by finding bands that played the same event
    const { data: eventBands } = await supabase
        .from('event_bands')
        .select('event_id, band_id, events(city)')

    const { data: bandGenres } = await supabase
        .from('band_genres')
        .select('band_id, genre_id, genres(name)')

    const nodes: NetworkNode[] = [
        ...(bandsError ? [] : (bands?.map(b => ({
            id: b.id,
            name: b.name,
            type: 'band' as const,
            slug: b.slug,
            image_url: (b as { image_url?: string | null }).image_url ?? null
        })) ?? [])),
        ...(musiciansError ? [] : (musicians?.map(m => ({ id: m.id, name: m.name, type: 'musician' as const, slug: m.slug })) ?? []))
    ]

    const links: NetworkLink[] = []
    const performedPairs = new Set<string>()

    // Add membership links
    memberships?.forEach(m => {
        links.push({
            source: m.musician_id,
            target: m.band_id,
            type: 'member',
            label: m.role || 'Member'
        })
    })

    // Add bandmate links (musician <-> musician, labeled by band)
    const bandGroups: Record<string, { bandName: string; musicianIds: string[] }> = {}
    memberships?.forEach(m => {
        if (!bandGroups[m.band_id]) {
            bandGroups[m.band_id] = {
                bandName: (m as { bands?: { name?: string | null } }).bands?.name ?? 'Bandmate',
                musicianIds: []
            }
        }
        bandGroups[m.band_id].musicianIds.push(m.musician_id)
    })

    const bandmatePairs = new Map<string, { source: string; target: string; labels: Set<string> }>()
    Object.values(bandGroups).forEach(group => {
        const uniqueIds = Array.from(new Set(group.musicianIds))
        for (let i = 0; i < uniqueIds.length; i++) {
            for (let j = i + 1; j < uniqueIds.length; j++) {
                const a = uniqueIds[i]
                const b = uniqueIds[j]
                const key = a < b ? `${a}|${b}` : `${b}|${a}`
                if (!bandmatePairs.has(key)) {
                    bandmatePairs.set(key, { source: a, target: b, labels: new Set() })
                }
                bandmatePairs.get(key)?.labels.add(group.bandName)
            }
        }
    })

    bandmatePairs.forEach(({ source, target, labels }) => {
        const label = Array.from(labels).sort().join(', ')
        links.push({
            source,
            target,
            type: 'bandmate',
            label
        })
    })

    // Add performance links
    // Group by event_id
    const performanceGroups: Record<string, string[]> = {}
    eventBands?.forEach(eb => {
        if (!performanceGroups[eb.event_id]) performanceGroups[eb.event_id] = []
        performanceGroups[eb.event_id].push(eb.band_id)
    })

    // Create links between bands in the same group
    Object.values(performanceGroups).forEach(bandIds => {
        for (let i = 0; i < bandIds.length; i++) {
            for (let j = i + 1; j < bandIds.length; j++) {
                const key = bandIds[i] < bandIds[j] ? `${bandIds[i]}|${bandIds[j]}` : `${bandIds[j]}|${bandIds[i]}`
                performedPairs.add(key)
                links.push({
                    source: bandIds[i],
                    target: bandIds[j],
                    type: 'performer',
                    label: 'Played Together'
                })
            }
        }
    })

    // Suggested links: shared genres, different cities, no shared performances
    const bandCity = new Map<string, string>()
    const bandGenreMap = new Map<string, Set<string>>()
    const genreToBands = new Map<string, Set<string>>()

    bands?.forEach(b => {
        if (b.origin_city) {
            bandCity.set(b.id, b.origin_city)
        }
    })

    eventBands?.forEach(eb => {
        const city = (eb as { events?: { city?: string | null } }).events?.city
        if (city) {
            bandCity.set(eb.band_id, city)
        }
    })

    bandGenres?.forEach(bg => {
        const genreName = (bg as { genres?: { name?: string | null } }).genres?.name
        if (!genreName) return
        if (!bandGenreMap.has(bg.band_id)) {
            bandGenreMap.set(bg.band_id, new Set())
        }
        bandGenreMap.get(bg.band_id)?.add(genreName)

        if (!genreToBands.has(genreName)) {
            genreToBands.set(genreName, new Set())
        }
        genreToBands.get(genreName)?.add(bg.band_id)
    })

    const pairShared: Record<string, { count: number; genres: Set<string> }> = {}
    genreToBands.forEach((bandIds, genre) => {
        const ids = Array.from(bandIds)
        for (let i = 0; i < ids.length; i++) {
            for (let j = i + 1; j < ids.length; j++) {
                const a = ids[i]
                const b = ids[j]
                const key = a < b ? `${a}|${b}` : `${b}|${a}`
                if (!pairShared[key]) {
                    pairShared[key] = { count: 0, genres: new Set() }
                }
                pairShared[key].count += 1
                pairShared[key].genres.add(genre)
            }
        }
    })

    const suggestionsByBand = new Map<string, NetworkLink[]>()
    Object.entries(pairShared).forEach(([key, shared]) => {
        if (shared.count < 2) return
        const [a, b] = key.split('|')
        if (performedPairs.has(key)) return

        const cityA = bandCity.get(a)
        const cityB = bandCity.get(b)
        if (cityA && cityB && cityA.toLowerCase() === cityB.toLowerCase()) return

        const label = Array.from(shared.genres).slice(0, 2).join(', ')
        const link: NetworkLink = {
            source: a,
            target: b,
            type: 'suggested',
            label: label || 'Similar vibe'
        }

        const aList = suggestionsByBand.get(a) ?? []
        const bList = suggestionsByBand.get(b) ?? []
        aList.push(link)
        bList.push(link)
        suggestionsByBand.set(a, aList)
        suggestionsByBand.set(b, bList)
    })

    const addedSuggestion = new Set<string>()
    suggestionsByBand.forEach(bandLinks => {
        bandLinks
            .sort((first, second) => (second.label?.length ?? 0) - (first.label?.length ?? 0))
            .slice(0, 2)
            .forEach(link => {
                const key = link.source < link.target ? `${link.source}|${link.target}` : `${link.target}|${link.source}`
                if (addedSuggestion.has(key)) return
                addedSuggestion.add(key)
                links.push(link)
            })
    })

    return { nodes, links }
}
