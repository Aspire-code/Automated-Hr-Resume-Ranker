import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col p-6 min-h-screen">
      <div className="text-xl font-extrabold text-white mb-8 tracking-tight">
        HR Admin Portal
      </div>
      
      <nav className="flex-1 space-y-2">
        <Link 
          to="/admin/dashboard" 
          className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition font-medium"
        >
          Dashboard
        </Link>
        <Link 
          to="/admin/create-job" 
          className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition font-medium"
        >
          Create Job
        </Link>
        <Link 
          to="/admin/manage-jobs" 
          className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition font-medium"
        >
          Manage Jobs
        </Link>
        <Link 
          to="/admin/manage-candidates" 
          className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition font-medium"
        >
          Manage Candidates
        </Link>
        <Link 
          to="/admin/rank" 
          className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition font-medium"
        >
          Rank Resumes
        </Link>
       
      </nav>

      <div className="pt-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="w-full text-left px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition font-semibold"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}