import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Also checking environment variable ADMIN_EMAILS locally if exposed, 
  // but for safety, we are hardcoding the check for the frontend here.
  // The real security happens on the backend.
  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS 
    ? import.meta.env.VITE_ADMIN_EMAILS.split(',').map((e: string) => e.trim()) 
    : ['faisal301196@gmail.com', 'almasladiescornersakchi@gmail.com'];
  
  // To assist with preview
  if (user && user.email) {
     console.log("Logged in as:", user.email);
     console.log("Admin emails list:", adminEmails);
  }
    
  if (!user || !user.email || !adminEmails.includes(user.email)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
