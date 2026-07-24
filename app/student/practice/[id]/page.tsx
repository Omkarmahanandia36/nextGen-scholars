'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const renderMathText = (text: string) => {
  if (!text) return '';
  const parts = text.split('$');
  return parts.map((part, index) => {
    if (index % 2 === 0) {
      return <span key={index}>{part}</span>;
    }
    let mathStr = part;
    mathStr = mathStr
      .replace(/\\pm/g, '±')
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\ne/g, '≠')
      .replace(/\\le/g, '≤')
      .replace(/\\ge/g, '≥')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\theta/g, 'θ')
      .replace(/\\pi/g, 'π')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\delta/g, 'δ')
      .replace(/\\lambda/g, 'λ')
      .replace(/\\sigma/g, 'σ')
      .replace(/\\omega/g, 'ω')
      .replace(/\\phi/g, 'φ')
      .replace(/\\infty/g, '∞')
      .replace(/\\approx/g, '≈');
      
    mathStr = mathStr.replace(/\\sqrt\{([^}]+)\}/g, '√$1');
    mathStr = mathStr.replace(/\\sqrt/g, '√');
    mathStr = mathStr.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2');

    const tokens: React.ReactNode[] = [];
    let currentText = '';
    
    for (let i = 0; i < mathStr.length; i++) {
      if (mathStr[i] === '^') {
        if (currentText) {
          tokens.push(<span key={`t-${i}`}>{currentText}</span>);
          currentText = '';
        }
        if (mathStr[i + 1] === '{') {
          const closeIndex = mathStr.indexOf('}', i + 1);
          if (closeIndex !== -1) {
            const exp = mathStr.substring(i + 2, closeIndex);
            tokens.push(<sup key={`sup-${i}`} className="text-xs">{exp}</sup>);
            i = closeIndex;
          } else {
            currentText += '^';
          }
        } else if (i + 1 < mathStr.length) {
          tokens.push(<sup key={`sup-${i}`} className="text-xs">{mathStr[i + 1]}</sup>);
          i++;
        } else {
          currentText += '^';
        }
      } else if (mathStr[i] === '_') {
        if (currentText) {
          tokens.push(<span key={`t-${i}`}>{currentText}</span>);
          currentText = '';
        }
        if (mathStr[i + 1] === '{') {
          const closeIndex = mathStr.indexOf('}', i + 1);
          if (closeIndex !== -1) {
            const sub = mathStr.substring(i + 2, closeIndex);
            tokens.push(<sub key={`sub-${i}`} className="text-xs">{sub}</sub>);
            i = closeIndex;
          } else {
            currentText += '_';
          }
        } else if (i + 1 < mathStr.length) {
          tokens.push(<sub key={`sub-${i}`} className="text-xs">{mathStr[i + 1]}</sub>);
          i++;
        } else {
          currentText += '_';
        }
      } else {
        currentText += mathStr[i];
      }
    }
    
    if (currentText) {
      tokens.push(<span key={`t-end`}>{currentText}</span>);
    }
    
    return (
      <span key={index} className="font-serif italic bg-slate-50 px-1 py-0.5 rounded text-blue-850">
        {tokens}
      </span>
    );
  });
};

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

  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ hasStarted, submitted, answers });

  useEffect(() => {
    stateRef.current = { hasStarted, submitted, answers };
  }, [hasStarted, submitted, answers]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch((err: unknown) => {
        console.error('Fullscreen error:', err);
      });
    }
  };

  const startExam = () => {
    setHasStarted(true);
    toggleFullScreen();
  };

  // Submit exam automatically on exit (component unmount or browser reload/tab close)
  useEffect(() => {
    const handleAutoSubmit = () => {
      const { hasStarted: currentHasStarted, submitted: currentSubmitted, answers: currentAnswers } = stateRef.current;
      if (currentHasStarted && !currentSubmitted) {
        fetch(`/api/student/exams/${id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: currentAnswers }),
          keepalive: true,
        }).catch(err => console.error('Auto-submit exit error:', err));
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const { hasStarted: currentHasStarted, submitted: currentSubmitted } = stateRef.current;
      if (currentHasStarted && !currentSubmitted) {
        handleAutoSubmit();
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your exam progress will be auto-submitted.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleAutoSubmit();
    };
  }, [id]);

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
          const fetchedExam = { ...data.exam };
          fetchedExam.durationMinutes = fetchedExam.durationMinutes || fetchedExam.duration || 30;
          setExam(fetchedExam);
          setAnswers(new Array(fetchedExam.questions.length).fill(-1));
          setTimeLeft(fetchedExam.durationMinutes * 60);
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

  const handleAnswer = useCallback((optionIndex: number) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = optionIndex;
      return newAnswers;
    });
  }, [currentQuestion]);

  // Keyboard Shortcuts for Premium UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasStarted || submitted || !exam) return;
      
      // Select A, B, C, D or 1, 2, 3, 4
      if (e.code === 'KeyA' || e.code === 'Digit1') {
        handleAnswer(0);
      } else if (e.code === 'KeyB' || e.code === 'Digit2') {
        handleAnswer(1);
      } else if (e.code === 'KeyC' || e.code === 'Digit3') {
        handleAnswer(2);
      } else if (e.code === 'KeyD' || e.code === 'Digit4') {
        handleAnswer(3);
      } else if (e.key === 'ArrowLeft') {
        setCurrentQuestion(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentQuestion(prev => Math.min(exam.questions.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, submitted, exam, handleAnswer]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <div className="font-extrabold text-2xl text-blue-600 tracking-tighter">LOADING ARENA...</div>
        </div>
      </div>
    );
  }
  
  if (!exam) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-8 text-center">
      <IoAlertCircle className="text-8xl text-blue-600 mb-4 animate-pulse" />
      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tighter">EXAM NOT FOUND</h1>
      <button onClick={() => router.back()} className="mt-8 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all">GO BACK</button>
    </div>
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Performance Summary & Visual Question-Result Map
  if (submitted && result) {
    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto space-y-8"
        >
          {/* Performance Dashboard Header */}
          <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-[0_4px_30px_rgba(0,0,0,0.01)] border border-slate-100 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500" />
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/10">
              <IoCheckmarkCircle className="text-6xl text-blue-600 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight leading-none">PERFORMANCE SUMMARY</h1>
            <p className="text-slate-500 font-bold text-lg mb-12">
              Exam: <span className="text-blue-600 underline decoration-2 underline-offset-4">{exam.title}</span> ({exam.subject})
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="bg-slate-50/80 p-8 rounded-[2rem] border border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Final Score</p>
                <p className="text-5xl font-black text-slate-800">{result.score}<span className="text-2xl text-slate-400 font-normal">/{result.totalQuestions}</span></p>
              </div>
              <div className="bg-slate-50/80 p-8 rounded-[2rem] border border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Accuracy Percentage</p>
                <p className="text-5xl font-black text-slate-800">{percentage}%</p>
              </div>
              <div className="bg-slate-50/80 p-8 rounded-[2rem] border border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Exam Result</p>
                <p className={`text-4xl font-black ${percentage >= 40 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {percentage >= 40 ? 'PASSED' : 'PRACTICE'}
                </p>
              </div>
            </div>

            <button 
              onClick={() => router.push('/student/practice')}
              className="px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
            >
              BACK TO PRACTICE HUB
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Visual OMR Navigation Matrix */}
            <div className="lg:col-span-4 lg:sticky lg:top-8 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">OMR RESULTS GRID</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">Click a question circle to scroll directly to its detailed explanation review card.</p>
              </div>

              {/* OMR Results Circles Grid */}
              <div className="grid grid-cols-5 gap-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                {exam.questions.map((q, idx) => {
                  const studentAns = result.answers.find(a => a.questionIndex === idx);
                  const isCorrect = studentAns?.isCorrect;
                  const hasAnswered = studentAns && studentAns.selectedOptionIndex !== -1;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        document.getElementById(`question-result-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className={`h-11 rounded-xl flex flex-col items-center justify-center font-bold text-xs border transition-all hover:scale-105 active:scale-95 ${
                        !hasAnswered
                          ? 'bg-slate-50 border-slate-200 text-slate-400'
                          : isCorrect
                            ? 'bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/10'
                            : 'bg-rose-500 border-rose-600 text-white shadow-md shadow-rose-500/10'
                      }`}
                    >
                      <span className="text-[10px] font-black opacity-85">Q{idx + 1}</span>
                      <span className="text-[8px] font-extrabold uppercase tracking-tighter">
                        {!hasAnswered ? 'Skip' : isCorrect ? 'OK' : 'ERR'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Visual Legend */}
              <div className="border-t border-slate-100 pt-5 space-y-3 text-xs font-bold text-slate-500">
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 bg-emerald-500 rounded-md" />
                  <span>Correct Option Selected</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 bg-rose-500 rounded-md" />
                  <span>Incorrect Option Selected</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 bg-slate-50 border border-slate-200 rounded-md" />
                  <span>Question Skipped</span>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Explanations Cards */}
            <div className="lg:col-span-8 space-y-6">
              <h2 className="text-2xl font-black text-slate-800 px-2 tracking-tight leading-none">EXAM REVIEW & EXPLANATIONS</h2>
              <div className="space-y-6">
                {exam.questions.map((q, idx) => {
                  const studentAns = result.answers.find(a => a.questionIndex === idx);
                  const isCorrect = studentAns?.isCorrect;
                  const hasAnswered = studentAns && studentAns.selectedOptionIndex !== -1;
                  return (
                    <div 
                      key={idx} 
                      id={`question-result-${idx}`} 
                      className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative"
                    >
                      <div className={`absolute top-0 left-0 w-2 h-full ${!hasAnswered ? 'bg-slate-300' : isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      
                      <div className="flex items-start justify-between mb-6">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {idx + 1}</span>
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          !hasAnswered 
                            ? 'bg-slate-100 text-slate-500' 
                            : isCorrect 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-rose-50 text-rose-700'
                        }`}>
                          {!hasAnswered ? 'Skipped' : isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-800 mb-6 leading-snug">{renderMathText(q.questionText)}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {q.options.map((opt, optIdx) => {
                          const isCorrectOpt = optIdx === q.correctOptionIndex;
                          const isStudentSelected = optIdx === studentAns?.selectedOptionIndex;
                          return (
                            <div 
                              key={optIdx} 
                              className={`p-4 rounded-2xl border-2 text-sm font-semibold flex items-center justify-between transition-all duration-200 ${
                                isCorrectOpt 
                                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 font-bold' 
                                  : isStudentSelected 
                                    ? 'border-rose-500 bg-rose-50/50 text-rose-800' 
                                    : 'border-slate-100 bg-slate-50/30 text-slate-500'
                              }`}
                            >
                              <span>{renderMathText(opt)}</span>
                              {isCorrectOpt && <IoCheckmarkCircle className="text-xl text-emerald-600 flex-shrink-0 ml-2" />}
                              {isStudentSelected && !isCorrect && <IoAlertCircle className="text-xl text-rose-600 flex-shrink-0 ml-2" />}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50 mt-4">
                          <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1.5 flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            <span>EXPLANATION</span>
                          </p>
                          <p className="text-sm text-slate-600 leading-relaxed font-semibold">{renderMathText(q.explanation || '')}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const question = exam.questions[currentQuestion];

  // 2. Exam Entrance Screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100"
        >
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
              <IoDocumentText className="text-4xl" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3 leading-none">{exam.title}</h1>
            <div className="inline-flex items-center space-x-2 bg-blue-50/60 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
              <span>{exam.subject}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Time Limit</p>
              <p className="text-xl font-extrabold text-gray-900">{exam.durationMinutes || (exam as any).duration || 30} MINS</p>
            </div>
            <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Qs</p>
              <p className="text-xl font-extrabold text-gray-900">{exam.questions.length} ITEMS</p>
            </div>
          </div>

          <div className="bg-blue-50/30 p-8 rounded-3xl border border-blue-100/50 mb-10">
            <h3 className="font-extrabold text-blue-900 text-xs uppercase tracking-widest mb-4">Guidelines:</h3>
            <ul className="text-gray-600 text-sm font-semibold space-y-3">
              <li className="flex items-center space-x-3"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> <span>Do not refresh the browser during exam.</span></li>
              <li className="flex items-center space-x-3"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> <span>Full screen mode is mandatory for practice.</span></li>
              <li className="flex items-center space-x-3"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> <span>The exam will auto-submit when time expires.</span></li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={startExam}
              className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/20 hover:bg-blue-700"
            >
              ENTER THE ARENA
            </button>
            <button 
              onClick={() => router.push('/student/practice')}
              className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-[2rem] font-bold text-sm transition-all"
            >
              CANCEL & GO BACK
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. Live Practice Arena with Side OMR Sheet
  return (
    <div ref={containerRef} id="arena-container" className="h-screen flex flex-col bg-[#F8FAFC] font-sans overflow-hidden select-none">
      <style>{`
        ::backdrop {
          background-color: #F8FAFC !important;
        }
        :fullscreen {
          background-color: #F8FAFC !important;
        }
        #arena-container:fullscreen {
          background-color: #F8FAFC !important;
          height: 100vh !important;
          width: 100vw !important;
          overflow: hidden !important;
        }
        /* Custom scrollbar styling for a premium visual aesthetic */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #E2E8F0;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #CBD5E1;
        }
      `}</style>

      {/* Exam Header */}
      <div className="bg-white border-b border-slate-100 flex-shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-slate-800 tracking-tight leading-none">{exam.title}</h1>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">{exam.subject}</p>
          </div>
          <div className="flex items-center space-x-3 bg-blue-50/50 px-4 py-2 rounded-xl border border-blue-100/50">
            <IoTime className="text-blue-600 text-lg" />
            <span className={`font-mono text-xl font-black ${timeLeft < 60 ? 'text-rose-500 animate-pulse animate-duration-1000' : 'text-slate-800'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Panel Grid */}
      <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto p-4 md:p-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0 w-full">
          
          {/* Left Column: Active Question Card Arena */}
          <div className="lg:col-span-8 flex flex-col h-full min-h-0 gap-4">
            
            {/* Progress Header Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-shrink-0">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                <span>QUESTION {currentQuestion + 1} OF {exam.questions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / exam.questions.length) * 100)}% EXPLORED</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-md shadow-blue-500/10"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / exam.questions.length) * 100}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
              </div>
            </div>

            {/* Question Display Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 flex-1 min-h-0 flex flex-col justify-between overflow-y-auto custom-scrollbar"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black tracking-widest uppercase">
                      SINGLE CHOICE
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Marks: +4 / -1
                    </span>
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 leading-snug mb-6">
                    {renderMathText(question.questionText)}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {question.options.map((option: string, index: number) => {
                    const isSelected = answers[currentQuestion] === index;
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-300 text-left flex items-center justify-between overflow-hidden ${
                          isSelected
                            ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50/30 text-blue-900 shadow-sm'
                            : 'border-slate-100 hover:border-blue-200/50 hover:bg-slate-50/20 text-slate-600 bg-slate-50/40'
                        }`}
                      >
                        {isSelected && (
                          <motion.div 
                            layoutId="activeOptionBg" 
                            className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 -z-10"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        <div className="flex items-center space-x-3">
                          <span className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center font-extrabold text-xs transition-all duration-200 ${
                            isSelected 
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                              : 'bg-white border border-slate-200 text-slate-400 group-hover:border-blue-300 group-hover:text-blue-600'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="font-bold text-sm md:text-base">{renderMathText(option)}</span>
                        </div>
                        {isSelected && (
                          <IoCheckmarkCircle className="text-xl text-blue-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between flex-shrink-0 pt-2">
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="px-5 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:hover:bg-white disabled:pointer-events-none transition-all flex items-center space-x-2 shadow-sm group"
              >
                <IoChevronBack className="group-hover:-translate-x-0.5 transition-transform" />
                <span>PREVIOUS</span>
              </button>

              <div className="hidden md:flex items-center space-x-2">
                <span className="text-[9px] font-black text-slate-400 tracking-wider">SHORTCUTS: [1-4] SELECT | [← →] NAVIGATE</span>
              </div>

              {currentQuestion === exam.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20 flex items-center space-x-2"
                >
                  <span>SUBMIT EXAM</span>
                  <IoCheckmarkCircle className="text-lg" />
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(prev => Math.min(exam.questions.length - 1, prev + 1))}
                  className="px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 shadow-md shadow-blue-500/10 group"
                >
                  <span>NEXT</span>
                  <IoChevronForward className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Sticky OMR Bubble Sheet Card */}
          <div className="lg:col-span-4 flex flex-col h-full min-h-0 bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
            
            {/* OMR Header Stats */}
            <div className="flex-shrink-0 border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-slate-800 text-base tracking-tight flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  <span>OMR BUBBLE SHEET</span>
                </h3>
                <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[8px] font-black text-slate-500 uppercase tracking-widest">
                  GRID MODE
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Attempted</p>
                  <p className="text-lg font-black text-blue-600">{answers.filter(a => a !== -1).length}<span className="text-xs font-normal text-slate-400">/{exam.questions.length}</span></p>
                </div>
                <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Skipped</p>
                  <p className="text-lg font-black text-slate-700">{answers.filter(a => a === -1).length}</p>
                </div>
              </div>
            </div>

            {/* Scrollable OMR Bubble Grid List */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
              {exam.questions.map((q, idx) => {
                const isSelected = answers[idx] !== -1;
                const selectedOpt = answers[idx];
                const isActive = idx === currentQuestion;
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-2 rounded-xl transition-all duration-200 border ${
                      isActive 
                        ? 'bg-blue-50/50 border-blue-200 shadow-sm' 
                        : isSelected 
                          ? 'bg-slate-50/20 border-slate-100' 
                          : 'bg-white border-transparent'
                    }`}
                  >
                    <button
                      onClick={() => setCurrentQuestion(idx)}
                      className={`flex items-center space-x-2 text-left transition-all ${
                        isActive ? 'scale-[1.02]' : ''
                      }`}
                    >
                      <span className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center font-black text-[10px] transition-all ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 border border-blue-600' 
                          : isSelected 
                            ? 'bg-slate-100 text-slate-600 border border-slate-200' 
                            : 'bg-slate-50 text-slate-400 border border-slate-100'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className={`text-xs font-bold tracking-tight ${
                        isActive ? 'text-blue-900 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                      }`}>
                        Q. {idx + 1}
                      </span>
                    </button>

                    <div className="flex space-x-1">
                      {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                        const isBubbleSelected = selectedOpt === optIdx;
                        return (
                          <button
                            key={letter}
                            onClick={() => {
                              setAnswers(prev => {
                                const newAnswers = [...prev];
                                newAnswers[idx] = optIdx;
                                return newAnswers;
                              });
                            }}
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[10px] transition-all duration-200 border ${
                              isBubbleSelected
                                ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 border-blue-600 text-white shadow-md shadow-blue-500/10 scale-[1.08]'
                                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            {letter}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Direct Finish CTA (Vibrant, Premium Blue Button with highly visible text) */}
            <div className="flex-shrink-0 border-t border-slate-100 pt-4 mt-4">
              <button
                onClick={handleSubmit}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs tracking-wider transition-all shadow-md shadow-blue-600/10 active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                <span className="text-white font-extrabold uppercase">FINISH & SUBMIT EXAM</span>
                <IoCheckmarkCircle className="text-base text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

