'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCalendar, HiOutlineClock } from 'react-icons/hi';
import Link from 'next/link';

export default function SchedulePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-blue-100 border border-blue-50"
        >
          <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-8">
            <HiOutlineCalendar className="text-5xl" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Coming Soon</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            We're currently building a powerful personalized schedule manager for you. Stay tuned!
          </p>
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 py-3 px-6 rounded-2xl">
            <HiOutlineClock className="text-xl" />
            <span>Targeting May 2026</span>
          </div>
        </motion.div>
        
        <Link 
          href="/student/dashboard"
          className="inline-block mt-8 font-bold text-gray-400 hover:text-blue-600 transition-colors"
        >
          ← Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
