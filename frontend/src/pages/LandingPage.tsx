import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, Award, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen bg-cover bg-center relative flex flex-col justify-between text-white"
      style={{ 
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1920')` 
      }}
    >
      {/* Navigation Header - Centered & Large */}
      <header className="max-w-7xl mx-auto w-full px-6 py-8 flex justify-center items-center relative z-10">
        <div className="text-3xl md:text-5xl font-black tracking-wider flex items-center gap-3 uppercase text-center text-white">
          <Briefcase className="w-10 h-10 text-indigo-400" />
          <span>TalentConnect Agency</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-8 text-center relative z-10 my-auto">
        <span className="inline-block bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider mb-6 shadow-sm">
          Elite Recruitment & Talent Sourcing Agency
        </span>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight bg-gradient-to-r from-white via-indigo-100 to-slate-300 bg-clip-text text-transparent">
          Connecting Leading Employers with Exceptional Talent
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          We bridge the gap between top-tier candidates and recruiters. Let our specialized sourcing framework streamline your hiring pipeline and build your dream team.
        </p>
        
        {/* Single CTA Button */}
        <div className="flex justify-center mb-12">
          <button
            onClick={() => navigate('/login')}
            className="rounded-xl bg-indigo-600 px-8 py-4 font-semibold text-white hover:bg-indigo-700 transition-all duration-300 hover:scale-105 shadow-xl flex items-center gap-2 group"
          >
            Proceed to Recruitment Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Impact Statistics Counter */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-10 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md border border-white/15 p-4 rounded-xl text-center">
            <div className="text-2xl md:text-3xl font-extrabold text-indigo-400">98%</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">AI Match Accuracy</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/15 p-4 rounded-xl text-center">
            <div className="text-2xl md:text-3xl font-extrabold text-indigo-400">10x</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Faster Shortlisting</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/15 p-4 rounded-xl text-center">
            <div className="text-2xl md:text-3xl font-extrabold text-indigo-400">500+</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Successful Placements</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/15 p-4 rounded-xl text-center">
            <div className="text-2xl md:text-3xl font-extrabold text-indigo-400">24/7</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Automated Pipeline</div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-left">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:scale-[1.02] hover:border-indigo-500/50 transition-all duration-300 shadow-xl">
            <Users className="w-8 h-8 text-indigo-400 mb-3" />
            <h3 className="font-bold text-lg mb-1">Targeted Sourcing</h3>
            <p className="text-sm text-slate-400">We scout, filter, and present pre-vetted professionals tailored to your specific vacancy requirements.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:scale-[1.02] hover:border-indigo-500/50 transition-all duration-300 shadow-xl">
            <Award className="w-8 h-8 text-indigo-400 mb-3" />
            <h3 className="font-bold text-lg mb-1">AI-Assisted Ranking</h3>
            <p className="text-sm text-slate-400">Advanced evaluation systems ensure only the highest-caliber candidates reach your final interview desk.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:scale-[1.02] hover:border-indigo-500/50 transition-all duration-300 shadow-xl">
            <Briefcase className="w-8 h-8 text-indigo-400 mb-3" />
            <h3 className="font-bold text-lg mb-1">Seamless Pipeline</h3>
            <p className="text-sm text-slate-400">Manage job postings, track candidate status, and coordinate hiring logistics all in one unified dashboard.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-slate-500 relative z-10 border-t border-slate-800">
        &copy; {new Date().getFullYear()} TalentConnect Agency. All rights reserved.
      </footer>
    </div>
  );
}