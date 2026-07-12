'use client'; // v2 - original UI restored

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { IoMail } from 'react-icons/io5';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaUserCircle, FaChevronDown } from 'react-icons/fa';


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      // Check Student via API (more reliable than document.cookie for httpOnly)
      try {
        const studentRes = await fetch('/api/auth/me');
        const studentData = await studentRes.json();
        setIsStudent(studentData.success && studentData.user?.role === 'student');
      } catch {
        setIsStudent(false);
      }
    };

    checkStatus();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      // Try student logout first
      const studentLogoutRes = await fetch('/api/auth/logout', { method: 'POST' });
      
      // Also try admin logout
      const adminLogoutRes = await fetch('/api/admin/auth', {
        method: 'DELETE',
      });
      
      if (studentLogoutRes.ok || adminLogoutRes.ok) {
        setIsStudent(false);
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/courses' },
    { name: 'Tutors', href: '/tutors' },
    { name: 'About', href: '/about' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-3">
        <div className="w-full max-w-6xl mx-auto mt-4 bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow-lg px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/images/logo.png" 
                alt="NextGen Scholars Logo" 
                width={36} 
                height={36} 
                className="rounded-[12px] object-cover"
                priority
              />
              <strong className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent inline-block">
                NextGen Scholars
              </strong>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {item.name}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
              
              {isStudent ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/student/dashboard')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <IoMail className="w-4 h-4" />
                  Dashboard
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/signup')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <IoMail className="w-4 h-4" />
                  Get Started
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden mt-4 py-4 space-y-4"
            >
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {isStudent ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/student/dashboard');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <IoMail className="w-4 h-4" />
                  Dashboard
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/signup');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <IoMail className="w-4 h-4" />
                  Get Started
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
      </nav>

    </>
  );
};

export default Navbar;
