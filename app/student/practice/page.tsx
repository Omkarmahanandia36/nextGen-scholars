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

interface Exam {
  _id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  questions: unknown[];
}

export default function PracticeExamsPage() {
  const [viewMode, setViewMode] = useState<'daily' | 'most-probable'>('daily');
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
  const router = useRouter();

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/student/exams?examType=${viewMode}`;
      if (selectedSubject) url += `&subject=${encodeURIComponent(selectedSubject)}`;
      if (selectedFolder && selectedFolder !== 'All Chapters' && selectedFolder !== 'All') {
        url += `&folderName=${encodeURIComponent(selectedFolder)}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setExams(data.exams);
        setSubjects(data.subjects || []);
        
        // Extract available folders if in most-probable mode
        if (viewMode === 'most-probable') {
          const folders = new Set<string>();
          data.exams.forEach((ex: any) => {
            if (ex.folderName) folders.add(ex.folderName);
          });
          setAvailableFolders(Array.from(folders));
        }

        if (data.subjects?.length > 0 && !selectedSubject && viewMode === 'daily') {
          setSelectedSubject(data.subjects[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  }, [viewMode, selectedSubject, selectedFolder]);

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
                {viewMode === 'daily' ? 'Practice Arena' : 'Most Probable Exams'}
              </h1>
              <p className="text-gray-500">Master your subjects with focused practice sets.</p>
            </div>
          </div>
        </header>

        {/* View Mode Switcher */}
        <div className="flex p-1 bg-blue-50 rounded-2xl mb-8 w-fit border border-blue-100 shadow-sm">
          <button 
            onClick={() => { setViewMode('daily'); setSelectedFolder('All Chapters'); }}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${viewMode === 'daily' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-600/60 hover:text-blue-600'}`}
          >
            Daily Practice
          </button>
          <button 
            onClick={() => { setViewMode('most-probable'); setSelectedFolder('All Chapters'); setSelectedSubject(''); }}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${viewMode === 'most-probable' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-600/60 hover:text-blue-600'}`}
          >
            Most Probable Exams
          </button>
        </div>

        {viewMode === 'daily' ? (
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

                    <input 
                      type="text"
                      placeholder="Chapter Name (e.g. Force)"
                      value={selectedAIChapter}
                      onChange={(e) => setSelectedAIChapter(e.target.value)}
                      className="w-full px-5 py-4 bg-blue-50/50 border-2 border-blue-100/50 rounded-2xl focus:border-blue-600 outline-none transition-all text-gray-900 font-bold placeholder:text-gray-400"
                    />
                    <button 
                      onClick={handleGenerateAIQuiz}
                      disabled={generating || !selectedSubject}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center space-x-3 shadow-xl shadow-blue-600/10"
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
                          <span className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100"><IoTime className="mr-1.5" /> {exam.durationMinutes}m</span>
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
            {/* Excel Practice Section - Now at the top of Most Probable */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <IoFileTrayFull className="text-9xl text-blue-600" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-4 text-blue-600">
                  <IoCloudUpload className="text-xl" />
                  <span className="font-bold text-xs uppercase tracking-wider">Personal Trainer</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Practice with Excel</h2>
                <p className="text-gray-600 font-medium text-sm mb-6 max-w-md">Upload your own question bank to generate a focused practice arena instantly.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <select 
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-5 py-4 bg-blue-50/50 border-2 border-blue-100/50 rounded-2xl focus:border-blue-600 outline-none transition-all text-gray-900 font-bold appearance-none"
                    >
                      <option value="" className="text-gray-900">Select Subject</option>
                      {subjects.map(s => (
                        <option key={s} value={s} className="text-gray-900">{s}</option>
                      ))}
                    </select>
 
                    <input 
                      type="text"
                      placeholder="Chapter Name (e.g. Thermodynamics)"
                      value={selectedExcelChapter}
                      onChange={(e) => setSelectedExcelChapter(e.target.value)}
                      className="w-full px-5 py-4 bg-blue-50/50 border-2 border-blue-100/50 rounded-2xl focus:border-blue-600 outline-none transition-all text-gray-900 font-bold placeholder:text-gray-400"
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
                            const questions = data.slice(1).map(row => ({
                              question: row[0]?.toString() || '',
                              options: [row[1]?.toString() || '', row[2]?.toString() || '', row[3]?.toString() || '', row[4]?.toString() || ''],
                              correctOption: parseInt(row[5]) || 0,
                              explanation: row[6]?.toString() || ''
                            })).filter(q => q.question);

                            const res = await fetch('/api/student/exams/import', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                title: `Practice: ${selectedExcelChapter || selectedSubject}`,
                                subject: selectedSubject,
                                folderName: selectedExcelChapter || 'Imported',
                                questions,
                                duration: 30,
                                type: 'most-probable'
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
                      className="w-full py-10 bg-blue-600 text-white rounded-3xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center justify-center space-y-2 shadow-xl"
                    >
                      <IoCloudUpload className="text-4xl" />
                      <span>{generating ? 'Processing...' : 'Upload & Start Practice'}</span>
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl font-bold flex items-center space-x-2 border border-red-100">
                    <IoAlertCircle className="text-xl shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Step-by-Step Selection Flow */}
            {!selectedSubject ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                  <h2 className="text-2xl font-bold text-gray-900">Choose a Subject</h2>
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Search subjects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-blue-50/30 border-2 border-blue-100/50 rounded-xl focus:border-blue-600 outline-none transition-all text-sm font-bold w-full md:w-64 shadow-sm placeholder:text-gray-400"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects
                    .filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((subject) => (
                    <motion.button
                      key={subject}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedSubject(subject); setSearchTerm(''); }}
                      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-left group transition-all hover:border-blue-600 hover:shadow-xl hover:shadow-blue-600/5"
                    >
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-6">
                        <IoDocumentText className="text-3xl" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:translate-x-1 transition-transform">{subject}</h3>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Explore Chapters →</p>
                    </motion.button>
                  ))}
                </div>
                {subjects.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold">No subjects match your search.</p>
                  </div>
                )}
              </div>
            ) : (selectedFolder === 'All Chapters' || selectedFolder === '') && availableFolders.length > 0 ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setSelectedSubject('')}
                      className="w-10 h-10 bg-blue-50/50 border border-blue-100/50 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm group"
                    >
                      <IoChevronBack className="text-lg group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 leading-none">{selectedSubject}</h2>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Select a Chapter</p>
                    </div>
                  </div>
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Search chapters..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-blue-50/30 border-2 border-blue-100/50 rounded-xl focus:border-blue-600 outline-none transition-all text-sm font-bold w-full md:w-64 shadow-sm placeholder:text-gray-400"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedFolder('All'); setSearchTerm(''); }}
                    className="bg-white p-8 rounded-3xl border-2 border-blue-600 shadow-xl shadow-blue-600/5 text-left group transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                        <IoDocumentText className="text-white text-2xl" />
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">ALL-IN-ONE</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Full Subject Exam</h3>
                    <p className="text-gray-500 text-xs font-medium">Practice everything from {selectedSubject}</p>
                  </motion.button>

                  {availableFolders
                    .filter(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((folder) => (
                    <motion.button
                      key={folder}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedFolder(folder); setSearchTerm(''); }}
                      className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-left group transition-all hover:border-blue-600 hover:shadow-xl"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-50 border border-blue-100/50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <IoDocumentText className="text-2xl" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-300 group-hover:text-blue-600 transition-colors uppercase">Chapter</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:translate-x-1 transition-transform">{folder}</h3>
                      <p className="text-gray-400 text-xs font-medium">View probability-based questions</p>
                    </motion.button>
                  ))}
                </div>
                {availableFolders.filter(f => f.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && searchTerm && (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold">No chapters match your search.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Active Filters Bar */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <IoDocumentText className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Currently Browsing</p>
                      <h3 className="text-gray-900 font-bold text-lg">
                        {selectedSubject} {selectedFolder !== 'All Chapters' && selectedFolder !== 'All' ? `• ${selectedFolder}` : ''}
                      </h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setSelectedSubject(''); setSelectedFolder('All Chapters'); }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10"
                  >
                    Reset Filters
                  </button>
                </div>

                <div className="space-y-4 mt-8">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-bold text-gray-900">Practice Sets</h3>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">{exams.length} Results</span>
                  </div>

                  {loading ? (
                    <div className="flex justify-center p-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  ) : exams.length > 0 ? (
                    exams.map((exam) => (
                      <motion.div
                        key={exam._id}
                        whileHover={{ y: -4 }}
                        className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6"
                      >
                        <div className="flex items-center space-x-5">
                          <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                            <IoDocumentText className="text-3xl text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded uppercase tracking-wider">Most Probable</span>
                              {exam.folderName && <span className="text-[10px] font-bold text-blue-600/60 border border-blue-100 px-2 py-0.5 rounded uppercase">{exam.folderName}</span>}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{exam.title}</h2>
                            <div className="flex flex-wrap items-center gap-3 text-sm font-bold mt-2">
                              <span className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 font-bold"><IoTime className="mr-1.5" /> {exam.durationMinutes}m</span>
                              <span className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 font-bold"><IoCheckmarkCircle className="mr-1.5" /> {exam.questions.length} Qs</span>
                            </div>
                          </div>
                        </div>
                        
                        <Link href={`/student/practice/${exam._id}`} className="md:w-auto w-full">
                          <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center space-x-3 w-full justify-center group">
                            <span>Start Practice</span>
                            <IoChevronForward className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </Link>
                      </motion.div>
                    ))
                  ) : (
                    <div className="bg-white p-16 rounded-3xl shadow-sm border border-dashed border-gray-200 text-center">
                      <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <IoAlertCircle className="text-5xl text-gray-200" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">No exams found</h3>
                      <p className="text-gray-500 font-medium max-w-sm mx-auto mt-2">Try adjusting your filters or checking a different subject.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
