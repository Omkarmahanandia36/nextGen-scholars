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
}

interface RegisterTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterTutorModal: React.FC<RegisterTutorModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<TutorFormData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    qualification: '',
    specialization: '',
    university: '',
    graduationYear: '',
    subjects: [],
    experience: '',
    preferredLevels: [],
    teachingMode: [],
    bio: '',
    expectedRate: '',
    availability: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tutors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken: captchaToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          location: '',
          qualification: '',
          specialization: '',
          university: '',
          graduationYear: '',
          subjects: [],
          experience: '',
          preferredLevels: [],
          teachingMode: [],
          bio: '',
          expectedRate: '',
          availability: [],
        });
        setCaptchaToken(null);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setStep(1);
        }, 2000);
      } else {
        setError(data.error || 'Failed to register. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Register as a Tutor</h2>
              <p className="text-gray-600 mt-2">
                Join our teaching community and help students excel
              </p>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="text-green-600 text-xl mb-4">
                  Registration successful! We&apos;ll review your application and get back to you soon.
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <div className="flex justify-between items-center">
                    {[1, 2, 3, 4].map((stepNumber) => (
                      <div
                        key={stepNumber}
                        className={`w-1/4 h-2 rounded-full mx-1 ${
                          stepNumber <= step ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Form steps content here */}
                  
                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <ReCAPTCHA
                          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                          onChange={handleCaptchaChange}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-6">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                      >
                        Previous
                      </button>
                    )}
                    <button
                      type={step === 4 ? 'submit' : 'button'}
                      onClick={step < 4 ? () => setStep(step + 1) : undefined}
                      disabled={step === 4 && (!captchaToken || loading)}
                      className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                        step === 4 && (!captchaToken || loading)
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      {step === 4
                        ? loading
                          ? 'Submitting...'
                          : 'Submit Application'
                        : 'Next'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RegisterTutorModal;
