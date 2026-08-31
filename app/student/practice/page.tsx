'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  IoDocumentText, IoTime, IoChevronForward, IoCheckmarkCircle, 
  IoSparkles, IoAddCircle, IoAlertCircle, IoCloudUpload, IoChevronBack,
  IoLibrary, IoLayers, IoFileTrayFull
} from 'react-icons/io5';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SYLLABUS } from '@/backend/config/syllabus';
import QuizForge from '@/components/dashboard/QuizForge';

interface Exam {
  _id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  duration?: number;
  questions: any[];
  folderName?: string;
}

export default function PracticeExamsPage() {
  const [viewMode, setViewMode] = useState<'daily' | 'most-probable' | 'previous-year' | 'self-exam'>('daily');
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All Chapters');
  const [selectedAIChapter, setSelectedAIChapter] = useState('');
  const [selectedExcelChapter, setSelectedExcelChapter] = useState('');
  const [availableFolders, setAvailableFolders] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [className, setClassName] = useState('');
  const router = useRouter();

  const fetchExams = useCallback(async () => {
    if (viewMode === 'self-exam') return;
    setLoading(true);
    try {
      let url = `/api/student/exams?examType=${viewMode}`;
      if (selectedSubject) url += `&subject=${encodeURIComponent(selectedSubject)}`;
      if (viewMode === 'daily' && selectedFolder && selectedFolder !== 'All Chapters' && selectedFolder !== 'All') {
        url += `&folderName=${encodeURIComponent(selectedFolder)}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        const mappedExams = data.exams.map((ex: any) => ({
          ...ex,
          durationMinutes: ex.durationMinutes || ex.duration || 30
        }));
        setExams(mappedExams);
        setSubjects(data.subjects || []);
        if (data.className) {
          setClassName(data.className);
        }
        
        // Extract available folders if in most-probable or previous-year mode
        if (viewMode === 'most-probable' || viewMode === 'previous-year') {
          const folders = new Set<string>();
          data.exams.forEach((ex: any) => {
            if (ex.folderName) folders.add(ex.folderName);
          });
          setAvailableFolders(Array.from(folders));
        }

        if (data.subjects?.length > 0 && !selectedSubject) {
          setSelectedSubject(data.subjects[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  }, [viewMode, selectedSubject]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleGenerateAIQuiz = async () => {
    if (!selectedSubject) return;
    
    setGenerating(true);
    setError('');
    try {
      const response = await fetch('/api/student/exams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subject: selectedSubject,
          chapter: selectedAIChapter !== 'All Chapters' ? selectedAIChapter : undefined
        })
      });
      
      const data = await response.json();
      if (data.success) {
        router.push(`/student/practice/${data.examId}`);
      } else {
        setError(data.message || 'Failed to generate quiz');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading && exams.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-wrap items-center space-x-2 text-sm font-semibold text-gray-500 mb-4">
            <Link href="/student/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <button 
              onClick={() => { setViewMode('daily'); setSelectedSubject(''); setSelectedFolder('All Chapters'); }}
              className={`hover:text-blue-600 transition-colors ${viewMode === 'daily' && !selectedSubject ? 'text-blue-600' : ''}`}
            >
              Practice
            </button>
            {selectedSubject && (
              <>
                <span>/</span>
                <button 
                  onClick={() => setSelectedFolder('All Chapters')}
                  className={`hover:text-blue-600 transition-colors ${selectedFolder === 'All Chapters' ? 'text-blue-600' : ''}`}
                >
                  {selectedSubject}
                </button>
              </>
            )}
            {selectedFolder && selectedFolder !== 'All Chapters' && selectedFolder !== 'All' && (
              <>
                <span>/</span>
                <span className="text-blue-600">{selectedFolder}</span>
              </>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {viewMode === 'self-exam'
                  ? 'Self Exam Arena'
                  : viewMode === 'daily'
                  ? 'Practice Arena'
                  : viewMode === 'previous-year'
                  ? 'Previous Year Exams'
                  : 'Most Probable Exams'}
              </h1>
              <p className="text-gray-500">
                {viewMode === 'self-exam'
                  ? 'Generate custom mock exams and interactive quizzes from your study material.'
                  : viewMode === 'previous-year'
                  ? 'Practice with past year official board and competitive exam question papers.'
                  : 'Master your subjects with focused practice sets.'}
              </p>
            </div>
          </div>
        </header>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap p-1 bg-blue-50 rounded-2xl mb-8 w-fit border border-blue-100 shadow-sm gap-1">
          <button 
            onClick={() => { 
              setViewMode('daily'); 
              setSelectedFolder('All Chapters'); 
              if (subjects.length > 0) setSelectedSubject(subjects[0]);
            }}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${viewMode === 'daily' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-600/60 hover:text-blue-600'}`}
          >
            Daily Practice
          </button>
          <button 
            onClick={() => { 
              setViewMode('most-probable'); 
              setSelectedFolder('All Chapters'); 
              if (subjects.length > 0) setSelectedSubject(subjects[0]);
            }}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${viewMode === 'most-probable' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-600/60 hover:text-blue-600'}`}
          >
            Most Probable Exams
          </button>
          <button 
            onClick={() => { 
              setViewMode('previous-year'); 
              setSelectedFolder('All Chapters'); 
              if (subjects.length > 0) setSelectedSubject(subjects[0]);
            }}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${viewMode === 'previous-year' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-600/60 hover:text-blue-600'}`}
          >
            Previous Year Exam
          </button>
          <button 
            onClick={() => { 
              setViewMode('self-exam'); 
              setSelectedFolder('All Chapters'); 
              if (subjects.length > 0) setSelectedSubject(subjects[0]);
            }}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${viewMode === 'self-exam' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-600/60 hover:text-blue-600'}`}
          >
            Self Exam
          </button>
        </div>

        {viewMode === 'self-exam' ? (
          <QuizForge />
        ) : viewMode === 'daily' ? (
          <>
            {/* AI Generation Section */}
            <div className="mb-12">
              {/* AI Generator */}
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <IoSparkles className="text-9xl text-blue-600" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-2 mb-4 text-blue-600">
                    <IoSparkles className="text-xl" />
                    <span className="font-bold text-xs uppercase tracking-wider">AI Powered Engine</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Custom Quiz</h2>
                  <p className="text-gray-600 font-medium text-sm mb-6 max-w-md">Our AI generates tailored questions based on your subject.</p>
                  
                  <div className="flex flex-col gap-4">
                    <select 
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-5 py-4 bg-blue-50/50 border-2 border-blue-100/50 rounded-2xl focus:border-blue-600 outline-none transition-all text-gray-900 font-bold appearance-none"
                    >
                      <option value="" disabled className="text-gray-900">Select Subject</option>
                      {subjects.map(s => (
                        <option key={s} value={s} className="text-gray-900">{s}</option>
                      ))}
                    </select>

                    {(() => {
                      const normalizedClass = className.replace('Class ', 'Grade ');
                      const classSyllabus = SYLLABUS[className] || SYLLABUS[normalizedClass] || SYLLABUS[className.replace('Grade ', 'Class ')];
                      
                      let chaptersList: string[] = [];
                      if (classSyllabus) {
                        if (classSyllabus[selectedSubject]) {
                          chaptersList = classSyllabus[selectedSubject];
                        } else if (['Physics', 'Chemistry', 'Biology'].includes(selectedSubject) && classSyllabus['Science']) {
                          chaptersList = classSyllabus['Science'];
                        } else if (selectedSubject === 'Social Studies' && classSyllabus['Social Science']) {
                          chaptersList = classSyllabus['Social Science'];
                        } else if (selectedSubject === 'Social Studies' && classSyllabus['Environmental Studies']) {
                          chaptersList = classSyllabus['Environmental Studies'];
                        }
                      }

                      return (
                        <div className="relative">
                          <select 
                            value={selectedAIChapter}
                            onChange={(e) => setSelectedAIChapter(e.target.value)}
                            className="w-full px-5 py-4 bg-blue-50/50 border-2 border-blue-100/50 rounded-2xl focus:border-blue-600 outline-none transition-all text-gray-900 font-bold appearance-none cursor-pointer"
                          >
                            <option value="" className="text-gray-400 font-medium">
                              Select Chapter / Topic (All Chapters)
                            </option>
                            {chaptersList.map((chapterName) => (
                              <option key={chapterName} value={chapterName} className="text-gray-900 font-medium">
                                {chapterName}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/>
                            </svg>
                          </div>
                        </div>
                      );
                    })()}
                    <button 
                      onClick={handleGenerateAIQuiz}
                      disabled={generating || !selectedSubject}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center space-x-3 shadow-xl shadow-blue-600/10 cursor-pointer"
                    >
                      {generating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                          <span>Crafting...</span>
                        </>
                      ) : (
                        <>
                          <IoAddCircle className="text-xl" />
                          <span>Generate Now</span>
                        </>
                      )}
                    </button>
                    {error && (
                      <div className="mt-3 p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm flex items-center space-x-2 border border-red-100 animate-fadeIn">
                        <IoAlertCircle className="text-xl shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-bold text-gray-900">Today&apos;s Lineup</h3>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">{exams.length} Available</span>
              </div>
              
              {exams.length > 0 ? (
                exams.map((exam) => (
                  <motion.div
                    key={exam._id}
                    whileHover={{ y: -4 }}
                    className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all"
                  >
                    <div className="flex items-center space-x-5">
                      <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                        <IoDocumentText className="text-3xl text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">{exam.title}</h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm font-bold mt-2">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-lg">{exam.subject}</span>
                          <span className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100"><IoTime className="mr-1.5" /> {exam.durationMinutes || exam.duration || 30}m</span>
                          <span className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100"><IoCheckmarkCircle className="mr-1.5" /> {exam.questions.length} Qs</span>
                        </div>
                      </div>
                    </div>
                    
                    <Link href={`/student/practice/${exam._id}`} className="md:w-auto w-full">
                      <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center space-x-3 w-full justify-center group">
                        <span>Take Exam</span>
                        <IoChevronForward className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white p-16 rounded-3xl shadow-sm border border-dashed border-gray-200 text-center">
                  <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
                    <IoDocumentText className="text-5xl text-blue-200" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">No official exams today</h3>
                  <p className="text-gray-500 font-medium max-w-sm mx-auto mt-2 italic">Check back later or use our AI generator to keep the momentum going!</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-8">
            {/* Elegant Dropdown Selector Filters Card */}
            <div className="bg-gradient-to-br from-white to-blue-50/20 p-8 rounded-3xl shadow-xl border border-blue-100/50 backdrop-blur-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject Selector */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-gray-700 space-x-2">
                    <IoLibrary className="text-blue-600 text-lg" />
                    <span>Select Subject</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSubject}
                      onChange={(e) => {
                        setSelectedSubject(e.target.value);
                        setSelectedFolder('All Chapters');
                      }}
                      className="w-full px-5 py-4 bg-white border-2 border-blue-100 hover:border-blue-500 focus:border-blue-600 outline-none transition-all rounded-2xl font-bold text-gray-800 shadow-sm appearance-none cursor-pointer"
                    >
                      {subjects.length === 0 && (
                        <option value="">No registered subjects</option>
                      )}
                      {subjects.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                    </div>
                  </div>
                </div>

                {/* Chapter Selector */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-gray-700 space-x-2">
                    <IoLayers className="text-blue-600 text-lg" />
                    <span>Select Chapter</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedFolder}
                      onChange={(e) => setSelectedFolder(e.target.value)}
                      className="w-full px-5 py-4 bg-white border-2 border-blue-100 hover:border-blue-500 focus:border-blue-600 outline-none transition-all rounded-2xl font-bold text-gray-800 shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="All Chapters">All Chapters</option>
                      {availableFolders.map((folder) => (
                        <option key={folder} value={folder}>{folder}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtered Exam Papers Display */}
            {(() => {
              const filteredExams = exams.filter(exam => {
                if (!selectedFolder || selectedFolder === 'All Chapters' || selectedFolder === 'All') return true;
                return exam.folderName === selectedFolder;
              });

              return (
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {viewMode === 'previous-year' ? 'Previous Year Exam Papers' : 'Most Probable Exam Papers'}
                    </h3>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      {filteredExams.length} Available
                    </span>
                  </div>

                  {loading ? (
                    <div className="flex justify-center p-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  ) : filteredExams.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredExams.map((exam) => (
                        <motion.div
                          key={exam._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -4 }}
                          className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all"
                        >
                          <div className="flex items-center space-x-5">
                            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                              <IoDocumentText className="text-3xl text-blue-600" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded uppercase tracking-wider">Exam Paper</span>
                                {exam.folderName && (
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase">
                                    {exam.folderName}
                                  </span>
                                )}
                              </div>
                              <h2 className="text-2xl font-bold text-gray-900 leading-tight">{exam.title}</h2>
                              <div className="flex flex-wrap items-center gap-3 text-sm font-bold mt-2">
                                <span className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 font-bold">
                                  <IoTime className="mr-1.5" /> {exam.durationMinutes || exam.duration || 30}m
                                </span>
                                <span className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 font-bold">
                                  <IoCheckmarkCircle className="mr-1.5" /> {exam.questions.length} Qs
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <Link href={`/student/practice/${exam._id}`} className="md:w-auto w-full">
                            <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 hover:shadow-lg transition-all shadow-md flex items-center space-x-3 w-full justify-center group cursor-pointer">
                              <span>Start Practice</span>
                              <IoChevronForward className="group-hover:translate-x-1 transition-transform" />
                            </button>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-16 rounded-3xl shadow-sm border border-dashed border-gray-200 text-center">
                      <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <IoAlertCircle className="text-5xl text-gray-200" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">No exams found</h3>
                      <p className="text-gray-500 font-medium max-w-sm mx-auto mt-2">
                        Try adjusting your chapter filter or checking another subject.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Custom Excel Practice Tool Accordion */}
            <div className="mt-12 border-t border-gray-200/60 pt-8">
              <details className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none hover:bg-blue-50/10 transition-colors">
                  <div className="flex items-center space-x-3 text-blue-600">
                    <IoCloudUpload className="text-2xl" />
                    <span className="font-bold text-gray-900 text-lg">💡 Practice with Custom Excel Question Bank</span>
                  </div>
                  <span className="text-blue-600 transition-transform group-open:rotate-180">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                  </span>
                </summary>
                <div className="p-8 border-t border-gray-50 bg-gray-50/30">
                  <div className="max-w-4xl mx-auto">
                    <p className="text-gray-600 font-medium text-sm mb-6">
                      Upload your own question bank in Excel format to generate a customized practice arena instantly. Perfect for revision of school assignments or reference worksheets!
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Target Subject</label>
                        <div className="relative">
                          <select 
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full px-5 py-4 bg-white border-2 border-blue-100 rounded-2xl outline-none focus:border-blue-600 transition-all text-gray-900 font-bold appearance-none shadow-sm cursor-pointer"
                          >
                            <option value="" className="text-gray-900">Select Subject</option>
                            {subjects.map(s => (
                              <option key={s} value={s} className="text-gray-900">{s}</option>
                            ))}
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                          </div>
                        </div>
                        
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Chapter / Topic</label>
                        <input 
                          type="text"
                          placeholder="Chapter Name (e.g. Thermodynamics)"
                          value={selectedExcelChapter}
                          onChange={(e) => setSelectedExcelChapter(e.target.value)}
                          className="w-full px-5 py-4 bg-white border-2 border-blue-100 rounded-2xl focus:border-blue-600 outline-none transition-all text-gray-900 font-bold placeholder:text-gray-400 shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col justify-end">
                        <input 
                          type="file"
                          id="excel-import-most-probable"
                          accept=".xlsx, .xls"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (!selectedSubject) {
                              setError('Please select a subject first');
                              return;
                            }
                            setGenerating(true);
                            try {
                              const { read, utils } = await import('xlsx');
                              const reader = new FileReader();
                              reader.onload = async (evt) => {
                                const bstr = evt.target?.result;
                                const wb = read(bstr, { type: 'binary' });
                                const wsname = wb.SheetNames[0];
                                const data = utils.sheet_to_json(wb.Sheets[wsname], { header: 1 }) as any[][];

                                 // 1. Detect if the first row is a header row dynamically
                                 const firstRow = data[0] || [];
                                 const isHeader = firstRow.some(cell => 
                                   /^(question|option|correct|ans|exp|s\.?no|serial|id|index|#)/i.test(cell?.toString().trim())
                                 );
                                 const startIdx = isHeader ? 1 : 0;
                                 
                                 // Robust sheet-wide consensus serial column detector
                                 let hasSerialCol = false;
                                 if (data.length > startIdx) {
                                   const firstHeader = data[0]?.[0]?.toString().trim().toLowerCase() || '';
                                   const secondHeader = data[0]?.[1]?.toString().trim().toLowerCase() || '';
                                   if (/^(s\.?no\.?|sr\.?no\.?|no\.?|q\.?no\.?|serial|id|index|#)$/i.test(firstHeader)) {
                                     hasSerialCol = true;
                                   } else if (secondHeader && /^(question|questions|q\.?text|question\s*text|q)$/i.test(secondHeader)) {
                                     hasSerialCol = true;
                                   } else {
                                     let numberCount = 0;
                                     let totalValidRows = 0;
                                     const scanRows = data.slice(startIdx, startIdx + 15);
                                     for (const row of scanRows) {
                                       const val = row?.[0];
                                       if (val !== undefined && val !== null && val !== '') {
                                         totalValidRows++;
                                         const strVal = val.toString().trim();
                                         if (/^\d+(\.\d+)?\s*[\.\-\)]*$/.test(strVal) || /^(q\d+|q\.\d+|q\s+\d+|question\s*\d+|s\.?no\s*\d+|sr\s*\d+|no\s*\d+)\s*[\.\-\)]*$/i.test(strVal)) {
                                           numberCount++;
                                         }
                                       }
                                     }
                                     if (totalValidRows > 0 && numberCount / totalValidRows >= 0.5) {
                                       hasSerialCol = true;
                                     }
                                   }
                                 }

                                 const mapLetterToIdx = (val: any): number => {
                                   if (val === undefined || val === null) return 0;
                                   const str = val.toString().trim().toUpperCase();
                                   if (str === 'A') return 0;
                                   if (str === 'B') return 1;
                                   if (str === 'C') return 2;
                                   if (str === 'D') return 3;
                                   const parsed = parseInt(str);
                                   return isNaN(parsed) ? 0 : parsed;
                                 };

                                 const questions = data.slice(startIdx).map(row => {
                                   const qIdx = hasSerialCol ? 1 : 0;
                                   const o1Idx = hasSerialCol ? 2 : 1;
                                   const o2Idx = hasSerialCol ? 3 : 2;
                                   const o3Idx = hasSerialCol ? 4 : 3;
                                   const o4Idx = hasSerialCol ? 5 : 4;
                                   const ansIdx = hasSerialCol ? 6 : 5;
                                   const expIdx = hasSerialCol ? 7 : 6;

                                   return {
                                     question: row[qIdx]?.toString().trim() || '',
                                     options: [
                                       row[o1Idx]?.toString().trim() || '',
                                       row[o2Idx]?.toString().trim() || '',
                                       row[o3Idx]?.toString().trim() || '',
                                       row[o4Idx]?.toString().trim() || ''
                                     ],
                                     correctOption: mapLetterToIdx(row[ansIdx]),
                                     explanation: row[expIdx]?.toString().trim() || ''
                                   };
                                 }).filter(q => q.question);

                                const res = await fetch('/api/student/exams/import', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    title: `Practice: ${selectedExcelChapter || selectedSubject}`,
                                    subject: selectedSubject,
                                    folderName: selectedExcelChapter || 'Imported',
                                    questions,
                                    duration: 30,
                                    type: viewMode === 'previous-year' ? 'previous-year' : 'most-probable'
                                  })
                                });
                                const result = await res.json();
                                if (result.success) {
                                  router.push(`/student/practice/${result.examId}`);
                                } else {
                                  setError(result.message);
                                }
                              };
                              reader.readAsBinaryString(file);
                            } catch (err) {
                              setError('Failed to process Excel file');
                            } finally {
                              setGenerating(false);
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            if (!selectedSubject) {
                              setError('Please select a subject before uploading');
                              return;
                            }
                            document.getElementById('excel-import-most-probable')?.click();
                          }}
                          disabled={generating}
                          className="w-full py-8 bg-blue-600 text-white rounded-3xl font-bold text-lg hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] transition-all flex flex-col items-center justify-center space-y-2 shadow-xl shadow-blue-600/10 cursor-pointer"
                        >
                          <IoCloudUpload className="text-3xl" />
                          <span>{generating ? 'Processing...' : 'Upload & Start Practice'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {error && (
                  <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl font-bold flex items-center space-x-2 border border-red-100">
                    <IoAlertCircle className="text-xl shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
