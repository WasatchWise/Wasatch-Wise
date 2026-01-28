
import React, { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import ExecutiveSummary from './components/ExecutiveSummary';
import Risk from './components/Risk';
import WhyMagnesium from './components/WhyMagnesium';
import WhyGMC from './components/WhyGMC';
import TechnicalSpecs from './components/TechnicalSpecs';
import StrategicGeography from './components/StrategicGeography';
import Roadmap from './components/Roadmap';
import EvidenceVault from './components/EvidenceVault';
import ObjectionHandler from './components/ObjectionHandler';
import DataRoomPreview from './components/DataRoomPreview';
import FAQ from './components/FAQ';
import LeadForm from './components/LeadForm';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen selection:bg-slate-900 selection:text-white">
      {/* Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-slate-900 z-[60] transition-all duration-100 ease-out" 
        style={{ width: `${scrollProgress}%` }}
      />
      
      <Navigation />
      
      <main>
        <Hero />
        <ExecutiveSummary />
        <Risk />
        <WhyMagnesium />
        <WhyGMC />
        <TechnicalSpecs />
        <StrategicGeography />
        <Roadmap />
        <ObjectionHandler />
        <DataRoomPreview />
        <EvidenceVault />
        <FAQ />
        <LeadForm />
      </main>
      
      <Footer />
      
      {/* Sticky Quick Action for Mobile */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <a 
          href="#contact"
          className="flex items-center justify-center w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default App;
