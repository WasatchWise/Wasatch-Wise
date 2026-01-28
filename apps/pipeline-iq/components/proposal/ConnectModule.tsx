'use client'

import { Phone, Mail, Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function ConnectModule() {
    return (
        <Card className="p-6 bg-card border-none shadow-xl ring-1 ring-black/5">
            <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarImage src="/assets/Mike.png" alt="Mike Sartain" />
                    <AvatarFallback>MS</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold text-lg">Mike Sartain</h3>
                    <p className="text-sm text-muted-foreground">Director of Business Development</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="flex h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs font-medium text-green-600">Available Now</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <Button className="w-full justify-start text-lg h-12" size="lg" asChild>
                    <a href="tel:801-396-6534">
                        <Phone className="mr-3 h-5 w-5 fill-current" />
                        Call Me Directly
                    </a>
                </Button>

                <Button variant="outline" className="w-full justify-start text-lg h-12" size="lg" asChild>
                    <a href="mailto:msartain@getgrooven.com">
                        <Mail className="mr-3 h-5 w-5" />
                        Email Me
                    </a>
                </Button>

                <Button variant="secondary" className="w-full justify-start text-lg h-12" size="lg" asChild>
                    <a href="#" onClick={(e) => { e.preventDefault(); alert("Calendar link coming soon!") }}>
                        <Calendar className="mr-3 h-5 w-5" />
                        Book 15 Min Chat
                    </a>
                </Button>
            </div>

            <div className="mt-6 pt-6 border-t text-center">
                <p className="text-xs text-muted-foreground mb-3">Trusted by 920+ properties across the US</p>
                <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <svg key={i} className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                </div>
            </div>
        </Card>
    )
}
