import React from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const userId = localStorage.getItem('user_id');

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}