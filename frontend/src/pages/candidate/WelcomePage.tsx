import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, UserCheck, FileText, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white p-8 md:p-12 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Candidate Portal
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Your Next Career Milestone Starts Here
          </h2>
          <p className="text-indigo-100 text-base md:text-lg mb-8 leading-relaxed">
            Welcome to your centralized command center. Explore vetted openings matched for top professionals, submit applications seamlessly, and track your career progression with ease.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/candidate/jobs"
              className="bg-white text-indigo-900 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition shadow-lg flex items-center gap-2"
            >
              Browse Openings <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/candidate/profile"
              className="bg-indigo-700/50 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl border border-indigo-400/30 transition shadow-lg"
            >
              Update Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action / Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between hover:shadow-lg transition">
          <div>
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4 font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Explore Vacancies</h3>
            <p className="text-sm text-gray-600 mb-4">
              Browse through curated job listings with live application deadlines and requirements.
            </p>
          </div>
          <Link
            to="/candidate/jobs"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1"
          >
            View Jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between hover:shadow-lg transition">
          <div>
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4 font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Apply with Confidence</h3>
            <p className="text-sm text-gray-600 mb-4">
              Submit your resume documents safely and get direct updates on your application status.
            </p>
          </div>
          <Link
            to="/candidate/apply"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1"
          >
            Submit Application <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between hover:shadow-lg transition">
          <div>
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4 font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Professional Profile</h3>
            <p className="text-sm text-gray-600 mb-4">
              Keep your contact details, skills, and background information up to date for recruiters.
            </p>
          </div>
          <Link
            to="/candidate/profile"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1"
          >
            Manage Profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Info Notice Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-slate-700 text-sm">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900">Secure Candidate Guarantee:</span> All resume submissions and personal files are securely processed and protected under confidentiality regulations.
        </div>
      </div>
    </div>
  );
}