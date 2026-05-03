'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoDocumentText, IoTime, IoChevronForward, IoCheckmarkCircle, 
  IoSparkles, IoAddCircle, IoRefreshCircle, IoAlertCircle
} from 'react-icons/io5';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PracticeExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/student/exams');
      const data = await response.json();
      if (data.success) {
        setExams(data.exams);
        setSubjects(data.subjects || []);
        if (data.subjects?.length > 0 && !selectedSubject) {
          setSelectedSubject(data.subjects[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleGenerateAIQuiz = async () => {
    if (!selectedSubject) return;
    
    setGenerating(true);
    setError('');
    try {
      const response = await fetch('/api/student/exams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: selectedSubject })
      });
      
      const data = await response.json();
      if (data.success) {
        // Redirect to the new exam
        router.push(`/student/practice/${data.examId}`);
      } else {
        setError(data.message || 'Failed to generate quiz');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Link href="/student/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-700 mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Practice Exams</h1>
              <p className="text-gray-500">Test your knowledge with daily practice sessions.</p>
            </div>
          </div>
        </header>

        {/* AI Generator Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <IoSparkles className="text-8xl text-blue-600" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-4 text-blue-600">
              <IoSparkles className="text-xl" />
              <span className="font-bold text-sm uppercase tracking-wider">AI Powered</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Generate Instant Quiz</h2>
            <p className="text-gray-500 text-sm mb-6">Can't find an exam? Let our AI create a custom practice test for you right now.</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900"
              >
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button 
                onClick={handleGenerateAIQuiz}
                disabled={generating || !selectedSubject}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2 min-w-[180px]"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <IoAddCircle className="text-xl" />
                    <span>Generate Quiz</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center space-x-2 text-red-500 bg-red-50 p-3 rounded-xl text-sm"
              >
                <IoAlertCircle className="text-lg flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 px-2">Available Today</h3>
          {exams.length > 0 ? (
            exams.map((exam) => (
              <motion.div
                key={exam._id}
                whileHover={{ y: -4 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-blue-50 rounded-2xl">
                    <IoDocumentText className="text-2xl text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{exam.title}</h2>
                    <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                      <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-700 font-medium">{exam.subject}</span>
                      <span className="flex items-center"><IoTime className="mr-1" /> {exam.durationMinutes} mins</span>
                      <span className="flex items-center"><IoCheckmarkCircle className="mr-1" /> {exam.questions.length} Qs</span>
                    </div>
                  </div>
                </div>
                
                <Link href={`/student/practice/${exam._id}`}>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md flex items-center space-x-2 w-full md:w-auto justify-center">
                    <span>Start Exam</span>
                    <IoChevronForward />
                  </button>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoDocumentText className="text-4xl text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No official exams today</h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-2">Check back later for teacher-assigned exams or use the AI generator above to practice now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
