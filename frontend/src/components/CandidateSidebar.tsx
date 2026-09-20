import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function CandidateSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('candidate_token');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen p-4">
      <div className="text-xl font-bold text-white mb-8 px-2">Candidate Portal</div>
      
      <nav className="flex-1 space-y-2">
        <Link 
          to="/candidate/welcome" 
          className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
        >
          Welcome
        </Link>
        <Link 
          to="/candidate/jobs" 
          className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
        >
          Available Jobs
        </Link>
        <Link 
          to="/candidate/apply" 
          className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
        >
          Apply Jobs
        </Link>
        <Link 
          to="/candidate/profile" 
          className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
        >
          Create Profile
        </Link>
      </nav>

      <div className="pt-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="w-full text-left px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}