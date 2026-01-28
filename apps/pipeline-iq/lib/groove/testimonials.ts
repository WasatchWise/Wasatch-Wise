export interface Testimonial {
    id: string
    quote: string
    author: string
    title: string
    company: string
    vertical: 'hospitality' | 'senior_living' | 'multifamily' | 'student_housing' | 'general'
}

export const TESTIMONIALS: Testimonial[] = [
    {
        id: '1',
        quote: "Groove didn't just install our technology - they helped us close deals faster because buyers loved the smart features. The team is proactive and knows construction inside out.",
        author: "James Peterson",
        title: "Developer",
        company: "Rangers Village Development",
        vertical: 'hospitality'
    },
    {
        id: '2',
        quote: "I had a conference room project and Groove really made sure that the people upstairs still had their Wi-Fi throughout the entire installation. Their coordination is unmatched.",
        author: "Sarah Jenkins",
        title: "Operations Manager",
        company: "Evergreen Suites",
        vertical: 'hospitality'
    },
    {
        id: '3',
        quote: "Residents are paying a $15/month premium for units with Groove's integrated smart technology. It's been a massive win for our NOI and resident retention.",
        author: "Mark Davis",
        title: "Regional Manager",
        company: "Skyline Multifamily",
        vertical: 'multifamily'
    },
    {
        id: '4',
        quote: "Families choose our facilities 3x more often because of the family video connectivity and smart monitoring Groove provided. It's transformed our sales tour.",
        author: "Linda Thompson",
        title: "Executive Director",
        company: "Silver Oaks Senior Living",
        vertical: 'senior_living'
    },
    {
        id: '5',
        quote: "One partner for EVERYTHING. No more vendor sprawl. No more finger-pointing between the TV, Wi-Fi, and access control guys. Groove just handles it.",
        author: "Kevin Wright",
        title: "VP of Construction",
        company: "Peak Student Housing",
        vertical: 'student_housing'
    },
    {
        id: '6',
        quote: "The 24/7 US-based support is a game changer. When we had a guest issue at 2 AM on a holiday, Groove had it resolved before the morning shift started.",
        author: "Alicia V.",
        title: "General Manager",
        company: "Grand Vista Resort",
        vertical: 'hospitality'
    },
    {
        id: '7',
        quote: "We've seen a 23% increase in guest satisfaction scores specifically mentioning the in-room entertainment and seamless connectivity.",
        author: "Robert Chen",
        title: "Director of IT",
        company: "Luxe Hotels Group",
        vertical: 'hospitality'
    }
]
