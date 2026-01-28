'use client';

import { useState } from 'react';

interface FAQItem {
    question: string;
    answer: string;
}

const DEFAULT_FAQS: FAQItem[] = [
    {
        question: "What is the best time to visit Utah national parks?",
        answer: "The best time to visit Utah's national parks (The Mighty 5) is during spring (April-May) and fall (September-October) when temperatures are mild. Summer can be extremely hot (over 100°F), and winter brings snow and road closures."
    },
    {
        question: "Do I need a reservation for Zion National Park?",
        answer: "You do not need a reservation to enter Zion National Park, but you DO need a reservation to hike Angels Landing. The park also uses a mandatory shuttle system for the scenic drive from March through November."
    },
    {
        question: "What should I pack for a trip to Utah?",
        answer: "Pack layers! Utah weather fluctuates wildly. Essentials include: hiking boots, sun hat, sunscreen, plenty of water (hydration pack recommended), and a warm jacket for evenings, even in summer."
    },
    {
        question: "Is Salt Lake City worth visiting?",
        answer: "Absolutely! Salt Lake City offers world-class skiing within 30 minutes of the airport, a vibrant food scene, historic Temple Square, and easy access to the Great Salt Lake and Antelope Island."
    },
    {
        question: "Can I buy alcohol in Utah?",
        answer: "Yes. Beer up to 5% ABV is sold in grocery stores. Higher alcohol beer, wine, and spirits are sold at state-run liquor stores. Bars and restaurants serve alcohol, but food must be ordered with drinks at restaurants."
    }
];

export default function FAQ({ faqs = DEFAULT_FAQS }: { faqs?: FAQItem[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    // Generate Schema.org JSON-LD
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <section className="py-12 bg-gray-50 rounded-2xl my-8">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Frequently Asked Questions</h2>

                {/* Schema Markup */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />

                <dl className="space-y-4">
                    {faqs.map((faq, index) => {
                        const answerId = `faq-answer-${index}`;
                        const questionId = `faq-question-${index}`;
                        const isOpen = openIndex === index;
                        
                        return (
                            <div
                                key={index}
                                className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
                            >
                                <dt>
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : index)}
                                        className="w-full flex items-center justify-between p-4 text-left font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                                        aria-expanded={isOpen ? "true" : "false"}
                                        aria-controls={answerId}
                                        id={questionId}
                                    >
                                        <span>{faq.question}</span>
                                        <span 
                                            className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                            aria-hidden="true"
                                        >
                                            ▼
                                        </span>
                                    </button>
                                </dt>
                                <dd
                                    id={answerId}
                                    role="region"
                                    aria-labelledby={questionId}
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <div className="p-4 pt-0 text-gray-600 leading-relaxed border-t border-gray-100">
                                        {faq.answer}
                                    </div>
                                </dd>
                            </div>
                        );
                    })}
                </dl>
            </div>
        </section>
    );
}
