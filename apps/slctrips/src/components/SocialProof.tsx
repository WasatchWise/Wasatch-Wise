'use client';

import Image from 'next/image';

export default function SocialProof() {
    return (
        <section className="py-12 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
                    Trusted by 10,000+ Utah Explorers & Featured In
                </p>
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="col-span-1 flex justify-center">
                        <span className="text-xl font-bold text-gray-400">KSL TV</span>
                    </div>
                    <div className="col-span-1 flex justify-center">
                        <span className="text-xl font-bold text-gray-400">Salt Lake Tribune</span>
                    </div>
                    <div className="col-span-1 flex justify-center">
                        <span className="text-xl font-bold text-gray-400">Deseret News</span>
                    </div>
                    <div className="col-span-1 flex justify-center">
                        <span className="text-xl font-bold text-gray-400">Utah.com</span>
                    </div>
                    <div className="col-span-1 flex justify-center hidden lg:flex">
                        <span className="text-xl font-bold text-gray-400">Visit Utah</span>
                    </div>
                </div>

                {/* Trust Metrics */}
                <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 text-center">
                    <div className="bg-blue-50 rounded-xl p-6">
                        <div className="text-3xl font-bold text-blue-600 mb-1">1,600+</div>
                        <div className="text-sm text-gray-600 font-medium">Destinations Mapped</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-6">
                        <div className="text-3xl font-bold text-green-600 mb-1">50k+</div>
                        <div className="text-sm text-gray-600 font-medium">Monthly Views</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-6">
                        <div className="text-3xl font-bold text-purple-600 mb-1">4.9/5</div>
                        <div className="text-sm text-gray-600 font-medium">User Rating</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
