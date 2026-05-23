'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiBookOpen, 
  FiCalendar, 
  FiClock, 
  FiMessageSquare, 
  FiCheck, 
  FiRefreshCw, 
  FiArrowRight,
  FiFileText,
  FiLock
} from 'react-icons/fi';

interface Course {
  id: string;
  name: string;
  subjects: string[];
}

interface FormData {
  studentName: string;
  email: string;
  phone: string;
  courseId: string;
  courseName: string;
  subjects: string[];
  preferredDays: string[];
  preferredTime: string;
  message: string;
  recaptchaToken?: string;
}

const courses: Course[] = Array.from({ length: 10 }, (_, i) => ({
  id: `class-${i + 1}`,
  name: `Class ${i + 1}`,
  subjects: ['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science'],
}));

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ScheduleClassForm() {
  const [formData, setFormData] = useState<FormData>({
    studentName: '',
    email: '',
    phone: '',
    courseId: '',
    courseName: '',
    subjects: [],
    preferredDays: [],
    preferredTime: '',
    message: '',
  });

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState<FormData | null>(null);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const course = courses.find(c => c.id === e.target.value) || null;
    setSelectedCourse(course);
    setFormData(prev => ({
      ...prev,
      courseId: course?.id || '',
      courseName: course?.name || '',
      subjects: [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/schedule-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken: 'dummy-token',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessData({ ...formData });
        setSuccess(true);
        setFormData({
          studentName: '',
          email: '',
          phone: '',
          courseId: '',
          courseName: '',
          subjects: [],
          preferredDays: [],
          preferredTime: '',
          message: '',
        });
        setSelectedCourse(null);
      } else {
        setError(data.error || 'Failed to schedule class. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="relative py-16 px-4 max-w-4xl mx-auto overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div
            key="scheduling-form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative bg-gradient-to-br from-blue-50/50 via-white to-teal-50/30 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(59,130,246,0.08)] border border-blue-100/50"
            id="schedule-class"
          >
            {/* Header Section */}
            <div className="text-center mb-10">
              <span className="inline-flex px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-teal-500/10 text-blue-600 font-bold text-xs uppercase tracking-wider mb-4 border border-blue-100/30">
                Book a Slot
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                Schedule a{' '}
                <strong className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 font-extrabold inline-block">
                  Class Room
                </strong>
              </h2>
              <p className="text-gray-500 mt-3 text-base md:text-lg max-w-md mx-auto">
                Fill in your program and schedule details below to start your professional tutoring experience.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-red-50 text-red-800 rounded-2xl font-semibold border border-red-100 text-sm flex items-center gap-3"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* SECTION 1: Personal Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-teal-500/10 text-blue-600 rounded-xl">
                    <FiUser className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="group">
                    <label className="block text-sm font-bold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
                      Full Name
                    </label>
                    <div className="relative rounded-xl transition-all shadow-sm focus-within:shadow-md">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                        <FiUser className="w-5 h-5 transition-colors" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.studentName}
                        onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3.5 border border-gray-200 text-gray-900 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium placeholder-gray-400 transition-all duration-200"
                        placeholder="Enter student's full name"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="group">
                    <label className="block text-sm font-bold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
                      Phone Number
                    </label>
                    <div className="relative rounded-xl transition-all shadow-sm focus-within:shadow-md">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                        <FiPhone className="w-5 h-5 transition-colors" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3.5 border border-gray-200 text-gray-900 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium placeholder-gray-400 transition-all duration-200"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="group md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
                      Email Address
                    </label>
                    <div className="relative rounded-xl transition-all shadow-sm focus-within:shadow-md">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                        <FiMail className="w-5 h-5 transition-colors" />
                      </div>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3.5 border border-gray-200 text-gray-900 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium placeholder-gray-400 transition-all duration-200"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Academic Profile */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-teal-500/10 text-blue-600 rounded-xl">
                    <FiBookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Academic Program</h3>
                </div>

                <div className="space-y-6">
                  {/* Select Course */}
                  <div className="group">
                    <label className="block text-sm font-bold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
                      Select Grade / Course
                    </label>
                    <div className="relative rounded-xl transition-all shadow-sm focus-within:shadow-md">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                        <FiBookOpen className="w-5 h-5 transition-colors" />
                      </div>
                      <select
                        required
                        value={formData.courseId}
                        onChange={handleCourseChange}
                        className="w-full pl-11 pr-10 py-3.5 border border-gray-200 text-gray-900 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold appearance-none cursor-pointer transition-all duration-200"
                      >
                        <option key="default-course" value="" className="text-gray-500">Select a course</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id} className="text-gray-900 font-medium">
                            {course.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Select Subjects Chips */}
                  {selectedCourse && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3"
                    >
                      <label className="block text-sm font-bold text-gray-700">
                        Choose Subjects
                      </label>
                      <div className="flex flex-wrap gap-2.5 p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100/80">
                        {selectedCourse.subjects.map((subject) => {
                          const isSelected = formData.subjects.includes(subject);
                          return (
                            <motion.button
                              type="button"
                              key={subject}
                              whileHover={{ y: -1.5, scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  subjects: isSelected
                                    ? prev.subjects.filter(s => s !== subject)
                                    : [...prev.subjects, subject],
                                }));
                              }}
                              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                                isSelected
                                  ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white border-transparent shadow-md shadow-blue-500/20'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/10'
                              }`}
                            >
                              {isSelected && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
                              {subject}
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* SECTION 3: Schedule Preferences */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-teal-500/10 text-blue-600 rounded-xl">
                    <FiCalendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Schedule Preferences</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Preferred Days Chips */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">
                      Preferred Days
                    </label>
                    <div className="flex flex-wrap gap-2.5 p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100/80">
                      {days.map((day) => {
                        const isSelected = formData.preferredDays.includes(day);
                        return (
                          <motion.button
                            type="button"
                            key={day}
                            whileHover={{ y: -1.5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                preferredDays: isSelected
                                  ? prev.preferredDays.filter(d => d !== day)
                                  : [...prev.preferredDays, day],
                              }));
                            }}
                            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                              isSelected
                                ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white border-transparent shadow-md shadow-blue-500/20'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/10'
                            }`}
                          >
                            {isSelected && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
                            {day}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Time */}
                  <div className="group">
                    <label className="block text-sm font-bold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
                      Preferred Time Slot
                    </label>
                    <div className="relative rounded-xl transition-all shadow-sm focus-within:shadow-md">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                        <FiClock className="w-5 h-5 transition-colors" />
                      </div>
                      <input
                        type="time"
                        required
                        value={formData.preferredTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3.5 border border-gray-200 text-gray-900 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all duration-200"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-400 font-medium">Please select your preferred class timing.</p>
                  </div>
                </div>
              </div>

              {/* Additional Message */}
              <div className="group">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-teal-500/10 text-blue-600 rounded-xl">
                    <FiMessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Additional Message</h3>
                </div>

                <div className="relative rounded-xl shadow-sm transition-all focus-within:shadow-md">
                  <div className="absolute top-4 left-4 pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                    <FiFileText className="w-5 h-5 transition-colors" />
                  </div>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 text-gray-900 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium placeholder-gray-400 transition-all duration-200"
                    placeholder="Any special requests, specific topics, or questions?"
                  />
                </div>
              </div>



              {/* Submit Button */}
              {(() => {
                const isBtnDisabled = loading || 
                  !formData.studentName.trim() || 
                  !formData.email.trim() || 
                  !formData.phone.trim() || 
                  !formData.courseId || 
                  formData.subjects.length === 0 || 
                  formData.preferredDays.length === 0 || 
                  !formData.preferredTime;
                return (
                  <motion.button
                    type="submit"
                    disabled={isBtnDisabled}
                    whileHover={isBtnDisabled ? {} : { y: -2, scale: 1.01 }}
                    whileTap={isBtnDisabled ? {} : { scale: 0.99 }}
                    className={`w-full py-4 px-6 rounded-2xl text-white font-extrabold text-base md:text-lg shadow-lg flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group border ${
                      isBtnDisabled
                        ? 'bg-gradient-to-r from-blue-50/60 via-slate-50/40 to-teal-50/60 text-blue-400/60 border-blue-100/30 cursor-not-allowed shadow-[0_4px_20px_rgba(0,0,0,0.01)]'
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 hover:from-blue-700 hover:via-indigo-700 hover:to-teal-600 shadow-[0_8px_30px_rgba(59,130,246,0.25)] hover:shadow-[0_15px_35px_rgba(59,130,246,0.4)] cursor-pointer border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Glossy sweep glare effect */}
                    {!isBtnDisabled && (
                      <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
                    )}

                    {loading ? (
                      <>
                        <FiRefreshCw className="w-5 h-5 animate-spin" />
                        <strong className="font-extrabold">Scheduling Class...</strong>
                      </>
                    ) : isBtnDisabled ? (
                      <>
                        <strong className="font-extrabold">Fill All Fields to Book Slot</strong>
                        <FiLock className="w-4.5 h-4.5 text-blue-400/40 animate-pulse" />
                      </>
                    ) : (
                      <>
                        <strong className="font-extrabold text-white">Book Class Slot Now</strong>
                        <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </motion.button>
                );
              })()}
            </form>
          </motion.div>
        ) : (
          /* SUCCESS SCREEN: Nice and Beautiful Confirmation */
          <motion.div
            key="success-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, type: 'spring', damping: 25 }}
            className="relative bg-gradient-to-br from-green-50/50 via-white to-teal-50/30 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(16,185,129,0.06)] border border-green-100/50 text-center overflow-hidden"
          >
            {/* Glowing background shapes for success screen */}
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-green-50/50 to-transparent pointer-events-none"></div>
            <div className="absolute -top-20 -right-20 w-52 h-52 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-teal-100/30 rounded-full blur-3xl pointer-events-none"></div>

            {/* Checkmark animation */}
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.15 }}
              className="w-24 h-24 bg-gradient-to-tr from-green-500 to-emerald-400 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/25 mb-8"
            >
              <FiCheck className="w-12 h-12 stroke-[3.5]" />
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight"
            >
              Class Scheduled{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-500">
                Successfully!
              </span>
            </motion.h3>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-gray-500 mt-3 text-base md:text-lg max-w-md mx-auto"
            >
              Your scheduling request is confirmed! A confirmation mail has been dispatched and an administrative expert will contact you shortly.
            </motion.p>

            {/* Visual Receipt summary box */}
            {successData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20, delay: 0.45 }}
                className="my-8 bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-6 md:p-8 text-left space-y-4 max-w-md mx-auto shadow-inner relative"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Schedule Details
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-2xs font-extrabold uppercase border border-green-200/50">
                    Confirmed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <span className="block text-2xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">Student Name</span>
                    <strong className="text-gray-800 font-extrabold">{successData.studentName}</strong>
                  </div>
                  <div>
                    <span className="block text-2xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">Grade / Course</span>
                    <strong className="text-gray-800 font-extrabold">{successData.courseName}</strong>
                  </div>

                  {successData.subjects.length > 0 && (
                    <div className="col-span-2 border-t border-gray-100/70 pt-3">
                      <span className="block text-2xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Selected Subjects</span>
                      <div className="flex flex-wrap gap-1.5">
                        {successData.subjects.map((sub) => (
                          <span key={sub} className="px-2.5 py-0.5 bg-blue-50/70 text-blue-700 rounded-md text-xs font-extrabold border border-blue-100/30">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-gray-100 pt-3">
                    <div>
                      <span className="block text-2xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">Days</span>
                      <strong className="text-gray-800 font-extrabold text-xs">{successData.preferredDays.join(', ')}</strong>
                    </div>
                    <div>
                      <span className="block text-2xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">Preferred Time</span>
                      <strong className="text-gray-800 font-extrabold">⏰ {successData.preferredTime}</strong>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Back action */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ y: -1.5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSuccess(false);
                setSuccessData(null);
              }}
              className="px-6 py-3.5 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 rounded-xl text-gray-700 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 mx-auto shadow-sm"
            >
              <FiRefreshCw className="w-4 h-4" />
              Schedule Another Class
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
