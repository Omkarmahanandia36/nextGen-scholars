'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoPerson, IoBook, IoSchool, IoSave, IoAlertCircle, IoCheckmarkCircle } from 'react-icons/io5';
import { useRouter } from 'next/navigation';

interface ProfileData {
  name: string;
  email: string;
  className: string;
  subjects: string[];
}

const AVAILABLE_CLASSES = [
  'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
  'JEE Preparation', 'NEET Preparation'
];

const AVAILABLE_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 
  'Computer Science', 'English', 'History', 'Geography'
];

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/student/profile');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/student/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          className: data.className,
          subjects: data.subjects
        }),
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleSubject = (subject: string) => {
    if (!data) return;
    const newSubjects = data.subjects.includes(subject)
      ? data.subjects.filter(s => s !== subject)
      : [...data.subjects, subject];
    setData({ ...data, subjects: newSubjects });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500">Manage your personal information and academic preferences</p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-8">
            <form onSubmit={handleSave} className="space-y-8">
              {/* Basic Info Section */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <IoPerson />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input 
                      type="text"
                      value={data.name}
                      onChange={(e) => setData({ ...data, name: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-black font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input 
                      type="email"
                      value={data.email}
                      className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed outline-none"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-400 italic">Email cannot be changed</p>
                  </div>
                </div>
              </section>

              {/* Academic Info Section */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                    <IoSchool />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Academic Details</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Grade / Program</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {AVAILABLE_CLASSES.map((cls) => (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => setData({ ...data, className: cls })}
                          className={`p-3 rounded-xl text-sm font-medium transition-all border ${
                            data.className === cls
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                          }`}
                        >
                          {cls}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">My Subjects</label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_SUBJECTS.map((subject) => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => toggleSubject(subject)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border flex items-center gap-2 ${
                            data.subjects.includes(subject)
                              ? 'bg-teal-500 border-teal-500 text-white'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-teal-300'
                          }`}
                        >
                          {subject}
                          {data.subjects.includes(subject) && <IoCheckmarkCircle />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Status Message */}
              {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 ${
                  message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {message.type === 'success' ? <IoCheckmarkCircle className="text-xl" /> : <IoAlertCircle className="text-xl" />}
                  <p className="font-medium">{message.text}</p>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {saving ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <IoSave className="text-xl" />
                  )}
                  {saving ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
