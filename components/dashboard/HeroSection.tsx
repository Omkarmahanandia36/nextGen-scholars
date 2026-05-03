'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { IoMail } from 'react-icons/io5';
import ScheduleMeetingModal from '../modals/ScheduleMeetingModal';

const HeroSection = () => {
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  return (
    <>
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
                  Transform Your Learning Journey
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                Join Bhubaneswara&apos;s premier online teaching platform for personalized learning and academic excellence
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/courses">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Explore Courses
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMeetingModalOpen(true)}
                className="px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-200 hover:border-blue-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <IoMail className="w-5 h-5" />
                Send Message
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">50+</h3>
                <p className="text-gray-600">Students Enrolled</p>
              </div>
              <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">3+</h3>
                <p className="text-gray-600">Expert Teachers</p>
              </div>
              <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">95%</h3>
                <p className="text-gray-600">Success Rate</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meeting Modal */}
      <ScheduleMeetingModal isOpen={isMeetingModalOpen} onClose={() => setIsMeetingModalOpen(false)} />
    </>
  );
};

export default HeroSection;
