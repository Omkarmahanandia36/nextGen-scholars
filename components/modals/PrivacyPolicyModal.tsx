'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaShieldAlt, FaUserLock, FaShareAlt, FaLock, FaUserCog, FaHistory, FaPhoneAlt } from 'react-icons/fa';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
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
            <div className="relative h-32 bg-gradient-to-r from-blue-600 to-teal-500 p-6 flex items-center">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative">
                <h2 className="text-3xl font-bold text-white mb-2">Privacy Policy</h2>
                <p className="text-white/80">Your privacy is our top priority</p>
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
                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                      <FaShieldAlt className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Information We Collect</h3>
                  </div>
                  <div className="text-gray-300 space-y-3">
                    <p>At EduVista Academy, we collect information to provide better services to our users:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400">
                      <li>Personal information (name, email address, phone number)</li>
                      <li>Educational background and preferences</li>
                      <li>Usage data and interaction with our platform</li>
                      <li>Device and browser information</li>
                    </ul>
                  </div>
                </motion.section>

                <motion.section
                  variants={sectionVariants}
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-teal-500/10 text-teal-400 rounded-lg">
                      <FaUserLock className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">How We Use Your Information</h3>
                  </div>
                  <div className="text-gray-300 space-y-3">
                    <p>We use the collected information for:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400">
                      <li>Providing and improving our educational services</li>
                      <li>Personalizing your learning experience</li>
                      <li>Communicating with you about our services</li>
                      <li>Ensuring platform security and preventing fraud</li>
                    </ul>
                  </div>
                </motion.section>

                <motion.section
                  variants={sectionVariants}
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
                      <FaShareAlt className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Information Sharing</h3>
                  </div>
                  <div className="text-gray-300 space-y-3">
                    <p>We do not sell your personal information to third parties. We may share your information with:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400">
                      <li>Tutors and educational service providers</li>
                      <li>Service providers who assist in platform operations</li>
                      <li>Legal authorities when required by law</li>
                    </ul>
                  </div>
                </motion.section>

                <motion.section
                  variants={sectionVariants}
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-red-500/10 text-red-400 rounded-lg">
                      <FaLock className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Data Security</h3>
                  </div>
                  <div className="text-gray-300">
                    <p>
                      We implement appropriate security measures to protect your information against unauthorized access,
                      alteration, disclosure, or destruction.
                    </p>
                  </div>
                </motion.section>

                <motion.section
                  variants={sectionVariants}
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-lg">
                      <FaUserCog className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Your Rights</h3>
                  </div>
                  <div className="text-gray-300 space-y-3">
                    <p>You have the right to:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400">
                      <li>Access your personal information</li>
                      <li>Correct inaccurate information</li>
                      <li>Request deletion of your information</li>
                      <li>Opt-out of marketing communications</li>
                    </ul>
                  </div>
                </motion.section>

                <motion.section
                  variants={sectionVariants}
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-green-500/10 text-green-400 rounded-lg">
                      <FaHistory className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Updates to Privacy Policy</h3>
                  </div>
                  <div className="text-gray-300">
                    <p>
                      We may update this privacy policy from time to time. We will notify you of any changes by posting
                      the new policy on this page.
                    </p>
                  </div>
                </motion.section>

                <motion.section
                  variants={sectionVariants}
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-pink-500/10 text-pink-400 rounded-lg">
                      <FaPhoneAlt className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Contact Us</h3>
                  </div>
                  <div className="text-gray-300 space-y-3">
                    <p>If you have any questions about this privacy policy, please contact us at:</p>
                    <div className="space-y-1 text-gray-400">
                      <p>Email: privacy@eduvista.com</p>
                      <p>Phone: +92 XXX XXXXXXX</p>
                    </div>
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

export default PrivacyPolicyModal;
