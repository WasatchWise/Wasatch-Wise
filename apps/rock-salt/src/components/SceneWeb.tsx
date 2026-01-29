'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { NetworkData, NetworkNode, NetworkLink } from '@/lib/supabase/network-queries'

interface SceneWebProps {
    data: NetworkData
}

interface ForceNode extends NetworkNode {
    x: number
    y: number
    vx: number
    vy: number
}

export default function SceneWeb({ data }: SceneWebProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const [size, setSize] = useState({ width: 800, height: 600 })
    const [nodes, setNodes] = useState<ForceNode[]>([])
    const [hoveredNode, setHoveredNode] = useState<string | null>(null)
    const [selectedNode, setSelectedNode] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isPanning, setIsPanning] = useState(false)
    const [zoom, setZoom] = useState(0.6) // Start zoomed out further for dramatic effect
    const panOrigin = useRef({ x: 0, y: 0 })
    const panStart = useRef({ x: 0, y: 0 })
    const movedDuringPan = useRef(false)
    const pinchStart = useRef<number | null>(null)
    const zoomStart = useRef(1)

    // --- Search Logic ---
    const BRICK_WALL_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='50' viewBox='0 0 100 50'%3E%3Crect width='100' height='50' fill='%232a0a0a'/%3E%3Cpath d='M0 0h50v25H0zm50 25h50v25H50zM0 25h25v25H0zm50-25h25v25H50z' fill='%237f1d1d' stroke='%233f0f0f' stroke-width='1'/%3E%3C/svg%3E`

    const searchResults = useMemo(() => {
        if (!searchQuery || searchQuery.length < 2) return []
        const lower = searchQuery.toLowerCase()
        return nodes.filter(n => n.name.toLowerCase().includes(lower))
    }, [searchQuery, nodes])

    const handleSearchSelect = (nodeId: string) => {
        const node = nodes.find(n => n.id === nodeId)
        if (node) {
            setSelectedNode(node.id)
            setHoveredNode(node.id)
            centerOnNode(node, 2.5) // Stronger zoom for "getting lost" in it
            setSearchQuery('')
            setIsSearching(false)
        }
    }

    const hashString = (value: string) => {
        let hash = 0
        for (let i = 0; i < value.length; i++) {
            hash = (hash << 5) - hash + value.charCodeAt(i)
            hash |= 0
        }
        return Math.abs(hash)
    }

    const centerOnNode = (node: ForceNode, nextZoom = 1.6) => {
        setZoom(nextZoom)
        setPan({
            x: size.width / 2 - node.x * nextZoom,
            y: size.height / 2 - node.y * nextZoom
        })
    }

    const resetView = () => {
        setSelectedNode(null)
        setZoom(0.8)
        setPan({
            x: size.width / 2 - (size.width * 0.5) * 0.8, // Center roughly
            y: size.height / 2 - (size.height * 0.5) * 0.8
        })
    }

    // Initialize nodes
    // Initialize nodes & Resize Observer
    useEffect(() => {
        if (!containerRef.current) return

        const updateSize = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current
                setSize({ width: clientWidth, height: clientHeight })
            }
        }

        // Initial Size
        updateSize()

        // Responsive Observer
        const observer = new ResizeObserver(updateSize)
        observer.observe(containerRef.current)

        return () => observer.disconnect()
    }, [])

    // Initial Node Layout (Run once when data loads or size stabilizes first time)
    useEffect(() => {
        if (nodes.length > 0 || size.width === 0) return // Don't re-layout if we have nodes

        const w = size.width
        const h = size.height

        // Initial Spiral Distribution for "Galaxy" feel
        const initialNodes: ForceNode[] = data.nodes.map((node, i) => {
            const angle = i * 0.4
            const radius = 50 + (i * 2)
            return {
                ...node,
                x: w / 2 + Math.cos(angle) * radius,
                y: h / 2 + Math.sin(angle) * radius,
                vx: 0,
                vy: 0
            }
        })
        setNodes(initialNodes)
        // Center view initially
        setPan({ x: w / 2 - (w / 2) * 0.8, y: h / 2 - (h / 2) * 0.8 })
    }, [data.nodes, size.width, size.height])

    const [isStabilized, setIsStabilized] = useState(false)
    const [cursor, setCursor] = useState({ x: 0, y: 0, active: false })

    // Physics Engine
    useEffect(() => {
        if (nodes.length === 0) return

        let animationFrameId: number
        let ticks = 0
        const maxTicks = 200 // Stop simulation after ~3-4 seconds

        const kRepulsion = 800
        const kAttrBase = 0.02
        const centerForce = 0.01

        const update = () => {
            // Stop simulating if settled
            ticks++
            if (ticks > maxTicks) {
                setIsStabilized(true)
                return // Stop the loop efficiently
            }

            setNodes(prevNodes => {
                const nextNodes = prevNodes.map(n => ({ ...n }))

                // 1. Repulsion
                for (let i = 0; i < nextNodes.length; i++) {
                    for (let j = i + 1; j < nextNodes.length; j++) {
                        const dx = nextNodes[i].x - nextNodes[j].x
                        const dy = nextNodes[i].y - nextNodes[j].y
                        const distSq = dx * dx + dy * dy + 1
                        const force = kRepulsion / distSq
                        const dist = Math.sqrt(distSq)

                        const fx = (dx / dist) * (force > 50 ? 50 : force)
                        const fy = (dy / dist) * (force > 50 ? 50 : force)

                        nextNodes[i].vx += fx
                        nextNodes[i].vy += fy
                        nextNodes[j].vx -= fx
                        nextNodes[j].vy -= fy
                    }
                }

                // 2. Attraction
                data.links.forEach(link => {
                    const sourceIdx = nextNodes.findIndex(n => n.id === link.source)
                    const targetIdx = nextNodes.findIndex(n => n.id === link.target)

                    if (sourceIdx !== -1 && targetIdx !== -1) {
                        const dx = nextNodes[sourceIdx].x - nextNodes[targetIdx].x
                        const dy = nextNodes[sourceIdx].y - nextNodes[targetIdx].y
                        const dist = Math.sqrt(dx * dx + dy * dy)

                        const isMember = link.type === 'member'
                        const k = isMember ? 0.08 : kAttrBase
                        const targetDist = isMember ? 40 : 120

                        const force = (dist - targetDist) * k

                        const fx = (dx / dist) * force
                        const fy = (dy / dist) * force

                        nextNodes[sourceIdx].vx -= fx
                        nextNodes[sourceIdx].vy -= fy
                        nextNodes[targetIdx].vx += fx
                        nextNodes[targetIdx].vy += fy
                    }
                })

                // 3. Center Gravity
                nextNodes.forEach(n => {
                    n.vx += (size.width / 2 - n.x) * centerForce
                    n.vy += (size.height / 2 - n.y) * centerForce
                })

                // 4. Update
                let totalEnergy = 0
                nextNodes.forEach(n => {
                    n.x += n.vx
                    n.y += n.vy
                    n.vx *= 0.60 // Even higher friction for "Heavy" settling
                    n.vy *= 0.60

                    totalEnergy += Math.abs(n.vx) + Math.abs(n.vy)

                    if (Math.abs(n.vx) < 0.01) n.vx = 0
                    if (Math.abs(n.vy) < 0.01) n.vy = 0
                })

                // Early exit if settled
                if (totalEnergy < 0.5) ticks = maxTicks

                return nextNodes
            })

            if (ticks <= maxTicks) {
                animationFrameId = requestAnimationFrame(update)
            } else {
                setIsStabilized(true)
            }
        }

        animationFrameId = requestAnimationFrame(update)
        return () => cancelAnimationFrame(animationFrameId)
    }, [nodes.length, data.links, size])

    // Update hoveredData to respect SELECTION
    const effectiveNodeId = selectedNode || hoveredNode

    const hoveredData = useMemo(() => {
        if (!effectiveNodeId) return null
        const node = nodes.find(n => n.id === effectiveNodeId)
        if (!node) return null

        const connected = data.links
            .filter(link => link.source === effectiveNodeId || link.target === effectiveNodeId)
            .map(link => {
                const targetId = link.source === effectiveNodeId ? link.target : link.source
                const target = nodes.find(n => n.id === targetId)
                return target ? { target, link } : null
            })
            .filter((entry): entry is { target: ForceNode; link: NetworkLink } => !!entry)

        const bandLinks = connected.filter(entry => entry.target.type === 'band')
        const musicianLinks = connected.filter(entry => entry.target.type === 'musician')

        return {
            node,
            total: connected.length,
            bandLinks,
            musicianLinks
        }
    }, [effectiveNodeId, nodes, data.links])

    const renderedLinks = useMemo(() => {
        return data.links.map((link, i) => {
            const source = nodes.find(n => n.id === link.source)
            const target = nodes.find(n => n.id === link.target)
            if (!source || !target) return null

            const isHighlighted = effectiveNodeId === link.source || effectiveNodeId === link.target
            // Very subtle lines by default
            const opacity = effectiveNodeId ? (isHighlighted ? 0.6 : 0.05) : 0.15
            const color = isHighlighted ? '#f59e0b' : '#52525b'

            // Organic Curves
            const dx = target.x - source.x
            const dy = target.y - source.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const curve = dist * 0.2 * (i % 2 === 0 ? 1 : -1)
            const nx = -dy / dist
            const ny = dx / dist
            const cx = (source.x + target.x) / 2 + nx * curve
            const cy = (source.y + target.y) / 2 + ny * curve

            return (
                <path
                    key={`link-${i}`}
                    d={`M ${source.x} ${source.y} Q ${cx} ${cy} ${target.x} ${target.y}`}
                    stroke={color}
                    strokeWidth={isHighlighted ? 2 : 1}
                    strokeOpacity={opacity}
                    fill="none"
                    style={{ transition: 'stroke-opacity 0.3s ease' }}
                />
            )
        })
    }, [data.links, nodes, effectiveNodeId])

    return <div
        ref={containerRef}
        className="relative w-full h-[60vh] md:h-[700px] bg-black rounded-lg overflow-hidden border border-zinc-900 shadow-2xl transition-all duration-300"
        onClick={() => setSelectedNode(null)} // Background click clears selection
        onPointerDown={(e) => {
            if (e.button !== 0) return
            setIsPanning(true)
            panStart.current = { x: e.clientX, y: e.clientY }
            panOrigin.current = { ...pan }
            movedDuringPan.current = false
                ; (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
            if (!isPanning) return
            const dx = e.clientX - panStart.current.x
            const dy = e.clientY - panStart.current.y
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) movedDuringPan.current = true // Tolerant drag
            setPan({ x: panOrigin.current.x + dx, y: panOrigin.current.y + dy })
        }}
        onPointerUp={(e) => {
            setIsPanning(false)
                ; (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId)
        }}
        onWheel={(e) => {
            if (e.ctrlKey) {
                e.preventDefault()
                const delta = -e.deltaY * 0.001
                setZoom(p => Math.min(3, Math.max(0.2, p + delta)))
            }
        }}
        onMouseMove={(event) => {
            const rect = containerRef.current?.getBoundingClientRect()
            if (!rect) return
            setCursor({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                active: true
            })
        }}
        onMouseLeave={() => setCursor(prev => ({ ...prev, active: false }))}
    >
        {/* --- UI Controls Layer --- */}

        {/* Title / Brand */}
        <div className="absolute top-6 left-6 z-20 pointer-events-none select-none">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-500 bg-clip-text text-transparent">NEURAL WEB</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${isStabilized ? 'bg-zinc-600' : 'bg-amber-500 animate-pulse'} shadow-[0_0_10px_rgba(245,158,11,0.8)]`}></span>
                <span className="text-[10px] text-amber-500 font-mono tracking-widest uppercase">
                    {isStabilized ? 'Network Stabilized' : 'Live Connection Feed'}
                </span>
            </div>
        </div>

        {/* Search Bar */}
        <div className="absolute top-6 right-6 z-20 w-64">
            <div className="relative group">
                <input
                    type="text"
                    placeholder="Search node..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setIsSearching(true); }}
                    onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                    className="w-full bg-zinc-900/80 border border-zinc-800 text-zinc-100 text-sm px-4 py-2 rounded-full focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all backdrop-blur-md placeholder:text-zinc-600"
                />
                <svg className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>

                {/* Search Results Dropdown */}
                {isSearching && searchResults.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                        {searchResults.map(node => (
                            <button
                                key={node.id}
                                onClick={() => handleSearchSelect(node.id)}
                                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-amber-200 transition-colors flex items-center justify-between"
                            >
                                <span>{node.name}</span>
                                <span className="text-[10px] uppercase text-zinc-600">{node.type}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Legend / Actions */}
        <div className="absolute bottom-6 right-6 z-20 flex gap-4 pointer-events-none">
            <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-full px-4 py-2 flex items-center gap-4 text-[10px] uppercase tracking-widest font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
                    <span>Band</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_#0ea5e9]"></span>
                    <span>Musician</span>
                </div>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); resetView(); }}
                className="pointer-events-auto bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur border border-zinc-800 text-zinc-300 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                title="Reset View"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
        </div>


        {/* --- Canvas Layer --- */}
        <div
            className="absolute inset-0"
            style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                transition: isPanning ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
        >
            <svg width={size.width} height={size.height} className="pointer-events-none overflow-visible">
                {/* Glow Filter Def */}
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <g>{renderedLinks}</g>
            </svg>

            {nodes.map(node => {
                // Update highlighting logic: if something is Selected, only that matters. 
                const isSelected = selectedNode === node.id
                const isHovered = hoveredNode === node.id || isSelected

                const isConnected = effectiveNodeId && data.links.some(l =>
                    (l.source === effectiveNodeId && l.target === node.id) ||
                    (l.target === effectiveNodeId && l.source === node.id)
                )
                // If selection exists, dim everything else
                const isDimmed = effectiveNodeId && !isHovered && !isConnected

                // Node Styles
                const baseSize = node.type === 'band' ? 32 : 12
                const currentSize = isHovered ? baseSize * 1.5 : baseSize

                // Colors
                const coreColor = node.type === 'band' ? '#f59e0b' : '#38bdf8'
                const glowColor = node.type === 'band' ? 'rgba(245, 158, 11, 0.6)' : 'rgba(56, 189, 248, 0.5)'

                return (
                    <div
                        key={node.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ease-out"
                        style={{
                            left: node.x,
                            top: node.y,
                            opacity: isDimmed ? 0.2 : 1,
                            zIndex: isHovered ? 50 : 10
                        }}
                        onMouseEnter={() => !selectedNode && setHoveredNode(node.id)}
                        onMouseLeave={() => !selectedNode && setHoveredNode(null)}
                        onClick={(e) => {
                            if (movedDuringPan.current) return
                            e.stopPropagation()

                            if (selectedNode === node.id) {
                                // Use standard navigation if already selected (Double Tap basically)
                                if (node.type === 'band') router.push(`/bands/${node.slug}`)
                                else router.push(`/musicians/${node.slug}`)
                            } else {
                                // First Select
                                setSelectedNode(node.id)
                                setHoveredNode(node.id)
                                // Deep Dive Zoom
                                centerOnNode(node, 2.5)
                            }
                        }}
                    >
                        {/* The Node Visualization */}
                        <div className="relative flex items-center justify-center">

                            {/* 1. Glow Halo */}
                            <div
                                className="absolute rounded-full blur-md transition-all duration-500"
                                style={{
                                    width: currentSize * 2,
                                    height: currentSize * 2,
                                    backgroundColor: glowColor,
                                    opacity: isHovered ? (isSelected ? 1 : 0.8) : 0.3
                                }}
                            />

                            {/* 2. Core Orb */}
                            {node.type === 'band' ? (
                                <div
                                    className={`relative rounded-full overflow-hidden border-2 ${isSelected ? 'border-white' : 'border-amber-500/50'}`}
                                    style={{ width: currentSize, height: currentSize }}
                                >
                                    <div className="absolute inset-0 bg-neutral-900" />
                                    <img
                                        src={node.image_url || BRICK_WALL_SVG}
                                        alt=""
                                        className="relative w-full h-full object-cover rounded-full"
                                        style={{
                                            filter: !node.image_url ? 'brightness(0.8) sepia(0.2)' : 'none'
                                        }}
                                    />
                                </div>
                            ) : (
                                <div
                                    className="relative rounded-full shadow-lg overflow-hidden"
                                    style={{
                                        width: currentSize,
                                        height: currentSize,
                                        backgroundColor: coreColor,
                                        border: `2px solid ${isSelected ? '#ffffff' : coreColor}`
                                    }}
                                >
                                    {/* Fallback pattern for musicians too if desired */}
                                    {!node.image_url && (
                                        <div
                                            className="absolute inset-0 opacity-40"
                                            style={{ backgroundImage: `url("${BRICK_WALL_SVG}")`, backgroundSize: 'cover' }}
                                        />
                                    )}
                                </div>
                            )}

                            {/* 3. Label (Only visible on hover/connect, no more 2-char clutter!) */}
                            <div
                                className={`
                                        absolute left-full ml-3 px-3 py-1 bg-zinc-950/90 border border-zinc-800 rounded-lg whitespace-nowrap z-50 pointer-events-none
                                        transition-all duration-200
                                        ${isHovered ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-90 -translate-x-2'}
                                    `}
                            >
                                <p className="text-zinc-100 font-bold text-xs">{node.name}</p>
                                <p className="text-[9px] uppercase tracking-widest text-zinc-500">{node.type}</p>
                            </div>

                        </div>
                    </div>
                )
            })}
        </div>

        {cursor.active && !selectedNode && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none transition-opacity duration-300">
                <div className="border border-zinc-800 bg-zinc-950/80 px-3 py-1 text-[10px] uppercase tracking-widest text-zinc-400">
                    Click to select · Click again to open
                </div>
            </div>
        )}

        {/* Render Tooltip Logic */}
        {hoveredData && (
            <div
                className={`absolute z-30 transition-all duration-300 ${selectedNode ? 'left-6 top-24' : ''}`}
                style={!selectedNode ? {
                    left: cursor.x + 16,
                    top: cursor.y + 16
                } : {}}
            >
                <div className="w-72 rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
                        <div className={`h-10 w-10 rounded-full border flex items-center justify-center overflow-hidden bg-zinc-900 border-zinc-700`}>
                            {hoveredData.node.image_url ? (
                                <img src={hoveredData.node.image_url} className="w-full h-full object-cover" />
                            ) : (
                                <img src={BRICK_WALL_SVG} alt="" className="w-full h-full object-cover opacity-80" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-zinc-100 leading-tight">{hoveredData.node.name}</p>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-500">{hoveredData.node.type}</p>
                        </div>
                        {selectedNode && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedNode(null); }}
                                className="text-zinc-500 hover:text-red-400"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>

                    <div className="px-4 py-3 space-y-3">
                        {selectedNode && (
                            <button
                                onClick={() => {
                                    if (hoveredData.node.type === 'band') router.push(`/bands/${hoveredData.node.slug}`)
                                    else router.push(`/musicians/${hoveredData.node.slug}`)
                                }}
                                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-md text-xs uppercase tracking-wide transition-colors"
                            >
                                View Full Profile
                            </button>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
                            <div className="rounded-md border border-zinc-800 px-2 py-1 bg-zinc-900/50">
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Bands</p>
                                <p className="text-zinc-100 font-mono">{hoveredData.bandLinks.length}</p>
                            </div>
                            <div className="rounded-md border border-zinc-800 px-2 py-1 bg-zinc-900/50">
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Musicians</p>
                                <p className="text-zinc-100 font-mono">{hoveredData.musicianLinks.length}</p>
                            </div>
                        </div>

                        <div className="max-h-32 overflow-y-auto text-[11px] text-zinc-400 space-y-1 custom-scrollbar">
                            {hoveredData.bandLinks.map(entry => (
                                <div key={entry.target.id} className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500/50" />
                                    <span className="truncate">{entry.target.name}</span>
                                </div>
                            ))}
                            {hoveredData.musicianLinks.map(entry => (
                                <div key={entry.target.id} className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500/50" />
                                    <span className="truncate">{entry.target.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
}
