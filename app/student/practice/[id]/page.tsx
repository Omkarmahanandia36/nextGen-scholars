'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { IoTime, IoChevronForward, IoChevronBack, IoCheckmarkCircle, IoAlertCircle } from 'react-icons/io5';

interface Question {
  questionText: string;
  options: string[];
}

interface Exam {
  title: string;
  subject: string;
  durationMinutes: number;
  questions: Question[];
}

interface ExamResult {
  score: number;
  totalQuestions: number;
}

export default function TakeExamPage() {
  const { id } = useParams();
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Error attempting to enable full-screen mode: ${errorMessage}`);
      });
    }
  };

  const startExam = () => {
    setHasStarted(true);
    toggleFullScreen();
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await fetch(`/api/student/exams/${id}`);
        const data = await response.json();
        if (data.success) {
          setExam(data.exam);
          setAnswers(new Array(data.exam.questions.length).fill(-1));
          setTimeLeft(data.exam.durationMinutes * 60);
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  const handleSubmit = useCallback(async () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setSubmitted(true);
    try {
      const response = await fetch(`/api/student/exams/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.result);
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
    }
  }, [id, answers]);

  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && exam && !submitted) {
      handleSubmit();
    }
  }, [timeLeft, submitted, exam, handleSubmit]);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!exam) return <div className="min-h-screen flex items-center justify-center text-red-500">Exam not found</div>;

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <IoCheckmarkCircle className="text-5xl text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Completed!</h1>
          <p className="text-gray-500 mb-8">Great job on finishing your practice session.</p>
          
          <div className="bg-gray-50 p-6 rounded-2xl mb-8">
            <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Your Score</p>
            <p className="text-5xl font-black text-blue-600">{result.score} <span className="text-2xl text-gray-400">/ {result.totalQuestions}</span></p>
          </div>

          <button 
            onClick={() => router.push('/student/practice')}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg"
          >
            Back to Exams
          </button>
        </motion.div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const question = exam.questions[currentQuestion];

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-white p-10 rounded-3xl shadow-2xl border border-gray-100"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <IoAlertCircle className="text-3xl text-blue-600" />
            </div>
            <h1 className="text-3xl font-black text-gray-900">Exam Ready</h1>
          </div>

          <div className="space-y-6 mb-10">
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-2">Instructions:</h3>
              <ul className="text-blue-800 text-sm space-y-2 list-disc list-inside">
                <li>This exam consists of {exam.questions.length} questions.</li>
                <li>You have exactly {exam.durationMinutes} minutes to complete it.</li>
                <li>The exam will automatically enter <b>Full Screen Mode</b> for an optimal experience.</li>
                <li>Do not refresh or exit full screen until you submit.</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 uppercase font-bold">Subject</p>
                <p className="font-bold text-gray-700">{exam.subject}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 uppercase font-bold">Questions</p>
                <p className="font-bold text-gray-700">{exam.questions.length}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={startExam}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200 active:scale-[0.98]"
          >
            Start Practice Exam
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Exam Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
            <p className="text-xs text-gray-500">{exam.subject}</p>
          </div>
          <div className="flex items-center space-x-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
            <IoTime className="text-blue-500 text-xl" />
            <span className={`font-mono text-xl font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-gray-700'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Question {currentQuestion + 1} of {exam.questions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / exam.questions.length) * 100)}% Complete</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / exam.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 leading-relaxed">
              {question.questionText}
            </h2>

            <div className="space-y-4">
              {question.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex items-center justify-between group ${
                    answers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-100 hover:border-blue-200 text-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      answers[currentQuestion] === index ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-medium">{option}</span>
                  </div>
                  {answers[currentQuestion] === index && <IoCheckmarkCircle className="text-2xl" />}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer Controls */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <IoChevronBack />
            <span>Previous</span>
          </button>

          {currentQuestion === exam.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center space-x-2"
            >
              <span>Submit Exam</span>
              <IoCheckmarkCircle />
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(exam.questions.length - 1, prev + 1))}
              className="px-12 py-4 bg-white border border-gray-200 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center space-x-2"
            >
              <span>Next Question</span>
              <IoChevronForward />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
