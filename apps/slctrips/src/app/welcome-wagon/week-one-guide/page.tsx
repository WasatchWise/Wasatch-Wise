'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShareButton from '@/components/ShareButton';

// Checklist items with IDs for persistence
const CHECKLIST_ITEMS = [
  { id: 'electricity', text: 'Set up electricity service (Rocky Mountain Power)' },
  { id: 'gas', text: 'Set up natural gas service (Dominion Energy Utah)' },
  { id: 'water', text: 'Call to set up water, sewer, and trash service (SLC Public Utilities)' },
  { id: 'internet', text: 'Research and set up internet service' },
  { id: 'renter_handbook', text: 'If renting: Review Utah Renter\'s Handbook and document unit condition' },
  { id: 'water_softener', text: 'If owning/renting a house: Consult plumber about water softener' },
  { id: 'grid_system', text: 'Learn the SLC grid system (visit Temple Square as center point)' },
  { id: 'dmv', text: 'Start DMV process (vehicle registration and driver\'s license)' },
  { id: 'pcp', text: 'Establish care with a Primary Care Provider (PCP)' },
  { id: 'sunscreen', text: 'Stock up on sunscreen and increase water intake' },
  { id: 'free_fare', text: 'Explore Downtown using the Free Fare Zone' },
  { id: 'coffee_shop', text: 'Visit a local coffee shop and become a regular' },
  { id: 'sweet_lake', text: 'Try Sweet Lake Biscuits and Limeade for your first iconic SLC meal' },
  { id: 'ensign_peak', text: 'Hike Ensign Peak for your first taste of Utah\'s outdoors' },
  { id: 'emergency_contacts', text: 'Save all emergency contact numbers in your phone' },
];

// Helper function to format phone numbers for tel: links
function formatPhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

// Helper function to create Google Maps link
function createMapLink(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

// Copy to clipboard function
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    // Could add toast notification here
  });
}

// Phone number component with click-to-call and copy
function PhoneNumber({ phone, label }: { phone: string; label?: string }) {
  const telLink = `tel:${formatPhoneNumber(phone)}`;
  const displayPhone = phone.replace(/\d{3}-\d{3}-\d{4}/g, (match) => {
    return match.replace(/-/g, '‑'); // Use non-breaking hyphen for display
  });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <a 
        href={telLink} 
        className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
      >
        {label || phone}
      </a>
      <button
        onClick={() => copyToClipboard(formatPhoneNumber(phone))}
        className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1 rounded hover:bg-gray-100"
        title="Copy phone number"
        aria-label="Copy phone number"
      >
        📋
      </button>
    </div>
  );
}

// Address component with map link
function Address({ address, name }: { address: string; name?: string }) {
  const mapLink = createMapLink(address);
  
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-700">{address}</span>
      <a
        href={mapLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap"
        title="Open in Google Maps"
      >
        🗺️ Map
      </a>
    </div>
  );
}

