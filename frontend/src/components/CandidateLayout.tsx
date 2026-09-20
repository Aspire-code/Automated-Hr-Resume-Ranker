import React from 'react';
import { Outlet } from 'react-router-dom';
import CandidateSidebar from './CandidateSidebar';

export default function CandidateLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <CandidateSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}