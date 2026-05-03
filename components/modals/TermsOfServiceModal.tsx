'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaGavel, FaUserShield, FaFileContract, FaUserTimes, FaMoneyBillWave, FaExclamationTriangle, FaGlobe } from 'react-icons/fa';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="relative w-full max-w-3xl max-h-[85vh] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700"
          >
            {/* Header with Gradient */}
            <div className="relative h-32 bg-gradient-to-r from-purple-600 to-pink-500 p-6 flex items-center">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative">
                <h2 className="text-3xl font-bold text-white mb-2">Terms of Service</h2>
                <p className="text-white/80">Please read these terms carefully</p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 rounded-full transition-all duration-300"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(85vh-8rem)]">
              <div className="space-y-8">
                <motion.section
                  variants={sectionVariants}
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
                      <FaGavel className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Agreement to Terms</h3>
                  </div>
                  <div className="text-gray-300 space-y-3">
                    <p>
                      By accessing or using NextGen Scholar&apos;s services, you agree to be bound by these Terms of Service.
                      If you disagree with any part of the terms, you may not access our services.
                    </p>
                  </div>
                </motion.section>

                <motion.section
                  variants={sectionVariants}
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                      <FaUserShield className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">User Responsibilities</h3>
                  </div>
                  <div className="text-gray-300 space-y-3">
                    <p>As a user of our platform, you are responsible for:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400">
                      <li>Maintaining the confidentiality of your account</li>
                      <li>Providing accurate and complete information</li>
                      <li>Using the services in a lawful manner</li>
                      <li>Respecting intellectual property rights</li>
                    </ul>
                  </div>
                </motion.section>

                <motion.section
                  variants={sectionVariants}
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-teal-500/10 text-teal-400 rounded-lg">
                      <FaFileContract className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Service Terms</h3>
                  </div>
                  <div className="text-gray-300 space-y-3">
                    <p>Our service terms include:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400">
                      <li>Access to educational content and resources</li>
                      <li>Interaction with tutors and other students</li>
                      <li>Use of platform features and tools</li>
                      <li>Participation in online learning activities</li>
                    </ul>
                  </div>
                </motion.section>

                <motion.section
                  variants={sectionVariants}
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-red-500/10 text-red-400 rounded-lg">
                      <FaUserTimes className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Prohibited Activities</h3>
                  </div>
                  <div className="text-gray-300 space-y-3">
                    <p>Users are prohibited from:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400">
                      <li>Sharing account credentials</li>
                      <li>Violating intellectual property rights</li>
                      <li>Engaging in disruptive behavior</li>
                      <li>Using the platform for unauthorized purposes</li>
                    </ul>
                  </div>
                </motion.section>

                <motion.section
                  variants={sectionVariants}
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-lg">
                      <FaMoneyBillWave className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Payment Terms</h3>
                  </div>
                  <div className="text-gray-300 space-y-3">
                    <p>Our payment terms include:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400">
                      <li>Subscription fees and payment schedules</li>
                      <li>Refund policies</li>
                      <li>Payment method requirements</li>
                      <li>Late payment consequences</li>
                    </ul>
                  </div>
                </motion.section>

                <motion.section
                  variants={sectionVariants}
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-orange-500/10 text-orange-400 rounded-lg">
                      <FaExclamationTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Limitation of Liability</h3>
                  </div>
                  <div className="text-gray-300">
                    <p>
                      NextGen Scholar shall not be liable for any indirect, incidental, special, consequential, or
                      punitive damages resulting from your use or inability to use the service.
                    </p>
                  </div>
                </motion.section>

                <motion.section
                  variants={sectionVariants}
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-green-500/10 text-green-400 rounded-lg">
                      <FaGlobe className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Governing Law</h3>
                  </div>
                  <div className="text-gray-300">
                    <p>
                      These terms shall be governed by and construed in accordance with the laws of India,
                      without regard to its conflict of law provisions.
                    </p>
                  </div>
                </motion.section>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-900/50 border-t border-gray-700">
              <p className="text-gray-400 text-sm text-center">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TermsOfServiceModal;
