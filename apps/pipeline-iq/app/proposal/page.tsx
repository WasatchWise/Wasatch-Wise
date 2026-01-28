import { ConnectModule } from '@/components/proposal/ConnectModule'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Download, ArrowRight, Wifi, Tv, Phone as PhoneIcon, Shield, Server } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function ProposalPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Placeholder Logo */}
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">G</div>
                        <span className="font-bold text-xl tracking-tight">Groove</span>
                    </div>
                    <a href="https://getgrooven.com" className="text-sm font-medium hover:underline">
                        Visit Website
                    </a>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid lg:grid-cols-12 gap-12">

                    {/* Left Column: The Pitch */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* Hero */}
                        <div className="space-y-6">
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-3 py-1">
                                Personalized Proposal
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                                Smarter Technology.<br />
                                <span className="text-primary">20-30% Lower Costs.</span>
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                                Stop overpaying for disjointed systems. Groove provides a single, unified solution for WiFi, TV, and Smart Building technology that buyers love and owners trust.
                            </p>
                        </div>

                        {/* Services Grid */}
                        <div className="grid sm:grid-cols-2 gap-6">
                            <ServiceCard
                                icon={<Wifi />}
                                title="Managed WiFi"
                                description="Tier-1 reliability with 24/7/365 US-based support."
                            />
                            <ServiceCard
                                icon={<Tv />}
                                title="DirecTV Stream"
                                description="The entertainment experience your guests actually want."
                            />
                            <ServiceCard
                                icon={<Server />}
                                title="Structured Cabling"
                                description="Low voltage infrastructure done right the first time."
                            />
                            <ServiceCard
                                icon={<Shield />}
                                title="Access Control"
                                description="Secure, cloud-managed entry for modern properties."
                            />
                        </div>

                        {/* Value Props */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border space-y-6">
                            <h3 className="text-2xl font-bold">Why Partners Choose Groove</h3>
                            <ul className="space-y-4">
                                <ValueProp text="One Point of Contact for All Technology" />
                                <ValueProp text="In-House Engineering & Support (No Outsourcing)" />
                                <ValueProp text="Preferred Vendor Pricing (Direct to Manufacturer)" />
                                <ValueProp text="Future-Proof Infrastructure Design" />
                            </ul>
                        </div>

                        {/* Downloads */}
                        <div className="border-t pt-8">
                            <h4 className="font-semibold mb-4">Detailed Specifications</h4>
                            <Button variant="outline" size="lg" asChild className="h-14">
                                <a href="/assets/SALES_SHEET.pdf" target="_blank" download>
                                    <Download className="mr-2 h-5 w-5 text-muted-foreground" />
                                    Download Full Sales Sheet (PDF)
                                </a>
                            </Button>
                        </div>

                    </div>

                    {/* Right Column: The Action (Sticky) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24">
                            <ConnectModule />

                            <div className="mt-8 text-center text-sm text-slate-500">
                                <p>&ldquo;Groove didn&apos;t just install our technology - they helped us close deals faster.&rdquo;</p>
                                <p className="font-semibold mt-1">— Rangers Village Development</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function ServiceCard({ icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="flex gap-4 p-4 rounded-xl bg-white border hover:border-primary/50 transition-colors">
            <div className="h-10 w-10 shrink-0 bg-blue-50 text-primary rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
        </div>
    )
}

function ValueProp({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
            <span className="text-lg text-slate-700">{text}</span>
        </li>
    )
}
