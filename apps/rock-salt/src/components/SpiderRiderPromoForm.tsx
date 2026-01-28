'use client';

import React, { useState, useEffect } from 'react';
import {
  Mic2,
  Camera,
  Share2,
  DollarSign,
  FileText,
  CheckCircle,
  Upload,
  Radio,
  Users,
  Instagram,
  Youtube,
  Music
} from 'lucide-react';

export default function SpiderRiderPromoForm() {
  const [readinessScore, setReadinessScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    bandName: '',
    hometown: '',
    genre: '',
    forFansOf: '', // Crucial for promo context

    // Promo Assets
    bio: '',
    instagram: '',
    spotify: '',
    keyTrack: '', // What do we play on air?
    photoUploaded: false,

    // The Basics (Tech Light)
    members: '',
    stagePlotUploaded: false,

    // Business
    primaryContact: '',
    email: '',
    payoutHandle: ''
  });

  // Calculate "Promo Readiness" Score
  useEffect(() => {
    let score = 0;
    const fields = [
      { key: 'bandName', weight: 10 },
      { key: 'genre', weight: 10 },
      { key: 'forFansOf', weight: 10 }, // High value for booking/promo
      { key: 'bio', weight: 10 },
      { key: 'instagram', weight: 10 },
      { key: 'spotify', weight: 10 },
      { key: 'keyTrack', weight: 10 },
      { key: 'photoUploaded', weight: 20 }, // Visuals are key
      { key: 'email', weight: 5 },
      { key: 'stagePlotUploaded', weight: 5 },
    ];

    fields.forEach(field => {
      // @ts-expect-error - dynamic key access
      if (field.key === 'photoUploaded' || field.key === 'stagePlotUploaded') {
        // @ts-expect-error - dynamic boolean access
        if (formData[field.key]) score += field.weight;
      } else {
        // @ts-expect-error - dynamic string access
        if (formData[field.key] && formData[field.key].length > 0) score += field.weight;
      }
    });

    setReadinessScore(Math.min(score, 100));
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = (field: string) => {
    // Simulate upload
    setTimeout(() => {
      setFormData(prev => ({ ...prev, [field]: true }));
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo(0, 0);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] bg-neutral-900 text-white flex items-center justify-center p-4 rounded-xl border border-neutral-800">
        <div className="max-w-md w-full bg-neutral-800 border border-neutral-700 p-8 rounded-lg shadow-2xl text-center">
          <div className="mx-auto w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mb-6">
            <Share2 size={32} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Profile Active</h2>
          <p className="text-neutral-400 mb-6">
            Your promo assets have been ingested. We have everything we need to build your flyer and radio spot.
            <br />
            <span className="text-white font-bold mt-2 block">Promo Power: {readinessScore}%</span>
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 w-full py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-neutral-200 transition"
          >
            Submit Another Band
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-blue-500 selection:text-white rounded-xl overflow-hidden shadow-2xl border border-neutral-800">

      {/* Sticky Header with Score */}
      <div className="sticky top-0 z-50 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-black">S</div>
            <span className="font-black tracking-tighter text-xl hidden sm:block">THE SPIDER RIDER</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs uppercase tracking-widest text-neutral-500">Promo Readiness</div>
              <div className={`font-mono font-bold ${readinessScore >= 90 ? 'text-green-500' : 'text-white'}`}>
                {readinessScore}/100
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-32 h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${readinessScore >= 90 ? 'bg-green-500' : 'bg-blue-600'}`}
                style={{ width: `${readinessScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-8">

        {/* Intro */}
        <div className="mb-12 text-center pt-8">
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter mb-4 text-white">
            Get Seen.<br />Get Heard.
          </h1>
          <p className="text-lg text-neutral-400 max-w-xl mx-auto">
            We can&apos;t promote you if we don&apos;t have your files.
            Fill out this profile to get your band on the <span className="text-blue-500 font-bold">Rock Salt Map</span> and on the air.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Section 1: The Identity */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-neutral-800 pb-4">
              <Users className="text-blue-500" />
              <h3 className="text-xl font-bold uppercase tracking-wide text-white">1. Identity (The Hook)</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-neutral-500">Band Name</label>
                <input
                  type="text"
                  name="bandName"
                  value={formData.bandName}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-neutral-700 p-3 text-white focus:border-blue-500 focus:outline-none rounded transition-colors"
                  placeholder="e.g. Starmy"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-neutral-500">Hometown</label>
                <input
                  type="text"
                  name="hometown"
                  value={formData.hometown}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-neutral-700 p-3 text-white focus:border-blue-500 focus:outline-none rounded transition-colors"
                  placeholder="e.g. Provo, UT"
                />
              </div>

              {/* Marketing Gold: Genre & RIYL */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-neutral-500">Genre</label>
                <input
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-neutral-700 p-3 text-white focus:border-blue-500 focus:outline-none rounded transition-colors"
                  placeholder="e.g. Dream Pop"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-neutral-500 flex items-center gap-2">
                  &quot;For Fans Of&quot; <span className="text-blue-500 text-[10px] bg-blue-500/10 px-1 rounded">VITAL</span>
                </label>
                <input
                  type="text"
                  name="forFansOf"
                  value={formData.forFansOf}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-neutral-700 p-3 text-white focus:border-blue-500 focus:outline-none rounded transition-colors"
                  placeholder="e.g. The 1975, The Killers, neon lights"
                />
                <p className="text-[10px] text-neutral-500">We use this to place you on the right bills.</p>
              </div>

              <div className="col-span-1 sm:col-span-2 space-y-2">
                <label className="text-xs uppercase font-bold text-neutral-500">Elevator Pitch / Short Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-black border border-neutral-700 p-3 text-white focus:border-blue-500 focus:outline-none rounded transition-colors"
                  placeholder="The one sentence that makes people care. Keep it punchy."
                />
              </div>
            </div>
          </div>

          {/* Section 2: Marketing Assets */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 text-neutral-800 opacity-20 transform -rotate-12">
              <Camera size={200} />
            </div>

            <div className="flex items-center gap-3 mb-6 border-b border-neutral-800 pb-4 relative z-10">
              <Share2 className="text-blue-500" />
              <h3 className="text-xl font-bold uppercase tracking-wide text-white">2. Promo Assets</h3>
            </div>

            <div className="space-y-6 relative z-10">
              {/* Photo Upload */}
              <div className="p-4 border border-dashed border-neutral-600 bg-neutral-900/50 rounded-lg flex flex-col items-center justify-center text-center group hover:border-blue-500 transition-colors cursor-pointer" onClick={() => handleFileUpload('photoUploaded')}>
                <div className="mb-3">
                  {formData.photoUploaded ? (
                    <CheckCircle className="text-green-500 w-10 h-10 mx-auto" />
                  ) : (
                    <Camera className="text-neutral-500 w-10 h-10 mx-auto group-hover:text-blue-500 transition-colors" />
                  )}
                </div>
                {formData.photoUploaded ? (
                  <p className="text-green-500 font-bold uppercase">Press Photo Received</p>
                ) : (
                  <div>
                    <h4 className="text-white font-bold group-hover:text-blue-400">Upload High-Res Press Photo</h4>
                    <p className="text-sm text-neutral-500">Required for flyers. No logos. Just the band.</p>
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  <Instagram size={20} className="text-pink-500 shrink-0" />
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-neutral-700 p-3 text-white focus:border-pink-500 focus:outline-none rounded transition-colors"
                    placeholder="Instagram URL"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Music size={20} className="text-green-500 shrink-0" />
                  <input
                    type="text"
                    name="spotify"
                    value={formData.spotify}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-neutral-700 p-3 text-white focus:border-green-500 focus:outline-none rounded transition-colors"
                    placeholder="Spotify / Streaming URL"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Radio size={20} className="text-blue-500 shrink-0" />
                  <input
                    type="text"
                    name="keyTrack"
                    value={formData.keyTrack}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-neutral-700 p-3 text-white focus:border-blue-500 focus:outline-none rounded transition-colors"
                    placeholder="Focus Track (Which song should we play on air?)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: The Basics (Simplified Logistics) */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-neutral-800 pb-4">
              <FileText className="text-blue-500" />
              <h3 className="text-xl font-bold uppercase tracking-wide text-white">3. Logistics (Lite)</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-neutral-500">Primary Contact</label>
                <input
                  type="text"
                  name="primaryContact"
                  value={formData.primaryContact}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-neutral-700 p-3 text-white focus:border-blue-500 focus:outline-none rounded"
                  placeholder="Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-neutral-500">Contact Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-neutral-700 p-3 text-white focus:border-blue-500 focus:outline-none rounded"
                  placeholder="Email"
                />
              </div>

              {/* Simplified Tech */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-neutral-500">Number of Members</label>
                <input
                  type="text"
                  name="members"
                  value={formData.members}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-neutral-700 p-3 text-white focus:border-blue-500 focus:outline-none rounded"
                  placeholder="#"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-neutral-500">Stage Plot Available?</label>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => handleFileUpload('stagePlotUploaded')}
                    className={`px-4 py-2 rounded text-xs font-bold uppercase transition-colors border ${formData.stagePlotUploaded ? 'bg-green-500 border-green-500 text-black' : 'bg-transparent border-neutral-600 hover:border-white'}`}
                  >
                    {formData.stagePlotUploaded ? 'Uploaded' : 'Upload PDF'}
                  </button>
                  <span className="text-xs text-neutral-500">{formData.stagePlotUploaded ? 'We got it.' : 'Ideally, yes.'}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-lg hover:bg-neutral-200 transition-colors rounded shadow-lg shadow-white/10"
          >
            Submit Promo Packet
          </button>

        </form>
      </div>
    </div>
  );
}
