'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { AnimatePresence, motion } from 'framer-motion';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isStudent, setIsStudent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setMounted(true);
    const checkAuth = async () => {
      try {
        // Only check auth if we're not on explicit admin or auth routes to save requests
        const isAdmin = pathname?.startsWith('/admin');
        const isAuth = pathname === '/login' || pathname === '/signup' || pathname === '/onboarding';
        
        if (isAdmin || isAuth) {
          setIsStudent(false);
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        // If they are on a student route, they MUST be a student (middleware ensures this)
        // This is a fallback in case the API call fails but middleware passed
        const isStudentRoute = pathname?.startsWith('/student');
        
        setIsStudent(data.success && data.user?.role === 'student' || isStudentRoute);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Fallback to route-based detection if API fails
        setIsStudent(pathname?.startsWith('/student'));
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname]);

  if (!mounted) return null;

  // Routes where we never want global navbar/footer regardless of login
  const isAdmin = pathname?.startsWith('/admin');
  const isOnboarding = pathname?.startsWith('/onboarding');
  const isAuth = pathname === '/login' || pathname === '/signup';
  const isPracticeArena = pathname?.startsWith('/student/practice/') && pathname !== '/student/practice';

  // Logged in student layout - specifically for student portal experience
  // We show sidebar if:
  // 1. We confirmed they are a student via API
  // 2. OR they are currently on a /student route (which middleware protects)
  const useStudentLayout = (isStudent || pathname?.startsWith('/student')) && !isAdmin && !isOnboarding && !isAuth && !isPracticeArena;

  const showNavbar = !useStudentLayout && !isAdmin && !isOnboarding && !isPracticeArena;
  const showFooter = !useStudentLayout && !isAdmin && !isOnboarding && !isAuth && !isPracticeArena;
  const showSidebar = useStudentLayout;

  // Prevent UI flickering while checking auth ONLY on protected student routes
  if (isLoading && pathname?.startsWith('/student')) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {showNavbar && <Navbar />}
      
      <div className={`flex flex-grow ${showNavbar && !useStudentLayout ? 'pt-24' : ''}`}>
        <AnimatePresence mode="wait">
          {showSidebar && (
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="z-40"
            >
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>

        <main className={`flex-grow transition-all duration-300 ${
          showSidebar ? 'bg-[#F8FAFC]' : ''
        }`}>
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>

      {showFooter && <Footer />}
    </div>
  );
}



