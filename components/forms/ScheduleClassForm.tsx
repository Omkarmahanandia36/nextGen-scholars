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

const courses: Course[] = [
  {
    id: '9th-science',
    name: '9th Class Science',
    subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science'],
  },
  {
    id: '10th-science',
    name: '10th Class Science',
    subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science'],
  },
  {
    id: '9th-arts',
    name: '9th Class Arts',
    subjects: ['English', 'Urdu', 'Islamic Studies', 'Pakistan Studies', 'General Mathematics'],
  },
  {
    id: '10th-arts',
    name: '10th Class Arts',
    subjects: ['English', 'Urdu', 'Islamic Studies', 'Pakistan Studies', 'General Mathematics'],
  },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = [
  '8:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM',
];

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
      className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl"
      id='schedule-class'
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule a Class</h2>

      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
          Class scheduled successfully! We will contact you soon.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.studentName}
            onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Course
          </label>
          <select
            required
            value={formData.courseId}
            onChange={handleCourseChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option key="default-course" value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Subjects
            </label>
            <div className="grid grid-cols-2 gap-4">
              {selectedCourse.subjects.map((subject) => (
                <label key={subject} className="flex items-center space-x-2">
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
                    className="rounded text-blue-500 focus:ring-blue-500"
                  />
                  <span>{subject}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Days
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {days.map((day) => (
              <label key={day} className="flex items-center space-x-2">
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
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Time
          </label>
          <select
            required
            value={formData.preferredTime}
            onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option key="default-time" value="">Select a time slot</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Message (Optional)
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-center my-4">
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
            onChange={handleCaptchaChange}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !captchaToken}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
            loading || !captchaToken
              ? 'bg-gradient-to-r from-blue-400 to-teal-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-teal-500 hover:bg-gradient-to-r hover:from-blue-700 hover:to-teal-600'
          }`}
        >
          {loading ? 'Scheduling...' : 'Schedule Class'}
        </button>
      </form>
    </motion.div>
  );
}
