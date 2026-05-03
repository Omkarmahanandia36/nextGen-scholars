'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import ReCAPTCHA from 'react-google-recaptcha';

interface TutorFormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  qualification: string;
  specialization: string;
  university: string;
  graduationYear: string;
  subjects: string[];
  experience: string;
  preferredLevels: string[];
  teachingMode: string[];
  bio: string;
  expectedRate: string;
  availability: string[];
  recaptchaToken: string;
}

interface RegisterTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterTutorModal: React.FC<RegisterTutorModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<TutorFormData>({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    location: '',
    // Academic Information
    qualification: '',
    specialization: '',
    university: '',
    graduationYear: '',
    // Teaching Information
    subjects: [] as string[],
    experience: '',
    preferredLevels: [] as string[],
    teachingMode: [] as string[],
    // Additional Information
    bio: '',
    expectedRate: '',
    availability: [] as string[],
    recaptchaToken: '',
  });
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (name: keyof Pick<TutorFormData, 'subjects' | 'preferredLevels' | 'teachingMode' | 'availability'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      alert('Please complete the reCAPTCHA verification');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/tutors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        onClose();
      } else {
        console.error('Failed to register tutor:', data.error);
      }
    } catch (error) {
      console.error('Error registering tutor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    setFormData(prev => ({ ...prev, recaptchaToken: token || '' }));
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Register as a Tutor</h2>
              <p className="mt-2 text-gray-600">Join our community of expert educators</p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-8 flex justify-between">
                {[1, 2, 3, 4].map((stepNumber) => (
                  <div
                    key={stepNumber}
                    className={`flex items-center ${stepNumber < 4 ? 'flex-1' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step >= stepNumber
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {stepNumber}
                    </div>
                    {stepNumber < 4 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          placeholder="e.g., Saheed Nagar, Bhubaneswara"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Highest Qualification
                        </label>
                        <select
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select Qualification</option>
                          <option value="Bachelors">Bachelors</option>
                          <option value="Masters">Masters</option>
                          <option value="PhD">PhD</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specialization
                        </label>
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          University/Institution
                        </label>
                        <input
                          type="text"
                          name="university"
                          value={formData.university}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Graduation Year
                        </label>
                        <input
                          type="number"
                          name="graduationYear"
                          value={formData.graduationYear}
                          onChange={handleInputChange}
                          min="1950"
                          max={new Date().getFullYear()}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Teaching Information</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subjects
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'].map((subject) => (
                            <button
                              key={subject}
                              type="button"
                              onClick={() => handleMultiSelect('subjects', subject)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                formData.subjects.includes(subject)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {subject}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teaching Experience (Years)
                        </label>
                        <input
                          type="number"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teaching Mode
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['Online', 'In-Person', 'Group Classes'].map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => handleMultiSelect('teachingMode', mode)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                formData.teachingMode.includes(mode)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="flex flex-col items-center justify-center my-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] md:col-span-2">
                <p className="text-sm text-gray-500 font-medium mb-4 text-center">Please verify that you are human</p>
                <div className="overflow-hidden rounded-lg shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md">
                  <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                    onChange={handleCaptchaChange}
                  />
                </div>
              </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="px-6 py-2 text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50"
                    >
                      Previous
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={step < 4 ? () => setStep(step + 1) : handleSubmit}
                    disabled={step === 4 && (!captchaToken || loading)}
                    className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 ${
                      step === 4 && (!captchaToken || loading)
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gradient-to-r hover:from-blue-700 hover:to-teal-600'
                    }`}
                  >
                    {step < 4 ? 'Next' : loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RegisterTutorModal;
