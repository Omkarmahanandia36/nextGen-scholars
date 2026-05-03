'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { IoBook, IoSchool, IoArrowForward } from 'react-icons/io5';

const CLASSES = [
  'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 
  'JEE Preparation', 'NEET Preparation', 'Other'
];

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 
  'English', 'Computer Science', 'Social Studies'
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const toggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedClass || selectedSubjects.length === 0) {
      setError('Please select your class and at least one subject');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/student/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: selectedClass,
          subjects: selectedSubjects,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Onboarding failed');
      }

      router.push('/student/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/20"
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to NextGen Scholar!</h1>
            <p className="text-gray-600">Let's personalize your learning experience.</p>
            
            {/* Progress Bar */}
            <div className="mt-8 flex items-center justify-center space-x-4">
              <div className={`h-2 w-16 rounded-full transition-all ${step >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
              <div className={`h-2 w-16 rounded-full transition-all ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 text-sm text-red-500 bg-red-50 rounded-xl border border-red-100 text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <IoSchool className="text-blue-600 text-2xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Which class are you in?</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {CLASSES.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`p-4 rounded-2xl border-2 transition-all text-center font-medium ${
                      selectedClass === cls
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                        : 'border-gray-100 hover:border-blue-200 text-gray-600'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>

              <div className="pt-8">
                <button
                  onClick={() => selectedClass && setStep(2)}
                  disabled={!selectedClass}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <span>Next Step</span>
                  <IoArrowForward />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-teal-100 rounded-xl">
                  <IoBook className="text-teal-600 text-2xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">What subjects do you want to study?</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    className={`p-4 rounded-2xl border-2 transition-all text-center font-medium ${
                      selectedSubjects.includes(subject)
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md'
                        : 'border-gray-100 hover:border-teal-200 text-gray-600'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>

              <div className="pt-8 flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || selectedSubjects.length === 0}
                  className="flex-[2] py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? 'Setting up...' : 'Start Learning'}
                  {!loading && <IoArrowForward />}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
