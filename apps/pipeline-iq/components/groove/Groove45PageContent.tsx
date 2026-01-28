'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import {
    Wifi, Tv, Shield, Phone as PhoneIcon, CheckCircle2,
    Download, Play, Star, Quote, Building2, Hotel,
    Users, GraduationCap, ChevronLeft, ChevronRight, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TESTIMONIALS, type Testimonial } from '@/lib/groove/testimonials'

const VERTICAL_DATA = {
    hospitality: {
        title: "The Tech Guest Reviews Actually Mention.",
        subtitle: "Groove delivers 5-star technology infrastructure for hotels. No more WiFi complaints, just seamless entertainment and connectivity.",
        icon: <Hotel className="h-6 w-6" />,
        features: [
            { title: "Managed WiFi", desc: "Tier-1 reliability so guests never drop a call or stream." },
            { title: "DirecTV Stream", desc: "The ultimate in-room entertainment experience." },
            { title: "Network Monitoring", desc: "We see issues before your front desk does." }
        ],
        stats: [
            { label: "Guest Satisfaction", value: "+28%" },
            { label: "WiFi Speed", value: "Gigabit" }
        ]
    },
    multifamily: {
        title: "Modern Tech for Modern Renters.",
        subtitle: "Future-proof your property with high-speed internet, smart locks, and unified building management that residents love.",
        icon: <Building2 className="h-6 w-6" />,
        features: [
            { title: "Smart Access", desc: "Keyless entry for units, gates, and amenities." },
            { title: "Della OS", desc: "Unified resident app for everything from rent to lighting." },
            { title: "Community WiFi", desc: "Reliable internet from the lobby to the rooftop." }
        ],
        stats: [
            { label: "Amenity Fees", value: "+$15/mo" },
            { label: "Leasing Velocity", value: "+12%" }
        ]
    },
    senior_living: {
        title: "Safe, Connected, Independent.",
        subtitle: "Enhancing the lives of residents and staff with technology designed for care, safety, and family connectivity.",
        icon: <Users className="h-6 w-6" />,
        features: [
            { title: "Family Portal", desc: "Keeping families connected with seamless video calls." },
            { title: "Safety DAS", desc: "Reliable emergency radio coverage throughout the building." },
            { title: "Leak Detection", desc: "Preventing damage before it happens with smart sensors." }
        ],
        stats: [
            { label: "Family Confidence", value: "3x Higher" },
            { label: "Response Time", value: "-40%" }
        ]
    },
    student_commercial: {
        title: "High-Performance Tech for High-Traffic Sites.",
        subtitle: "From student housing to commercial hubs, we provide the backbone that keeps people productive and entertained.",
        icon: <GraduationCap className="h-6 w-6" />,
        features: [
            { title: "Gigabit Circuits", desc: "Lightning fast speed for study and work." },
            { title: "Access Control", desc: "Secure, cloud-managed entry for high-traffic zones." },
            { title: "Infrastructure", desc: "Structured cabling done right the first time." }
        ],
        stats: [
            { label: "Network Capacity", value: "Unlimited" },
            { label: "Uptime", value: "99.99%" }
        ]
    },
    general: {
        title: "Technology Solutions for Complex Properties.",
        subtitle: "One partner for TV, WiFi, Phones, and Building Technology Infrastructure. We handle the complexity so you can focus on ownership.",
        icon: <Building2 className="h-6 w-6" />,
        features: [
            { title: "Unified Design", desc: "One roof, one point person, fewer headaches." },
            { title: "Groove Guarantee", desc: "On Time, On Scope, On Budget, On Going." },
            { title: "Technical Support", desc: "US-based support available 24/7/365." }
        ],
        stats: [
            { label: "Cost Savings", value: "20-30%" },
            { label: "Vendor Count", value: "Just 1" }
        ]
    }
}

