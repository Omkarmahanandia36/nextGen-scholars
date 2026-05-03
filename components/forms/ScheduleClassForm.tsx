'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReCAPTCHA from 'react-google-recaptcha';

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
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

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
    if (!captchaToken) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }
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
          recaptchaToken: captchaToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
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
        setCaptchaToken(null);
      } else {
        setError(data.error || 'Failed to schedule class. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    setError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100"
      id='schedule-class'
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Schedule a Class</h2>

      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-900 rounded-lg font-medium border border-green-200">
          Class scheduled successfully! We will contact you soon.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-900 rounded-lg font-medium border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.studentName}
            onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium placeholder-gray-400"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Email
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium placeholder-gray-400"
            placeholder="Enter your email address"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium placeholder-gray-400"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Select Course
          </label>
          <select
            required
            value={formData.courseId}
            onChange={handleCourseChange}
            className="w-full px-4 py-3 border border-gray-300 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
          >
            <option key="default-course" value="" className="text-gray-500">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id} className="text-gray-900">
                {course.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Select Subjects
            </label>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              {selectedCourse.subjects.map((subject) => (
                <label key={subject} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.subjects.includes(subject)}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        subjects: e.target.checked
                          ? [...prev.subjects, subject]
                          : prev.subjects.filter(s => s !== subject),
                      }));
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-gray-900 font-medium group-hover:text-blue-700 transition-colors">{subject}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            Preferred Days
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            {days.map((day) => (
              <label key={day} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.preferredDays.includes(day)}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      preferredDays: e.target.checked
                        ? [...prev.preferredDays, day]
                        : prev.preferredDays.filter(d => d !== day),
                    }));
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-gray-900 font-medium group-hover:text-blue-700 transition-colors">{day}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Preferred Time Slot
          </label>
          <input
            type="time"
            required
            value={formData.preferredTime}
            onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
          />
          <p className="mt-1 text-sm text-gray-600 font-medium">Please select your preferred class time</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Additional Message (Optional)
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium placeholder-gray-400"
            placeholder="Any special requirements or questions?"
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

        {error && (
          <div className="p-4 bg-red-50 text-red-900 rounded-lg font-medium border border-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !captchaToken}
          className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg ${
            loading || !captchaToken
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200'
          }`}
        >
          {loading ? 'Scheduling...' : 'Schedule Class Now'}
        </button>
      </form>
    </motion.div>
  );
}
