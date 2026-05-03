'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoCall, IoVideocam, IoMail, IoSend, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';
import ReCAPTCHA from 'react-google-recaptcha';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MeetingType = 'call' | 'video' | 'message' | null;

const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({ isOpen, onClose }) => {
  const [selectedType, setSelectedType] = useState<MeetingType>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      alert('Please complete the reCAPTCHA verification');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type: selectedType,
          recaptchaToken: captchaToken,
        }),
      });

      const data = await response.json();
      
      setIsSuccess(data.success);
      setShowConfirmation(true);

      if (data.success) {
        console.log('Meeting scheduled successfully');
      } else {
        console.error('Failed to schedule meeting');
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      setIsSuccess(false);
      setShowConfirmation(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    if (isSuccess) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Schedule a Meeting</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <IoClose className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {!selectedType ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType('call')}
                    className="p-6 border-2 border-blue-100 rounded-xl hover:border-blue-500 transition-colors group"
                  >
                    <IoCall className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-center">Audio Call</h3>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType('video')}
                    className="p-6 border-2 border-blue-100 rounded-xl hover:border-blue-500 transition-colors group"
                  >
                    <IoVideocam className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-center">Video Call</h3>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType('message')}
                    className="p-6 border-2 border-blue-100 rounded-xl hover:border-blue-500 transition-colors group"
                  >
                    <IoMail className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-center">Send Message</h3>
                  </motion.button>
                </div>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedType === 'call'
                        ? 'Schedule an Audio Call'
                        : selectedType === 'video'
                        ? 'Schedule a Video Call'
                        : 'Send a Message'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedType(null)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      Change Option
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    {selectedType !== 'message' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred Date
                          </label>
                          <input
                            type="date"
                            name="preferredDate"
                            required
                            value={formData.preferredDate}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred Time
                          </label>
                          <input
                            type="time"
                            name="preferredTime"
                            required
                            value={formData.preferredTime}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {selectedType === 'message' ? 'Your Message' : 'Additional Notes'}
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder={
                        selectedType === 'message'
                          ? 'Type your message here...'
                          : 'Any specific requirements or questions?'
                      }
                    />
                  </div>

                  <div className="flex flex-col items-center justify-center my-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                <p className="text-sm text-gray-500 font-medium mb-4 text-center">Please verify that you are human</p>
                <div className="overflow-hidden rounded-lg shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md">
                  <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                    onChange={handleCaptchaChange}
                  />
                </div>
              </div>

                  <div className="flex justify-end">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading || !captchaToken}
                      className={`px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 ${
                        loading || !captchaToken
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'hover:bg-blue-700'
                      }`}
                    >
                      {selectedType === 'message' ? (
                        <>
                          Send Message
                          <IoSend className="w-5 h-5" />
                        </>
                      ) : (
                        loading ? 'Scheduling...' : 'Schedule Meeting'
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseConfirmation}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                {isSuccess ? (
                  <IoCheckmarkCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                ) : (
                  <IoCloseCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                )}
                <h3 className="text-2xl font-bold mb-2">
                  {isSuccess ? 'Meeting Scheduled!' : 'Scheduling Failed'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {isSuccess
                    ? 'Your meeting has been successfully scheduled. We\'ll be in touch soon.'
                    : 'There was an error scheduling your meeting. Please try again later.'}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCloseConfirmation}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default ScheduleMeetingModal;