export default function Groove45PageContent() {
    const searchParams = useSearchParams()
    const verticalParam = searchParams.get('vertical') as keyof typeof VERTICAL_DATA
    const vertical = VERTICAL_DATA[verticalParam] || VERTICAL_DATA.general
    const calendarUrl = process.env.NEXT_PUBLIC_MIKE_CALENDAR_URL ||
        'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2ga6J3pZ5ZVkr6Ols8ZAdA5ddeqd5EdWKytuPqZUBCTGPb8GnwueYExD068PFPGF4V81spLbBM'
    const activityId = searchParams.get('aid')
    const contactId = searchParams.get('cid')
    const projectId = searchParams.get('pid')
    const emailVariant = searchParams.get('variant')
    const source = searchParams.get('src') || 'landing'
    const calendarUrlLight = (() => {
        try {
            const url = new URL(calendarUrl)
            url.searchParams.set('mode', 'light')
            return url.toString()
        } catch {
            return calendarUrl
        }
    })()

    // Filter testimonials relative to vertical
    const filteredTestimonials = TESTIMONIALS.filter(t =>
        t.vertical === verticalParam || t.vertical === 'general' || !verticalParam
    )

    const [currentReview, setCurrentReview] = useState(0)
    const [showInvite, setShowInvite] = useState(false)

    const nextReview = useCallback(() => setCurrentReview((prev) => (prev + 1) % filteredTestimonials.length), [filteredTestimonials.length])
    const prevReview = useCallback(() => setCurrentReview((prev) => (prev === 0 ? filteredTestimonials.length - 1 : prev - 1)), [filteredTestimonials.length])

    useEffect(() => {
        const timer = setInterval(nextReview, 8000)
        return () => clearInterval(timer)
    }, [nextReview])

    useEffect(() => {
        const inviteTimer = setTimeout(() => setShowInvite(true), 12000)
        return () => clearTimeout(inviteTimer)
    }, [])

    const trackEngagement = useCallback(async (payload: {
        event: string
        elementId: string
        elementType: 'product-link' | 'cta' | 'section' | 'vertical-element' | 'calendar' | 'social' | 'video' | 'other'
        elementLabel?: string
        elementUrl?: string
    }) => {
        try {
            await fetch('/api/engagement/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...payload,
                    activityId,
                    contactId,
                    projectId,
                    vertical: verticalParam || 'general',
                    emailVariant,
                    metadata: {
                        source,
                        page: 'groove-in-45-seconds'
                    }
                })
            })
        } catch {
            // Tracking should never block the UX
        }
    }, [activityId, contactId, projectId, verticalParam, emailVariant, source])

    useEffect(() => {
        trackEngagement({
            event: 'landing_view',
            elementId: 'landing-view',
            elementType: 'section',
            elementLabel: 'Groove in 45 Seconds landing'
        })
    }, [trackEngagement])

    useEffect(() => {
        if (!showInvite) return
        trackEngagement({
            event: 'invite_modal_open',
            elementId: 'invite-modal',
            elementType: 'cta',
            elementLabel: 'Invite modal opened'
        })
    }, [showInvite, trackEngagement])

    return (
        <div className="min-h-screen bg-white">
            {showInvite && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 px-4">
                    <div className="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl border border-brand-lightblue/20">
                        <button
                            onClick={() => setShowInvite(false)}
                            className="absolute right-4 top-4 rounded-full p-2 text-slate-500 hover:bg-slate-100"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <Badge className="bg-brand-orange text-brand-blue mb-4">Let&apos;s Talk</Badge>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">
                            Want the quick version from Mike?
                        </h3>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            If you&apos;d like a fast walk-through on your project, grab a time on Mike&apos;s
                            calendar or call him directly. He&apos;ll keep it tight and practical.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button className="h-12 text-base bg-brand-orange text-brand-blue hover:bg-brand-orange/90" asChild>
                                <a
                                    href={calendarUrlLight}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => trackEngagement({
                                        event: 'schedule_click',
                                        elementId: 'cta-schedule-call',
                                        elementType: 'calendar',
                                        elementLabel: 'Schedule with Mike',
                                        elementUrl: calendarUrlLight
                                    })}
                                >
                                    Schedule with Mike
                                </a>
                            </Button>
                            <Button variant="outline" className="h-12 text-base border-brand-lightblue text-brand-lightblue hover:bg-brand-lightblue hover:text-white" asChild>
                                <a
                                    href="tel:801-396-6534"
                                    onClick={() => trackEngagement({
                                        event: 'call_click',
                                        elementId: 'cta-call-mike',
                                        elementType: 'cta',
                                        elementLabel: 'Call Mike Now',
                                        elementUrl: 'tel:801-396-6534'
                                    })}
                                >
                                    <PhoneIcon className="mr-2 h-5 w-5" />
                                    Call Mike Now
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* Header */}
            <header className="sticky top-0 z-50 bg-brand-blue shadow-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/assets/Groove Logo.svg"
                            alt="Groove Technology Solutions"
                            width={160}
                            height={40}
                            className="h-8 sm:h-10 w-auto"
                            priority
                        />
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6">
                        <a
                            href="https://search.google.com/local/reviews?placeid=ChIJwXhXUX0LUocR8p8V8V8V8V8"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center gap-1 group"
                        >
                            <Star className="w-4 h-4 fill-[#FFB700] text-[#FFB700] group-hover:scale-110 transition-transform" />
                            <span className="hidden sm:inline">Google Reviews</span>
                        </a>
                        <Button
                            className="bg-brand-orange text-brand-blue hover:bg-brand-orange/90"
                            size="sm"
                            asChild
                        >
                            <a
                                href="https://getgrooven.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackEngagement({
                                    event: 'main_site_click',
                                    elementId: 'cta-main-site',
                                    elementType: 'cta',
                                    elementLabel: 'Visit Main Site',
                                    elementUrl: 'https://getgrooven.com'
                                })}
                            >
                                Visit Main Site
                            </a>
                        </Button>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden text-white bg-brand-blue">
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,_rgba(0,153,255,0.22)_1px,_transparent_1px)] [background-size:24px_24px]" />
                    <div className="absolute inset-0 opacity-30 bg-gradient-to-b from-brand-blue via-brand-blue/80 to-[#1B6FA0]" />
                    <div className="container mx-auto px-4 relative z-10 py-16 lg:py-24">
                        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] items-center">
                            <div className="text-left">
                                <Badge className="mb-6 bg-white/10 text-white border-white/30 px-4 py-1.5 text-sm uppercase tracking-wider font-semibold">
                                    Groove Overview
                                </Badge>
                                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                                    {vertical.title}
                                </h1>
                                <p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed">
                                    {vertical.subtitle}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Button className="h-12 px-6 text-base bg-brand-orange text-brand-blue hover:bg-brand-orange/90" asChild>
                                        <a
                                            href={calendarUrlLight}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => trackEngagement({
                                                event: 'schedule_click',
                                                elementId: 'cta-hero-schedule',
                                                elementType: 'calendar',
                                                elementLabel: 'Schedule 10 Minutes with Mike',
                                                elementUrl: calendarUrlLight
                                            })}
                                        >
                                            Schedule 10 Minutes with Mike
                                        </a>
                                    </Button>
                                    <Button variant="outline" className="h-12 px-6 text-base border-brand-lightblue text-brand-lightblue hover:bg-brand-lightblue hover:text-white" asChild>
                                        <a
                                            href="tel:801-396-6534"
                                            onClick={() => trackEngagement({
                                                event: 'call_click',
                                                elementId: 'cta-hero-call',
                                                elementType: 'cta',
                                                elementLabel: 'Call Mike Now (Hero)',
                                                elementUrl: 'tel:801-396-6534'
                                            })}
                                        >
                                            <PhoneIcon className="mr-2 h-5 w-5" />
                                            Call Mike Now
                                        </a>
                                    </Button>
                                </div>
                                <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/70">
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-brand-orange" />
                                        One technology partner. Total accountability.
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-brand-orange" />
                                        In-house teams from design to support.
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-center lg:justify-center">
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative h-[260px] w-[260px] sm:h-[300px] sm:w-[300px]">
                                        <Image
                                            src="/assets/Mike.png"
                                            alt="Mike Sartain"
                                            fill
                                            sizes="(min-width: 1024px) 300px, 260px"
                                            className="object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
                                            priority
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Proof Section (Stats) */}
                <section className="bg-[#F5F5F5] border-y py-12">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {vertical.stats.concat([{ label: "Reviews", value: "920+" }, { label: "Rating", value: "4.9 ⭐" }]).map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold text-brand-blue mb-1">{stat.value}</div>
                                    <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-24 container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">The Single Partner Advantage</h2>
                        <p className="text-xl text-slate-600">Everything you need, none of the sprawl.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {vertical.features.map((feature, i) => (
                            <Card key={i} className="p-8 border border-brand-lightblue/20 shadow-lg hover:shadow-xl transition-shadow bg-white">
                                <div className="h-12 w-12 bg-brand-blue/10 rounded-xl flex items-center justify-center mb-6 shadow-sm text-brand-lightblue">
                                    {i === 0 ? <Wifi className="h-6 w-6" /> : i === 1 ? <Tv className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Testimonials Carousel (Google Style) */}
                <section className="py-24 bg-brand-blue text-white overflow-hidden">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <div className="flex items-center justify-center gap-2 mb-12">
                            <div className="flex text-yellow-400">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 fill-current" />)}
                            </div>
                            <span className="font-bold text-lg text-white">920+ Verified Google Reviews</span>
                        </div>

                        <div className="relative">
                            <div className="min-h-[250px] flex flex-col items-center justify-center text-center px-12 transition-all duration-500">
                                <Quote className="h-12 w-12 text-white/30 mb-8" />
                                <p className="text-2xl md:text-3xl font-medium mb-8 leading-relaxed italic">
                                    &ldquo;{filteredTestimonials[currentReview]?.quote}&rdquo;
                                </p>
                                <div>
                                    <p className="font-bold text-xl">{filteredTestimonials[currentReview]?.author}</p>
                                    <p className="text-white/70">{filteredTestimonials[currentReview]?.title} — {filteredTestimonials[currentReview]?.company}</p>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none">
                                <button onClick={prevReview} aria-label="Previous Review" title="Previous Review" className="pointer-events-auto p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                                    <ChevronLeft className="h-8 w-8" />
                                </button>
                                <button onClick={nextReview} aria-label="Next Review" title="Next Review" className="pointer-events-auto p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                                    <ChevronRight className="h-8 w-8" />
                                </button>
                            </div>
                        </div>

                        {/* Pagination Dots */}
                        <div className="flex justify-center gap-2 mt-12">
                            {filteredTestimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentReview(i)}
                                    className={`h-2 w-2 rounded-full transition-all ${i === currentReview ? 'w-8 bg-[#FFA500]' : 'bg-white/30'}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* The "Mike" Card & PDF */}
                <section className="py-24 container mx-auto px-4 max-w-4xl">
                    <div className="bg-brand-blue rounded-3xl py-8 px-8 md:py-12 md:px-12 text-white">
                        <div className="space-y-6">
                            <Badge className="bg-brand-orange text-brand-blue">The Groove Guarantee</Badge>
                            <h2 className="text-3xl font-bold leading-tight">On Time. On Scope. On Budget. On Going.</h2>
                            <p className="text-white/80">
                                If we fail and it&apos;s our fault, we &ldquo;own it&rdquo; and make it right with a $500 gift card. No questions asked.
                            </p>
                            <div className="space-y-3 pt-4">
                                <Button className="w-full bg-white text-brand-blue hover:bg-slate-100 h-14 text-lg" asChild>
                                    <a href="/assets/SALES_SHEET.pdf" target="_blank" download>
                                        <Download className="mr-2 h-5 w-5" />
                                        Download Sales Sheet (PDF)
                                    </a>
                                </Button>
                                <Button variant="outline" className="w-full border-brand-orange text-brand-orange hover:bg-white hover:text-brand-blue h-14 text-lg" asChild>
                                    <a href="tel:801-396-6534">
                                        <PhoneIcon className="mr-2 h-5 w-5" />
                                        Call Mike Sartain
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-50 border-t py-12 text-center text-slate-500">
                <div className="container mx-auto px-4">
                    <p>© {new Date().getFullYear()} Groove Technology Solutions. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
