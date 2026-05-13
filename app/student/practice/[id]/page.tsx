'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { IoTime, IoChevronForward, IoChevronBack, IoCheckmarkCircle, IoAlertCircle, IoDocumentText } from 'react-icons/io5';

interface Question {
  questionText: string;
  options: string[];
  explanation?: string;
  correctOptionIndex: number;
}

interface Exam {
  title: string;
  subject: string;
  durationMinutes: number;
  questions: Question[];
}

interface ProcessedAnswer {
  questionIndex: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

interface ExamResult {
  score: number;
  totalQuestions: number;
  answers: ProcessedAnswer[];
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
        console.error('Fullscreen error:', err);
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
      document.exitFullscreen().catch(() => {});
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
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <div className="font-bold text-2xl text-blue-600 tracking-tighter">LOADING ARENA...</div>
        </div>
      </div>
    );
  }
  
  if (!exam) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-8 text-center">
      <IoAlertCircle className="text-8xl text-blue-600 mb-4" />
      <h1 className="text-4xl font-bold text-gray-900 tracking-tighter">EXAM NOT FOUND</h1>
      <button onClick={() => router.back()} className="mt-8 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20">GO BACK</button>
    </div>
  );

  if (submitted && result) {
    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white p-10 md:p-16 rounded-3xl shadow-2xl border border-gray-100 text-center mb-12">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-600/20">
              <IoCheckmarkCircle className="text-6xl text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tighter">PERFORMANCE SUMMARY</h1>
            <p className="text-gray-500 font-bold text-lg mb-12">Analysis of your practice session for <span className="text-blue-600 underline">{exam.title}</span></p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100/50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Final Score</p>
                <p className="text-5xl font-bold text-gray-900">{result.score}<span className="text-2xl text-gray-300">/{result.totalQuestions}</span></p>
              </div>
              <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100/50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Accuracy</p>
                <p className="text-5xl font-bold text-gray-900">{percentage}%</p>
              </div>
              <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100/50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Time Spent</p>
                <p className="text-5xl font-bold text-gray-900">DONE</p>
              </div>
            </div>

            <button 
              onClick={() => router.push('/student/practice')}
              className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-600/20"
            >
              CONTINUE PRACTICE
            </button>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-8 px-4">QUESTION ANALYSIS</h2>
          <div className="space-y-6">
            {exam.questions.map((q, idx) => {
              const studentAns = result.answers.find(a => a.questionIndex === idx);
              const isCorrect = studentAns?.isCorrect;
              return (
                <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                  <div className={`absolute top-0 left-0 w-2 h-full ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Question {idx + 1}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 leading-tight">{q.questionText}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {q.options.map((opt, optIdx) => (
                      <div 
                        key={optIdx} 
                        className={`p-4 rounded-xl border-2 text-sm font-bold flex items-center justify-between ${
                          optIdx === q.correctOptionIndex 
                            ? 'border-green-500 bg-green-50 text-green-700' 
                            : optIdx === studentAns?.selectedOptionIndex 
                              ? 'border-red-500 bg-red-50 text-red-700' 
                              : 'border-blue-50 bg-blue-50/50 text-gray-400'
                        }`}
                      >
                        <span>{opt}</span>
                        {optIdx === q.correctOptionIndex && <IoCheckmarkCircle className="text-xl" />}
                        {optIdx === studentAns?.selectedOptionIndex && !isCorrect && <IoAlertCircle className="text-xl" />}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Explanation</p>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100"
        >
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
              <IoDocumentText className="text-4xl" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">{exam.title}</h1>
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase">
              <span>{exam.subject}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Time Limit</p>
              <p className="text-xl font-bold text-gray-900">{exam.durationMinutes} MINS</p>
            </div>
            <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Qs</p>
              <p className="text-xl font-bold text-gray-900">{exam.questions.length} ITEMS</p>
            </div>
          </div>

          <div className="bg-blue-50/30 p-8 rounded-3xl border border-blue-100/50 mb-10">
            <h3 className="font-bold text-blue-900 text-xs uppercase tracking-widest mb-4">Guidelines:</h3>
            <ul className="text-gray-600 text-sm font-medium space-y-3">
              <li className="flex items-center space-x-3"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> <span>Do not refresh the browser during exam.</span></li>
              <li className="flex items-center space-x-3"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> <span>Full screen mode is mandatory for practice.</span></li>
              <li className="flex items-center space-x-3"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> <span>The exam will auto-submit when time expires.</span></li>
            </ul>
          </div>

          <button 
            onClick={startExam}
            className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/20"
          >
            ENTER THE ARENA
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Exam Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">{exam.title}</h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-1">{exam.subject}</p>
          </div>
          <div className="flex items-center space-x-4 bg-blue-50/50 px-5 py-2.5 rounded-2xl border border-blue-100/50">
            <IoTime className="text-blue-600 text-xl" />
            <span className={`font-mono text-2xl font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-gray-900'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 md:p-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
            <span>QUESTION {currentQuestion + 1} OF {exam.questions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / exam.questions.length) * 100)}% EXPLORED</span>
          </div>
          <div className="h-4 w-full bg-blue-50/30 rounded-full overflow-hidden p-1 border border-blue-100/20 shadow-sm">
            <motion.div 
              className="h-full bg-blue-600 rounded-full shadow-lg shadow-blue-600/10"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / exam.questions.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white p-10 md:p-16 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-50 min-h-[400px] flex flex-col"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-12 leading-[1.3] tracking-tight">
              {question.questionText}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
              {question.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`group relative p-6 rounded-2xl border-2 transition-all text-left flex items-center justify-between ${
                    answers[currentQuestion] === index
                      ? 'border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-600/10'
                      : 'border-blue-100/50 hover:border-blue-600/20 text-gray-600 bg-blue-50/30'
                  }`}
                >
                  <div className="flex items-center space-x-5">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-colors ${
                      answers[currentQuestion] === index ? 'bg-white text-blue-600' : 'bg-white border border-gray-100 text-gray-300'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-bold text-lg">{option}</span>
                  </div>
                  {answers[currentQuestion] === index && <IoCheckmarkCircle className="text-3xl" />}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer Controls */}
        <div className="mt-12 flex items-center justify-between gap-6">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-8 py-5 bg-blue-50/30 border-2 border-blue-100/50 text-gray-900 rounded-3xl font-bold text-lg hover:bg-blue-50 transition-all flex items-center space-x-3 disabled:opacity-30 group"
          >
            <IoChevronBack className="group-hover:-translate-x-1 transition-transform" />
            <span>BACK</span>
          </button>

          {currentQuestion === exam.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-16 py-5 bg-blue-600 text-white rounded-3xl font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-600/20 flex items-center space-x-3"
            >
              <span>SUBMIT ARENA</span>
              <IoCheckmarkCircle className="text-2xl" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(exam.questions.length - 1, prev + 1))}
              className="px-12 py-5 bg-blue-600 text-white rounded-3xl font-bold text-lg hover:scale-105 active:scale-95 transition-all flex items-center space-x-3 shadow-xl shadow-blue-600/10 group"
            >
              <span>NEXT STEP</span>
              <IoChevronForward className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
