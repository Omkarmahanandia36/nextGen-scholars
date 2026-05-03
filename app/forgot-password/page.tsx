'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IoMail, IoArrowBack } from 'react-icons/io5';

// For Next.js 13+ client components, we can't export metadata. 
// The RootLayout title "NextGen Scholar" will be used.

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      if (data.success) {
        setIsSubmitted(true);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err: any) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20"
      >
        <div className="text-center">
          <Link href="/">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent cursor-pointer">
              NextGen Scholar
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Forgot password?</h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSubmitted 
              ? "We've sent a password reset link to your email." 
              : "No worries, we'll send you reset instructions."}
          </p>
        </div>

        {!isSubmitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all disabled:opacity-70"
              >
                {loading ? 'Sending...' : 'Reset password'}
              </motion.button>
            </div>
          </form>
        ) : (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-600 mb-6">
              Check your inbox at <span className="font-semibold text-gray-900">{email}</span> for instructions to reset your password.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSubmitted(false)}
              className="text-blue-600 font-medium hover:text-blue-500 transition-colors"
            >
              Didn&apos;t receive the email? Click to retry
            </motion.button>
          </div>
        )}

        <div className="text-center mt-4">
          <Link href="/login" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            <IoArrowBack className="mr-2" />
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