export default function WeekOneGuidePage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);

  // Load saved checklist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('week1-checklist');
    if (saved) {
      try {
        const savedItems = JSON.parse(saved);
        setCheckedItems(new Set(savedItems));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Update progress when checked items change
  useEffect(() => {
    const newProgress = Math.round((checkedItems.size / CHECKLIST_ITEMS.length) * 100);
    setProgress(newProgress);
    // Save to localStorage
    localStorage.setItem('week1-checklist', JSON.stringify(Array.from(checkedItems)));
  }, [checkedItems]);

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
        {/* Print stylesheet will be added via CSS */}
        <style jsx global>{`
          @media print {
            .no-print { display: none !important; }
            .print-break { page-break-after: always; }
            body { background: white !important; }
            .shadow-lg { box-shadow: none !important; }
          }
        `}</style>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Header Section */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-block mb-4">
              <span className="text-6xl">🏔️</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Welcome to Utah!
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600 mb-4">
              Week One Welcome Wagon Kit
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-2">
              Moving is an adventure, and Salt Lake City (SLC) is the perfect launching point for leveling up your life, trading city smog for mountain views, and traffic jams for trailheads.
            </p>
            <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto">
              This kit provides the essential information and urgent steps you need to complete during your first week, focusing on <strong className="text-blue-600">The Basecamp Blueprint</strong> of housing, utilities, and immediate orientation.
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="no-print bg-white rounded-lg shadow-md p-4 mb-8 flex flex-wrap items-center justify-between gap-4 sticky top-4 z-10 animate-slideUp">
            <div className="flex items-center gap-4 flex-wrap">
              <Link 
                href="/welcome-wagon" 
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-2 transition-colors"
              >
                ← Back to Welcome Wagon
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <span className="text-sm text-gray-600">Progress: <strong className="text-blue-600">{progress}%</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                aria-label="Print this page"
              >
                🖨️ Print
              </button>
              <ShareButton
                url={typeof window !== 'undefined' ? window.location.href : ''}
                title="Week 1 Welcome Wagon Kit - Salt Lake City"
                description="Comprehensive Week 1 Survival Guide for new Utah residents - essential relocation checklist"
                variant="dropdown"
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="no-print mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-bold text-gray-900">{progress}% Complete</span>
            </div>
            <div className="bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 via-blue-500 to-blue-600 h-full transition-all duration-1000 ease-out rounded-full relative"
                style={{ width: `${progress}%` }}
              >
                {progress > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              {checkedItems.size} of {CHECKLIST_ITEMS.length} tasks completed
            </p>
            {progress === 100 && (
              <div className="mt-3 text-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold animate-celebrate">
                  🎉 Week 1 Complete! 🎉
                </span>
              </div>
            )}
          </div>

          {/* Table of Contents */}
          <div className="no-print bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📑 Quick Navigation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <a href="#utilities" className="text-blue-600 hover:text-blue-800 hover:underline">🏡 Utilities Setup</a>
              <a href="#emergency" className="text-blue-600 hover:text-blue-800 hover:underline">🚨 Emergency Contacts</a>
              <a href="#plumbing" className="text-blue-600 hover:text-blue-800 hover:underline">🛠️ Hard Water & Plumbing</a>
              <a href="#renters" className="text-blue-600 hover:text-blue-800 hover:underline">⚖️ Renters' Rights</a>
              <a href="#grid" className="text-blue-600 hover:text-blue-800 hover:underline">🗺️ SLC Grid System</a>
              <a href="#dmv" className="text-blue-600 hover:text-blue-800 hover:underline">🚗 DMV & Transportation</a>
              <a href="#health" className="text-blue-600 hover:text-blue-800 hover:underline">⚕️ Health & Altitude</a>
              <a href="#coffee" className="text-blue-600 hover:text-blue-800 hover:underline">☕ Coffee Shops</a>
              <a href="#restaurants" className="text-blue-600 hover:text-blue-800 hover:underline">🍽️ Restaurants</a>
              <a href="#neighborhoods" className="text-blue-600 hover:text-blue-800 hover:underline">🏘️ Neighborhoods</a>
              <a href="#hike" className="text-blue-600 hover:text-blue-800 hover:underline">⛰️ First Hike</a>
              <a href="#checklist" className="text-blue-600 hover:text-blue-800 hover:underline">🎯 Action Checklist</a>
            </div>
          </div>

          {/* Week 1 Focus */}
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-xl p-8 md:p-10 mb-8 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">🎯 Week 1 Focus: The Basecamp Blueprint</h2>
            <p className="text-lg md:text-xl leading-relaxed text-blue-50">
              Think of your first week in Salt Lake City as setting up a high-altitude basecamp before a major mountain ascent. You must immediately secure your core needs (utilities, shelter, hydration) and learn the terrain (the grid system) before you can safely begin exploring the magnificent peaks around you.
            </p>
          </section>

          {/* Utilities Section */}
          <section id="utilities" className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 scroll-mt-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">🏡</span>
              Urgent Housing & Utility Setup
            </h2>
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
              <p className="text-base md:text-lg text-gray-800 font-semibold">
                ⚠️ Disregarding utility setup could leave you sitting in the dark, so planning this immediately is crucial.
              </p>
            </div>

            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Utility Service</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action Required</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact Information</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">⚡ Electricity</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Set up service online or by phone. You will need your Social Security number (SSN) and driver's license (DL).</td>
                    <td className="px-4 md:px-6 py-4 text-sm">
                      <PhoneNumber phone="(888) 221-7070" label="Rocky Mountain Power: (888) 221-7070" />
                      <span className="text-gray-500 text-xs block mt-1">24/7 residential line</span>
                    </td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-blue-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">🔥 Natural Gas</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Apply via phone or complete the New Service Application online. Requires basic information, including SSN and DL number.</td>
                    <td className="px-4 md:px-6 py-4 text-sm">
                      <PhoneNumber phone="1-800-323-5517" label="Dominion Energy Utah: 1-800-323-5517" />
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">💧 Water, Sewer, & Trash</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">You must call customer service. Currently, there is no online setup available for residential water utilities. The representative will also arrange sewer and trash services and deliver bins if necessary.</td>
                    <td className="px-4 md:px-6 py-4 text-sm">
                      <PhoneNumber phone="(801) 483-6900" label="SLC Public Utilities: (801) 483-6900" />
                      <span className="text-gray-500 text-xs block mt-1">Mon–Fri, 8 a.m. to 5 p.m.</span>
                    </td>
                  </tr>
                  <tr className="bg-red-50 hover:bg-red-100 transition-colors border-l-4 border-red-500">
                    <td className="px-4 md:px-6 py-4 font-semibold text-red-900">🚨 Utility Emergency</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">For water, sewer, or storm drain emergencies outside business hours.</td>
                    <td className="px-4 md:px-6 py-4 text-sm">
                      <PhoneNumber phone="(801) 483-6700" label="SLC Public Utilities Emergency: (801) 483-6700" />
                      <span className="text-red-600 text-xs font-semibold block mt-1">24/7 Emergency Hotline</span>
                    </td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-blue-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">🌐 Internet</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">The average monthly internet bill in SLC is $74.44. Xfinity (97.8% availability) and Viasat (100% availability) are popular providers.</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Check local providers like Quantum Fiber, Xfinity, Viasat, and Rise Broadband</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Emergency Contacts */}
          <section id="emergency" className="bg-gradient-to-br from-red-50 to-red-100 border-4 border-red-500 rounded-xl shadow-xl p-6 md:p-8 mb-8 scroll-mt-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">🚨</span>
              Emergency Contact Details
            </h2>
            <p className="text-red-900 font-semibold mb-4 text-lg">Save These Numbers Now!</p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-red-200 bg-white rounded-lg overflow-hidden">
                <thead className="bg-red-600 text-white">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Service</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Contact</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-200">
                  <tr className="bg-red-50 hover:bg-red-100 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-bold text-red-900 text-lg">Emergency</td>
                    <td className="px-4 md:px-6 py-4">
                      <PhoneNumber phone="911" label="911" />
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">General emergency services (Police, Fire, Ambulance)</td>
                  </tr>
                  <tr className="hover:bg-red-100 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">Police Non-Emergency</td>
                    <td className="px-4 md:px-6 py-4">
                      <PhoneNumber phone="(801) 799-3000" />
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Salt Lake City Police Department non-emergency line</td>
                  </tr>
                  <tr className="bg-red-50 hover:bg-red-100 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">Fire Non-Emergency</td>
                    <td className="px-4 md:px-6 py-4">
                      <PhoneNumber phone="(801) 799-4231" />
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Salt Lake City Fire Department non-emergency line</td>
                  </tr>
                  <tr className="hover:bg-red-100 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">Water/Sewer/Storm Drain Emergency</td>
                    <td className="px-4 md:px-6 py-4">
                      <PhoneNumber phone="(801) 483-6700" />
                      <span className="text-red-600 text-xs font-semibold block mt-1">24/7</span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">SLC Public Utilities Emergency Hotline (for non-business hours)</td>
                  </tr>
                  <tr className="bg-red-50 hover:bg-red-100 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">Plumbing/Hard Water Issues</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Roto-Rooter (24/7) or Manwill Plumbing and Heating (24-hour)</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Recommended providers who specialize in water softener installation</td>
                  </tr>
                  <tr className="hover:bg-red-100 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">General Social/Health Services</td>
                    <td className="px-4 md:px-6 py-4">
                      <PhoneNumber phone="211" label="211" />
                      <span className="text-gray-500 text-xs block">or</span>
                      <PhoneNumber phone="(888) 826-9790" />
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Resource network connecting Utahns in need with local health and human services. Available Monday–Sunday, 8 a.m. – 6 p.m.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Hard Water Section */}
          <section id="plumbing" className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6 md:p-8 mb-8 scroll-mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">🛠️</span>
              Plumbing Triage: The Hard Water Horror
            </h2>
            <p className="text-gray-800 mb-4 text-lg">
              Salt Lake City has some of the <strong className="text-yellow-800">hardest water in the country</strong> due to high levels of dissolved calcium and magnesium.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>This hard water causes scale deposits that can clog pipes and lead to wear and tear on water heaters and appliances over time.</li>
              <li>If you own your home or rent a house, locals recommend investing in a <strong>water softener or filtration solutions</strong> to prevent future clogs and extend the life of your fixtures.</li>
              <li><strong>Emergency Plumbers:</strong> Keep the number for emergency services handy. Roto-Rooter offers 24/7 service with no extra charge for nights or weekends. Manwill Plumbing and Heating also provides 24-hour emergency plumbing service and specializes in water softeners.</li>
            </ul>
          </section>

          {/* Renters Rights */}
          <section id="renters" className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 scroll-mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">⚖️</span>
              Renters' Rights Checkpoint
            </h2>
            <p className="text-gray-700 mb-4">If you are renting, take steps in your first week to establish protection and understand local laws.</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Review the Utah Renter's Handbook/Toolkit:</strong> Understand tenant rights and landlord obligations under the Utah Fit Premises Act. Landlords are required to provide housing that is "safe, sanitary, and fit for human occupancy".</li>
              <li><strong>Document Unit Condition:</strong> Perform a detailed move-in inspection. Document any existing wear and tear in writing (with photos) with the landlord to protect your security deposit. Note that eviction in Utah can be a quick legal process, sometimes as fast as one week, so never ignore notices.</li>
            </ul>
          </section>

          {/* Grid System */}
          <section id="grid" className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 scroll-mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">🗺️</span>
              SLC Orientation: Master the Grid
            </h2>
            <p className="text-gray-700 mb-4">The pioneers designed SLC's streets using a logical, easy-to-navigate grid system centered on Temple Square downtown.</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>The Center Point:</strong> Temple Square is the epicenter, or "ground zero" (0 East, 0 South).</li>
              <li><strong>How it Works:</strong> Addresses increase numerically as you travel away from the center. For example, 500 East, 500 South is five blocks east and five blocks south of Temple Square.</li>
              <li><strong>Pro Tip:</strong> Mastering the grid is the ultimate local cheat code, helping you navigate like a pro without relying solely on GPS. Locals often drop the last two zeros, referring to "200 West" as "Second West".</li>
            </ul>
          </section>

          {/* DMV Section */}
          <section id="dmv" className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 scroll-mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">🚗</span>
              Immediate Transportation & DMV
            </h2>
            <p className="text-gray-700 mb-4">New Utah residents have <strong className="text-blue-600">60 days</strong> to transfer an out-of-state vehicle title and registration.</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Start Vehicle Registration:</strong> Visit the Utah DMV website (<a href="https://dmv.utah.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">dmv.utah.gov</a>) to begin the title and registration transfer process. A VIN inspection and an emissions inspection (required in Salt Lake County) may be needed.</li>
              <li><strong>Driver's License/ID:</strong> To apply for a Utah DL/ID, you must bring original or certified documents (no photocopies) for identity and residency. You will need to prepare for a written knowledge test (50 questions, or 25 if you have a prior license). The written test is offered in multiple languages, including Spanish, French, Korean, and Mandarin.</li>
            </ul>
          </section>

          {/* Health Section */}
          <section id="health" className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 scroll-mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">⚕️</span>
              Health & Altitude Acclimation
            </h2>
            <p className="text-gray-700 mb-4">Salt Lake City sits at an elevation of about <strong className="text-blue-600">4,200 feet</strong>.</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Dehydration is a Risk:</strong> Utah is the second driest state in the nation. It is highly recommended to drink twice the water you normally would—aiming for <strong>3–4 liters per day if active</strong>—to combat the dry air and altitude. Fatigue, headaches, and trouble sleeping are common signs of initial altitude adjustment.</li>
              <li><strong>Use Sunscreen:</strong> Wear sunscreen religiously, even in winter. High altitude means stronger UV exposure (UV radiation increases ~6–10% for every 1,000 feet gained), and sun glare reflecting off snow can cause burns.</li>
              <li><strong>Establish Care:</strong> Find a Primary Care Provider (PCP) early. You can call <PhoneNumber phone="(801) 213-9500" label="University of Utah Health at 801-213-9500" /> to schedule a new patient check-up; preventive care is often covered by insurance. For non-life-threatening urgent care, Salt Lake Instacare offers licensed professionals and is located at <Address address="389 South 900 East" />.</li>
            </ul>
          </section>

          {/* Coffee Shops */}
          <section id="coffee" className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 scroll-mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">☕</span>
              Coffee Shops: Your First Social Anchors
            </h2>
            <p className="text-gray-700 mb-6">
              Salt Lake City's coffee culture is strong, with local shops acting as a "modern town square" where people gather. These spots are highly recommended for making initial social connections.
            </p>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Coffee Shop</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Neighborhood</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Address</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Specialty/Vibe</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-amber-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">The Rose Establishment</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Downtown</td>
                    <td className="px-4 md:px-6 py-4 text-sm"><Address address="235 S 400 W, Salt Lake City, UT 84101" /></td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Community Hub. Known for great pour-overs, artisan toast, and brunch. No Wi-Fi to encourage face-to-face conversation. Try the Avocado Tartine or The Standard.</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-amber-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">Café Niche</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">East Central</td>
                    <td className="px-4 md:px-6 py-4 text-sm"><Address address="779 E 300 S, Salt Lake City, UT 84102" /></td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Neighborhood Gem/Modern Bistro. Cozy atmosphere. Specialties include Cinnamon Streusel Texas-sized French Toast and Corned Beef Hash (made with Kobe beef).</td>
                  </tr>
                  <tr className="hover:bg-amber-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">La Barba Coffee & Breakfast Tacos</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Downtown/Central City</td>
                    <td className="px-4 md:px-6 py-4 text-sm"><Address address="155 E 900 S, Salt Lake City, UT 84111" /></td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Coffee & Tacos. Known for delicious, fresh, made-from-scratch Breakfast Tacos. Try the Bacon, Egg, and Cheese Taco or Black Bean, Potato, and Pickled Red Onion Taco.</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-amber-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">Feldman's Deli</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Sugar House/Millcreek</td>
                    <td className="px-4 md:px-6 py-4 text-sm"><Address address="2005 E 2700 S, Salt Lake City, UT 84109" /></td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Jewish Deli Comfort Food. Serves breakfast/brunch Tue-Sat 8 a.m.–10:30 a.m.. Specialties include Eggs Benny (served on a Jewish latke with Taylor ham).</td>
                  </tr>
                  <tr className="hover:bg-amber-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">Tulie Bakery</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">East Central</td>
                    <td className="px-4 md:px-6 py-4 text-sm"><Address address="863 east 700 south, Salt Lake City, UT 84102" /></td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Bakery/French Toast. Known for pastries and a modest breakfast menu. Specialty is the unforgettable Brioche French Toast.</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-amber-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">Roots Cafe</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Millcreek</td>
                    <td className="px-4 md:px-6 py-4 text-sm"><Address address="3474 S 2300 E, Millcreek, UT 84109" /></td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Healthy/Cozy Cafe. Features a specialty juice bar. Recommended: Huevos Rancheros, Peeto Breakfast Sandwich, or fresh juices.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Restaurants */}
          <section id="restaurants" className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 scroll-mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">🍽️</span>
              Essential First-Week Dining Spots
            </h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Breakfast/Brunch Must-Tries</h3>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-orange-50 to-red-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Restaurant</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Address</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Hours</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">What to Order</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-orange-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">Sweet Lake Biscuits & Limeade</td>
                    <td className="px-4 md:px-6 py-4 text-sm"><Address address="54 W 1700 S, Salt Lake City, UT 84115" /></td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Mon-Fri 8:30am-3pm, Sat-Sun 8am-4pm</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700"><strong>The Hoss</strong> (biscuit with fried chicken, bacon, egg, cheddar, sausage gravy) and Classic Mint Limeade</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-orange-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">Café Niche</td>
                    <td className="px-4 md:px-6 py-4 text-sm"><Address address="779 E 300 S, Salt Lake City, UT 84102" /></td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Brunch daily until 4:00 p.m. (Sunday until 3:00 p.m.)</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Signature Niche Breakfast (get the avocado & hash browns side), Cinnamon Streusel Texas-sized French Toast, or Corned Beef Hash</td>
                  </tr>
                  <tr className="hover:bg-orange-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">The Rose Establishment</td>
                    <td className="px-4 md:px-6 py-4 text-sm"><Address address="235 S 400 W, Salt Lake City, UT 84101" /></td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Serves breakfast/brunch</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Avocado tartine (with candied lemon chips) or The Standard (herbed potato cakes, soft-cooked eggs, and pork belly bacon)</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-orange-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">La Barba Coffee & Breakfast Tacos</td>
                    <td className="px-4 md:px-6 py-4 text-sm"><Address address="155 E 900 S, Salt Lake City, UT 84111" /></td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Serves breakfast daily</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Bacon, egg, and cheese taco or black bean, potato, and pickled red onion taco. Try the carne asada taco with your cold brew.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> Due to Utah's liquor laws, many restaurants cannot open their brunch cocktail menus until <strong>10:30 a.m. on Saturdays and Sundays</strong>. You must also order food to receive alcohol service.
              </p>
            </div>
          </section>

          {/* Neighborhoods */}
          <section id="neighborhoods" className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 scroll-mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">🏘️</span>
              Quick Neighborhood Overview
            </h2>
            <p className="text-gray-700 mb-6">Understanding your neighborhood options helps you orient yourself and plan future exploration:</p>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-50 to-teal-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Neighborhood</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vibe</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Key Characteristics</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-green-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">Downtown</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Bustling, urban, connected</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Most vibrant nightlife, shopping, and dining. Highly walkable. Median Rent: $1,138. Safer than 32% of the city.</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-green-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">East Central / Central City</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Active, liberal, young</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Cozy, safe, and affordable. Most bikeable. Median Rent: $1,118 (most affordable). Median Age: 30.6. Safer than 68% of the city.</td>
                  </tr>
                  <tr className="hover:bg-green-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">Sugar House</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Trendy, relaxed, family-friendly</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Hip and eclectic. Excellent shopping, diverse restaurants. Contains Sugar House Park (110 acres). Median Rent: $1,306. Safer than 47% of the city.</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-green-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">Greater Avenues</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Historic, leafy, quiet, charming</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Oldest and largest historic district. Most walkable. Most liberal neighborhood. Median Rent: $1,152. Safer than 95% of the city.</td>
                  </tr>
                  <tr className="hover:bg-green-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">East Bench</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Relaxing, calming, outdoor oasis</td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">Primarily residential with vast mountain views. Highest median household income: $113,577. Safer than 79% of the city.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* First Hike */}
          <section id="hike" className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 scroll-mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">⛰️</span>
              Your First Hike: Ensign Peak
            </h2>
            <p className="text-gray-700 mb-4">
              <strong>Perfect for your first week!</strong> A quick, easy introduction to Utah's outdoor culture.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Location:</strong> Just behind the State Capitol</li>
              <li><strong>Distance:</strong> 0.9 miles out-and-back (about 20 minutes)</li>
              <li><strong>Difficulty:</strong> Easy</li>
              <li><strong>Key Feature:</strong> Provides panoramic viewpoint of the valley. Historically significant (Brigham Young surveyed the valley from here in 1847). Great for sunset viewing.</li>
              <li><strong>Note:</strong> No shade, steep in spots.</li>
            </ul>
            <div className="mt-4">
              <a
                href={createMapLink('Ensign Peak, Salt Lake City, UT')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                🗺️ Get Directions to Ensign Peak
              </a>
            </div>
          </section>

          {/* Cultural Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">🏔️</span>
              Cultural & Social Quick Start
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">🫂 Local Community Integration</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li><strong>The LDS Welcome:</strong> Salt Lake City proper is a progressive outlier and is less than 50% Latter-day Saint (LDS) by population. However, the local culture emphasizes genuine kindness and community service.</li>
              <li><strong>Moving Help Hack:</strong> Don't be surprised if friendly LDS neighbors show up unannounced to help you unload heavy items. If you need moving help, you can discreetly find the local Latter-day Saint Bishop using the online meetinghouse locator and ask the men's group (the Elders Quorum) for assistance; they often help regardless of religious affiliation.</li>
              <li><strong>Terminology:</strong> If discussing the predominant faith, the most respectful terms are <strong>Latter-day Saint or LDS</strong>, as the term "Mormon" is discouraged by leaders.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">🚌 Navigating the City (Zero Cost)</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li><strong>UTA Free Fare Zone:</strong> Take advantage of the Free Fare Zone in Downtown SLC for public transit. Within a designated area of downtown, you can ride UTA buses and TRAX light rail for free. This is a great way to explore the central city in your first week without worrying about parking or meters.</li>
              <li><strong>Downtown Landmarks:</strong> The Free Fare Zone connects major downtown spots, including City Creek Center (shopping/amenities) and the Clark Planetarium (an iconic stop for entertainment and atmosphere).</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">☕ Culinary Quick Stops</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Coffee Culture:</strong> Finding a good cup of coffee is easy, as every SLC neighborhood has at least one noteworthy, locally-owned coffee shop. Try to become a daily regular at a spot like <strong>Café Niche</strong> (in East Central) or <strong>The Rose Establishment</strong> (Downtown) to facilitate first connections with staff and regulars.</li>
              <li><strong>The Sunday Slowdown:</strong> Be warned that Utah's heritage means many locally-owned businesses and all state liquor stores are closed on Sundays. Always check business hours on Sundays.</li>
              <li><strong>Quick & Essential Bites:</strong> Try one of the most classic and iconic breakfast spots in SLC, <strong>Sweet Lake Biscuits and Limeade</strong>. If it's your first visit, try <strong>The Hoss</strong> (biscuit with fried chicken, egg, bacon, cheddar, sausage gravy, and green onion garnish) and wash it down with a homemade mint limeade.</li>
              <li><strong>The "Dirty Soda" Phenomenon:</strong> You may encounter the Utah phenomenon of specialized "dirty soda" shops (like Swig). Devout Latter-day Saints often avoid coffee/tea, making sweetened fountain drinks mixed with cream and syrups a popular social alternative.</li>
            </ul>
          </section>

          {/* Action Checklist */}
          <section id="checklist" className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-xl p-6 md:p-8 mb-8 scroll-mt-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              Week 1 Action Checklist
            </h2>
            <p className="text-gray-700 mb-6 text-lg">Use this checklist to ensure you complete all critical first-week tasks:</p>
            <div className="space-y-3">
              {CHECKLIST_ITEMS.map((item) => (
                <label 
                  key={item.id} 
                  className="flex items-start space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <input 
                    type="checkbox" 
                    checked={checkedItems.has(item.id)}
                    onChange={() => toggleCheck(item.id)}
                    className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer" 
                  />
                  <span className={`flex-1 text-gray-700 group-hover:text-gray-900 ${checkedItems.has(item.id) ? 'line-through text-gray-400' : ''}`}>
                    {item.text}
                  </span>
                  {checkedItems.has(item.id) && (
                    <span className="text-green-500 text-xl">✓</span>
                  )}
                </label>
              ))}
            </div>
            <div className="mt-6 p-4 bg-white rounded-lg border-2 border-blue-200">
              <p className="text-center text-gray-700">
                <strong className="text-blue-600 text-lg">{progress}% Complete</strong>
                <span className="text-gray-500 block text-sm mt-1">
                  {checkedItems.size} of {CHECKLIST_ITEMS.length} tasks completed
                </span>
              </p>
            </div>
          </section>

          {/* Final Message */}
          <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-xl p-8 md:p-10 mb-8 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">🎉 You've Got This!</h2>
            <p className="text-lg md:text-xl mb-4 text-blue-50">By the end of Week 1, you should have:</p>
            <ul className="list-disc list-inside space-y-2 mb-6 text-lg">
              <li>✅ All utilities activated</li>
              <li>✅ Basic understanding of the grid system</li>
              <li>✅ DMV process started</li>
              <li>✅ Health care established</li>
              <li>✅ First neighborhood exploration completed</li>
              <li>✅ Initial social connections made</li>
            </ul>
            <p className="text-xl md:text-2xl font-semibold">Welcome to Utah! You're on your way to becoming a local. 🏔️</p>
          </section>

          {/* CTA to 90-Day Guide */}
          <section className="bg-white rounded-xl shadow-xl p-8 md:p-10 mb-8 text-center border-4 border-orange-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Ready for the Full Journey?</h2>
            <p className="text-gray-700 mb-6 text-lg">
              This is Week 1 of your 90-day onboarding journey. Get the complete roadmap with week-by-week checklists, neighborhood deep-dives, and full local integration guide.
            </p>
            <Link
              href="/welcome-wagon"
              className="inline-block bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white font-bold py-4 px-8 rounded-xl hover:from-orange-600 hover:via-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-2xl transform hover:scale-105 text-lg"
            >
              Get the Complete 90-Day Guide →
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
