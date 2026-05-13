'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  HiOutlineChartBar, 
  HiOutlineBookOpen, 
  HiOutlineDocumentText, 
  HiOutlineCalendar,
  HiLogout,
  HiLightningBolt,
  HiOutlineUser,
  HiChevronRight
} from 'react-icons/hi';

const navItems = [
  { name: 'Dashboard', href: '/student/dashboard', icon: HiOutlineChartBar },
  { name: 'Materials', href: '/student/materials', icon: HiOutlineBookOpen },
  { name: 'Practice Exams', href: '/student/practice', icon: HiOutlineDocumentText },
  { name: 'Schedule', href: '/student/schedule', icon: HiOutlineCalendar },
  { name: 'Profile', href: '/student/profile', icon: HiOutlineUser },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ 
    name: string; 
    email: string; 
    tutors?: { name: string; specialization: string[]; imageUrl?: string }[] 
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        // Clear all local state and redirect
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="w-72 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col shadow-sm">
      {/* Brand Header */}
      <div className="p-8 pb-4">
        <Link href="/student/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
            <HiLightningBolt className="text-xl" />
          </div>
          <span className="text-2xl font-black tracking-tight">
            <span className="text-gray-900">Next</span>
            <span className="text-blue-600">Gen Scholar</span>
          </span>
        </Link>
      </div>

      {/* User Profile Summary */}
      <div className="px-6 mb-8">
        <Link href="/student/profile">
          <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3 border border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer group/user">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover/user:bg-blue-600 group-hover/user:text-white transition-colors">
              <HiOutlineUser className="text-xl" />
            </div>
            <div className="flex-grow overflow-hidden text-ellipsis">
              <p className="text-sm font-bold text-gray-900 truncate">
                {user?.name || 'Loading...'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                Student Account
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-6 space-y-1.5">
        <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Main Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/student/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`text-xl ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span className="font-semibold text-[15px]">{item.name}</span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="w-1 h-4 bg-white/40 rounded-full"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Tutor Section */}
      <div className="px-6 mt-8">
        <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          My Tutors
        </p>
        <div className="space-y-3">
          {user?.tutors && user.tutors.length > 0 ? (
            user.tutors.map((tutor: { name: string; specialization: string[]; imageUrl?: string }, index: number) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-white border border-gray-100 rounded-xl flex items-center gap-3 hover:border-blue-200 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border border-blue-100 relative">
                  {tutor.imageUrl ? (
                    <Image src={tutor.imageUrl} alt={tutor.name} fill className="object-cover" />
                  ) : (
                    <span className="text-blue-600 font-bold text-xs">{tutor.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-grow overflow-hidden">
                  <p className="text-sm font-bold text-gray-900 truncate">{tutor.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{tutor.specialization.join(', ')}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-[10px] text-gray-400 text-center italic">
                No tutors assigned yet. Contact support to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-6 border-t border-gray-50">
        <button
          onClick={handleLogout}
          className="flex items-center justify-between w-full p-4 rounded-2xl hover:bg-red-50 group transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
              <HiLogout className="text-lg" />
            </div>
            <span className="font-bold text-gray-600 group-hover:text-red-600 transition-colors">
              Sign Out
            </span>
          </div>
          <HiChevronRight className="text-gray-300 group-hover:text-red-300 transition-colors" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
