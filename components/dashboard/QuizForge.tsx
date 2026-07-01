'use client';

import React, { useState, useEffect, useRef } from "react";
import { 
  IoCloudUpload, IoDocumentText, IoAlertCircle, IoCheckmarkCircle, 
  IoArrowForward, IoRefresh, IoSparkles, IoEye, IoChevronDown 
} from "react-icons/io5";
import { useUploadThing } from "@/utils/uploadthing";

interface QuizOption {
  A: string;
  B: string;
  C: string;
  D: string;
}

interface QuizExplanation {
  A: string;
  B: string;
  C: string;
  D: string;
}

interface QuizQuestion {
  question_type: string;
  question: string;
  options?: QuizOption | null;
  correct_answer: string;
  explanations?: QuizExplanation | null;
  explanation?: string | null;
}

interface AnswersMap {
  [key: number]: string | { typedText: string; selfGrade: 'correct' | 'incorrect' };
}

const API_BASE = "/api/quiz-generator";

export default function QuizForge() {
  const { startUpload } = useUploadThing("pdfUploader");
  // Application states: 'upload' | 'loading' | 'quiz' | 'results'
  const [view, setView] = useState<"upload" | "loading" | "quiz" | "results">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Custom marking scheme counts
  const [mcqCount, setMcqCount] = useState(5);
  const [oneMarkCount, setOneMarkCount] = useState(0);
  const [twoMarkCount, setTwoMarkCount] = useState(0);
  const [fiveMarkCount, setFiveMarkCount] = useState(0);

  const [error, setError] = useState("");
  
  // Loading progress states
  const [loadingStep, setLoadingStep] = useState(1);
  const [loadingError, setLoadingError] = useState("");

  // Quiz execution states
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Answers tracking
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [selfGradeSelection, setSelfGradeSelection] = useState<'correct' | 'incorrect' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate dynamic total question count
  const totalQuestions = mcqCount + oneMarkCount + twoMarkCount + fiveMarkCount;

  // Handle simulated progress steps during loading
  useEffect(() => {
    if (view !== "loading") {
      setLoadingStep(1);
      return;
    }

    const timer1 = setTimeout(() => setLoadingStep(2), 7000);
    const timer2 = setTimeout(() => setLoadingStep(3), 14000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [view]);

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError("");
    if (selectedFile.type !== "application/pdf" && !selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a valid PDF document only.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setError("");
  };

  // Submit file to backend API
  const generateQuiz = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }
    if (totalQuestions === 0) {
      setError("Please configure at least 1 question in your marking scheme.");
      return;
    }
    if (totalQuestions > 50) {
      setError("Total requested questions cannot exceed the limit of 50.");
      return;
    }

    setView("loading");
    setLoadingError("");
    setError("");

    try {
      // 1. Upload file to UploadThing directly from the client's browser
      const uploadRes = await startUpload([file]);
      if (!uploadRes || uploadRes.length === 0) {
        throw new Error("Failed to upload PDF file to storage.");
      }
      const fileUrl = uploadRes[0].url;

      // 2. Submit the file URL and counts as JSON to the server
      const response = await fetch(`${API_BASE}/generate-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileUrl,
          num_mcq: mcqCount,
          num_1_mark: oneMarkCount,
          num_2_mark: twoMarkCount,
          num_5_mark: fiveMarkCount,
        }),
      });

      if (!response.ok) {
        let errorMsg = "Server failed to process the PDF.";
        try {
          const clonedResponse = response.clone();
          try {
            const errorData = await response.json();
            errorMsg = errorData.detail || errorMsg;
          } catch (e) {
            const text = await clonedResponse.text();
            errorMsg = text || errorMsg;
          }
        } catch (cloneErr) {
          try {
            const text = await response.text();
            errorMsg = text || errorMsg;
          } catch (textErr) {
            errorMsg = "Server returned an error that could not be read.";
          }
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions returned from backend.");
      }

      setQuizQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTypedAnswer("");
      setIsAnswerRevealed(false);
      setSelfGradeSelection(null);
      setShowExplanation(false);
      setView("quiz");
    } catch (err: any) {
      console.error(err);
      setLoadingError(err.message || "An unexpected error occurred during generation.");
    }
  };

  // Answer selection handler for MCQs
  const handleSelectMCQOption = (option: string) => {
    if (answers[currentQuestionIndex] !== undefined) return;
    setAnswers({
      ...answers,
      [currentQuestionIndex]: option,
    });
    setShowExplanation(true);
  };

  // Non-MCQ handlers
  const handleRevealAnswer = () => {
    setIsAnswerRevealed(true);
  };

  const handleSelfGrade = (grade: 'correct' | 'incorrect') => {
    setSelfGradeSelection(grade);
    setAnswers({
      ...answers,
      [currentQuestionIndex]: {
        typedText: typedAnswer,
        selfGrade: grade
      }
    });
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    setTypedAnswer("");
    setIsAnswerRevealed(false);
    setSelfGradeSelection(null);

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setView("results");
    }
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      const ans = answers[idx];
      if (q.question_type === "MCQ") {
        if (ans === q.correct_answer) {
          score += 1;
        }
      } else {
        const nonMcqAns = ans as { typedText: string; selfGrade: 'correct' | 'incorrect' } | undefined;
        if (nonMcqAns && nonMcqAns.selfGrade === "correct") {
          score += 1;
        }
      }
    });
    return score;
  };

  // Call backend to download generated PDF
  const downloadPdf = async (includeAnswers = true) => {
    try {
      const response = await fetch(`${API_BASE}/download-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          questions: quizQuestions,
          include_answers: includeAnswers
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to compile PDF document on server.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const baseName = file ? file.name.replace(".pdf", "") : "quiz";
      const suffix = includeAnswers ? "_answer_key.pdf" : "_questions.pdf";
      link.setAttribute("download", `${baseName}${suffix}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Could not generate PDF. Please try again.");
    }
  };

  const resetQuiz = () => {
    setView("upload");
    setFile(null);
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTypedAnswer("");
    setIsAnswerRevealed(false);
    setSelfGradeSelection(null);
    setShowExplanation(false);
    setError("");
    setLoadingError("");
  };

  return (
    <div className="bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden">
      {/* Decorative sparkle background for premium look */}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <IoSparkles className="text-9xl text-blue-600" />
      </div>

      {/* VIEW 1: UPLOAD & CONFIGURATION */}
      {view === "upload" && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div>
            <div className="flex items-center space-x-2 mb-3 text-blue-600">
              <IoSparkles className="text-xl" />
              <span className="font-bold text-xs uppercase tracking-wider">AI Self Examination Engine</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Practice with Your Own Study Material</h2>
            <p className="text-gray-500 font-medium text-sm">
              Upload any textbook PDF, lecture notes, or slides to instantly compile print-ready exam papers and interactive quizzes!
            </p>
          </div>

          {/* Drag & Drop File Zone */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
              dragActive
                ? "border-blue-500 bg-blue-50/40 text-blue-800"
                : file
                ? "border-emerald-500 bg-emerald-50/10 text-emerald-800"
                : "border-gray-200 bg-gray-50/30 hover:border-blue-400 hover:bg-blue-50/20"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
            />
            
            {!file ? (
              <div className="flex flex-col items-center justify-center py-4">
                <IoCloudUpload className="text-5xl text-blue-500 mb-3 animate-bounce" />
                <p className="font-semibold text-gray-700 text-sm md:text-base">
                  Drag and drop your PDF here, or <span className="text-blue-600 hover:text-blue-700 underline">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-1.5">Only PDF documents are supported</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <IoDocumentText className="text-5xl text-emerald-500 mb-3" />
                <p className="font-bold text-gray-800 text-sm md:text-base truncate max-w-xs md:max-w-md">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <button
                  onClick={removeFile}
                  className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all duration-200"
                >
                  Remove File
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold flex items-center space-x-2 border border-red-100 text-sm animate-fadeIn">
              <IoAlertCircle className="text-xl shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Custom Marking Scheme Config Grid */}
          <div className="space-y-4 pt-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Customize Marking Scheme Blueprint:
            </label>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* MCQ */}
              <div className="bg-white border border-gray-200 p-4 rounded-2xl flex flex-col gap-2 shadow-sm">
                <label className="text-xs font-bold text-gray-500">MCQs</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={mcqCount}
                  onChange={(e) => setMcqCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-blue-50/30 border border-blue-100 rounded-xl outline-none focus:border-blue-500 font-bold text-blue-700 text-sm text-center"
                />
              </div>
              {/* 1 Mark */}
              <div className="bg-white border border-gray-200 p-4 rounded-2xl flex flex-col gap-2 shadow-sm">
                <label className="text-xs font-bold text-gray-500">1-Mark Questions</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={oneMarkCount}
                  onChange={(e) => setOneMarkCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-blue-50/30 border border-blue-100 rounded-xl outline-none focus:border-blue-500 font-bold text-blue-700 text-sm text-center"
                />
              </div>
              {/* 2 Mark */}
              <div className="bg-white border border-gray-200 p-4 rounded-2xl flex flex-col gap-2 shadow-sm">
                <label className="text-xs font-bold text-gray-500">2-Mark Questions</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={twoMarkCount}
                  onChange={(e) => setTwoMarkCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-blue-50/30 border border-blue-100 rounded-xl outline-none focus:border-blue-500 font-bold text-blue-700 text-sm text-center"
                />
              </div>
              {/* 5 Mark */}
              <div className="bg-white border border-gray-200 p-4 rounded-2xl flex flex-col gap-2 shadow-sm">
                <label className="text-xs font-bold text-gray-500">5-Mark Questions</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={fiveMarkCount}
                  onChange={(e) => setFiveMarkCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-blue-50/30 border border-blue-100 rounded-xl outline-none focus:border-blue-500 font-bold text-blue-700 text-sm text-center"
                />
              </div>
            </div>

            {/* Running Tally */}
            <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-4 rounded-2xl shadow-inner">
              <span className="text-sm font-semibold text-gray-600">Total Questions:</span>
              <span className={`text-sm md:text-base font-extrabold px-4 py-1.5 rounded-xl border transition-all duration-300 ${
                totalQuestions > 50
                  ? "bg-red-50 border-red-200 text-red-600 animate-pulse"
                  : totalQuestions === 0
                  ? "bg-gray-200 border-gray-300 text-gray-500"
                  : "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10"
              }`}>
                {totalQuestions} / 50 {totalQuestions > 50 && "(Limit Exceeded)"}
              </span>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={generateQuiz}
            disabled={!file || totalQuestions === 0 || totalQuestions > 50}
            className={`w-full py-4.5 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
              file && totalQuestions > 0 && totalQuestions <= 50
                ? "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20 active:scale-[0.99]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none"
            }`}
          >
            <IoSparkles className="text-xl" />
            <span>Generate Quiz & PDF</span>
          </button>
        </div>
      )}

      {/* VIEW 2: LOADING OVERLAY */}
      {view === "loading" && (
        <div className="flex flex-col items-center justify-center py-10 text-center max-w-lg mx-auto">
          {!loadingError ? (
            <div className="flex flex-col items-center justify-center space-y-8 w-full">
              {/* Radar & Scanner Animation */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <div className="absolute inset-0 border border-blue-400/20 rounded-full animate-ping [animation-duration:3s]"></div>
                <div className="absolute w-36 h-36 border border-blue-300/40 rounded-full animate-pulse"></div>
                <div className="absolute w-28 h-28 border-2 border-dashed border-blue-500/30 rounded-full animate-spin [animation-duration:15s]"></div>
                
                {/* Floating Document Sheet */}
                <div className="absolute w-22 h-30 bg-white border-2 border-blue-500/60 rounded-xl shadow-[0_10px_25px_rgba(37,99,235,0.12)] overflow-hidden flex flex-col justify-between p-3.5 animate-float">
                  {/* Scanning Laser Line */}
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_12px_#3b82f6] animate-scan"></div>
                  
                  {/* Content lines on sheet */}
                  <div className="w-full space-y-2 mt-2">
                    <div className="h-2 w-10/12 bg-gray-100 rounded-full"></div>
                    <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                    <div className="h-2 w-8/12 bg-gray-100 rounded-full"></div>
                    <div className="h-2 w-11/12 bg-gray-100 rounded-full"></div>
                  </div>
                  
                  {/* Decorative scanner status */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
                    <div className="h-1.5 w-10 bg-blue-100 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                  Forging Practice Exam...
                </h3>
                <p className="text-gray-500 font-medium text-sm px-4">
                  Scanning your document and crafting customized questions. This takes about 15–20 seconds.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-64 space-y-2.5">
                <div className="flex justify-between text-xs text-blue-600 font-bold px-0.5">
                  <span>
                    {loadingStep === 1 && "Extracting content..."}
                    {loadingStep === 2 && "Elaborating details..."}
                    {loadingStep === 3 && "Polishing formatting..."}
                  </span>
                  <span>{loadingStep * 33}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${loadingStep * 33}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 w-full animate-fadeIn">
              <div className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex flex-col items-center gap-3 text-sm">
                <IoAlertCircle className="text-4xl text-red-500" />
                <p className="font-bold text-base">Generation Pipeline Failed</p>
                <p className="text-gray-500 text-xs max-w-md break-words">{loadingError}</p>
              </div>
              
              <button
                onClick={resetQuiz}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
              >
                Return to Upload
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: QUIZ INTERACTION */}
      {view === "quiz" && quizQuestions.length > 0 && (
        <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
          
          {/* Quiz Progress Header with Immediate Download PDF option */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-sm border-b border-gray-100 pb-5">
            <div className="flex items-center space-x-3 text-left">
              <span className="text-gray-500 font-semibold">
                Question <strong className="text-gray-900">{currentQuestionIndex + 1}</strong> of <strong className="text-gray-900">{quizQuestions.length}</strong>
              </span>
              <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-100/50 px-2 py-0.5 rounded-md">
                {quizQuestions[currentQuestionIndex].question_type.replace('_', ' ')}
              </span>
            </div>

            {/* Direct Download buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadPdf(false)}
                title="Download questions paper"
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
              >
                <IoDocumentText className="text-sm" />
                <span>Questions PDF</span>
              </button>
              <button
                onClick={() => downloadPdf(true)}
                title="Download answer key"
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/50 text-xs font-bold rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
              >
                <IoDocumentText className="text-sm" />
                <span>Answers PDF</span>
              </button>
              
              <div className="w-16 bg-gray-100 h-2 rounded-full overflow-hidden ml-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="pt-2">
            <h3 className="text-xl font-bold leading-relaxed text-gray-950">
              {quizQuestions[currentQuestionIndex].question}
            </h3>
          </div>

          {/* MCQ INTERACTION SCHEME */}
          {quizQuestions[currentQuestionIndex].question_type === "MCQ" ? (
            <div className="grid grid-cols-1 gap-3.5 mt-5">
              {Object.entries(quizQuestions[currentQuestionIndex].options || {}).map(([key, value]) => {
                const isAnswered = answers[currentQuestionIndex] !== undefined;
                const isSelected = answers[currentQuestionIndex] === key;
                const isCorrect = quizQuestions[currentQuestionIndex].correct_answer === key;

                let buttonClass = "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/10 text-gray-700";
                
                if (isAnswered) {
                  if (isCorrect) {
                    buttonClass = "border-emerald-500 bg-emerald-50/30 text-emerald-800 font-medium";
                  } else if (isSelected) {
                    buttonClass = "border-red-500 bg-red-50/30 text-red-800 font-medium";
                  } else {
                    buttonClass = "border-gray-100 bg-gray-50/20 text-gray-400 cursor-not-allowed opacity-60";
                  }
                }

                return (
                  <button
                    key={key}
                    onClick={() => handleSelectMCQOption(key)}
                    disabled={isAnswered}
                    className={`border rounded-2xl py-4.5 px-5.5 text-left flex items-start gap-4 transition-all duration-200 cursor-pointer ${buttonClass}`}
                  >
                    <span className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                      isAnswered && isCorrect
                        ? "bg-emerald-500 text-white"
                        : isAnswered && isSelected
                        ? "bg-red-500 text-white"
                        : isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {key}
                    </span>
                    <span className="text-sm md:text-base pt-0.5 leading-relaxed">{value}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* NON-MCQ INTERACTION SCHEME */
            <div className="space-y-4 mt-5 animate-fadeIn">
              <div className="space-y-2">
                <label htmlFor="typed-answer" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Draft your answer:
                </label>
                <textarea
                  id="typed-answer"
                  rows={4}
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  disabled={isAnswerRevealed}
                  placeholder="Type or outline your answer here to help grade yourself..."
                  className="w-full bg-white border border-gray-200 rounded-2xl p-4.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none transition-all duration-200 shadow-sm"
                />
              </div>

              {!isAnswerRevealed ? (
                <button
                  onClick={handleRevealAnswer}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/10 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <IoEye className="text-lg" />
                  <span>Reveal Suggested Answer</span>
                </button>
              ) : (
                /* SELF-GRADE PANELS */
                <div className="space-y-5 animate-fadeIn">
                  <div className="border border-blue-100 bg-blue-50/10 rounded-2xl p-5 space-y-4.5 shadow-sm">
                    <div>
                      <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-100/50 px-2 py-0.5 rounded">
                        Model Answer / Suggested Solution
                      </span>
                      <p className="text-sm text-gray-900 mt-2.5 leading-relaxed font-bold">
                        {quizQuestions[currentQuestionIndex].correct_answer}
                      </p>
                    </div>

                    {quizQuestions[currentQuestionIndex].explanation && (
                      <div className="pt-3.5 border-t border-gray-100">
                        <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100/50 px-2 py-0.5 rounded">
                          Marking Rubric & Rubric Details
                        </span>
                        <p className="text-xs md:text-sm text-gray-600 mt-2.5 leading-relaxed">
                          {quizQuestions[currentQuestionIndex].explanation}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <p className="text-xs text-gray-500 font-bold text-center uppercase tracking-wider">
                      Self Grade: How did you do?
                    </p>
                    <div className="grid grid-cols-2 gap-3.5">
                      <button
                        onClick={() => handleSelfGrade("correct")}
                        className={`py-4 rounded-2xl border text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                          selfGradeSelection === "correct"
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                            : selfGradeSelection !== null
                            ? "border-gray-100 bg-gray-50/50 text-gray-300 cursor-not-allowed"
                            : "border-gray-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/10 text-gray-700"
                        }`}
                      >
                        ✓ Correct
                      </button>
                      <button
                        onClick={() => handleSelfGrade("incorrect")}
                        className={`py-4 rounded-2xl border text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                          selfGradeSelection === "incorrect"
                            ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/10"
                            : selfGradeSelection !== null
                            ? "border-gray-100 bg-gray-50/50 text-gray-300 cursor-not-allowed"
                            : "border-gray-200 bg-white hover:border-red-500 hover:bg-red-50/10 text-gray-700"
                        }`}
                      >
                        ✗ Incorrect
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MCQ Explanations Reveal */}
          {showExplanation && quizQuestions[currentQuestionIndex].question_type === "MCQ" && answers[currentQuestionIndex] !== undefined && (
            <div className="mt-6 border border-blue-100 bg-blue-50/10 rounded-2xl p-5 space-y-4.5 animate-fadeIn shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                  <IoAlertCircle className="text-lg text-blue-600" />
                  <span>Option Analysis</span>
                </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  answers[currentQuestionIndex] === quizQuestions[currentQuestionIndex].correct_answer
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100/50"
                    : "bg-red-50 text-red-700 border border-red-100/50"
                }`}>
                  {answers[currentQuestionIndex] === quizQuestions[currentQuestionIndex].correct_answer ? "Correct" : "Incorrect"}
                </span>
              </div>
              
              <div className="space-y-3.5">
                {Object.entries(quizQuestions[currentQuestionIndex].explanations || {}).map(([key, expl]) => {
                  const isOptionCorrect = quizQuestions[currentQuestionIndex].correct_answer === key;
                  const isOptionSelected = answers[currentQuestionIndex] === key;

                  return (
                    <div key={key} className="text-xs md:text-sm">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className={isOptionCorrect ? "text-emerald-700" : isOptionSelected ? "text-red-700" : "text-gray-700"}>
                          Option {key}:
                        </span>
                        {isOptionCorrect && <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100/50 px-1.5 rounded">Correct Answer</span>}
                      </div>
                      <p className="text-gray-500 mt-1 leading-relaxed">{expl}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Next Question button */}
          {answers[currentQuestionIndex] !== undefined && (
            <button
              onClick={handleNextQuestion}
              className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-xl shadow-blue-500/10 transition-all duration-200 mt-6 flex items-center justify-center gap-2 cursor-pointer animate-fadeIn"
            >
              <span>{currentQuestionIndex < quizQuestions.length - 1 ? "Next Question" : "View Results"}</span>
              <IoArrowForward className="text-lg" />
            </button>
          )}
        </div>
      )}

      {/* VIEW 4: SCORE REVIEW BOARD */}
      {view === "results" && (
        <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
          
          {/* Score circle & details */}
          <div className="text-center py-8 bg-blue-50/10 rounded-3xl border border-blue-100/80 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Quiz Assessment Board</h2>
            <p className="text-gray-500 text-sm mt-1">Check your performance breakdown below.</p>
            
            <div className="relative w-36 h-36 mx-auto mt-6 flex flex-col items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="62" className="stroke-gray-100" strokeWidth="8" fill="transparent" />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  className="stroke-blue-600"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 62}
                  strokeDashoffset={2 * Math.PI * 62 * (1 - calculateScore() / quizQuestions.length)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-4xl font-black text-gray-900">
                  {calculateScore()}
                </span>
                <span className="text-gray-400 font-bold text-lg">
                  /{quizQuestions.length}
                </span>
                <p className="text-xs font-bold text-blue-600 mt-0.5">
                  {Math.round((calculateScore() / quizQuestions.length) * 100)}%
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons (Download PDF Options & Restart) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <button
              onClick={() => downloadPdf(false)}
              className="py-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-2xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <IoDocumentText className="text-lg" />
              <span>Questions Paper PDF</span>
            </button>

            <button
              onClick={() => downloadPdf(true)}
              className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/10 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <IoDocumentText className="text-lg" />
              <span>Answer Key PDF</span>
            </button>

            <button
              onClick={resetQuiz}
              className="py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/10 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <IoRefresh className="text-lg" />
              <span>Restart Self Exam</span>
            </button>
          </div>

          {/* Performance analysis review list */}
          <div className="space-y-4 pt-3">
            <h3 className="text-lg font-bold text-gray-900">Review Questions</h3>
            
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {quizQuestions.map((q, idx) => {
                const ans = answers[idx];
                
                let isCorrect = false;
                if (q.question_type === "MCQ") {
                  isCorrect = ans === q.correct_answer;
                } else {
                  const nonMcqAns = ans as { typedText: string; selfGrade: 'correct' | 'incorrect' } | undefined;
                  isCorrect = nonMcqAns?.selfGrade === "correct";
                }

                return (
                  <details
                    key={idx}
                    className="group border border-gray-100 bg-white rounded-2xl overflow-hidden transition-all duration-200"
                  >
                    <summary className="flex items-center justify-between p-4.5 cursor-pointer hover:bg-blue-50/10 list-none select-none">
                      <div className="flex items-center gap-3">
                        <span className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isCorrect
                            ? "bg-emerald-500 text-white"
                            : "bg-red-500 text-white"
                        }`}>
                          {isCorrect ? "✓" : "✗"}
                        </span>
                        <span className="text-sm font-bold text-gray-900 truncate max-w-xs md:max-w-md">
                          {idx + 1}. {q.question}
                        </span>
                      </div>
                      <IoChevronDown className="text-gray-400 group-open:rotate-180 transition-transform duration-300" />
                    </summary>

                    <div className="p-5 border-t border-gray-100 bg-gray-50/30 space-y-4 text-xs md:text-sm">
                      <p className="font-bold text-gray-950">
                        {q.question}
                        <span className="ml-2.5 px-2 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100/50 rounded">
                          {q.question_type.replace('_', ' ').toUpperCase()}
                        </span>
                      </p>
                      
                      {q.question_type === "MCQ" ? (
                        /* MCQ Options list */
                        <div className="space-y-2 pl-2">
                          {Object.entries(q.options || {}).map(([optKey, optText]) => {
                            const isUserSelection = ans === optKey;
                            const isCorrectOpt = q.correct_answer === optKey;
                            
                            let optClass = "text-gray-500";
                            if (isCorrectOpt) {
                              optClass = "text-emerald-700 font-bold";
                            } else if (isUserSelection) {
                              optClass = "text-red-700 font-bold";
                            }

                            return (
                              <div key={optKey} className={`flex items-start gap-2 ${optClass}`}>
                                <span className="font-bold flex-shrink-0">{optKey}:</span>
                                <span>{optText}</span>
                                {isCorrectOpt && <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100/50 px-1.5 rounded ml-1.5">Correct</span>}
                                {isUserSelection && !isCorrectOpt && <span className="text-[9px] bg-red-50 text-red-700 border border-red-100/50 px-1.5 rounded ml-1.5">Your Choice</span>}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* Written answers */
                        <div className="space-y-3 pl-2">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Your Draft Answer:</p>
                            <p className="text-gray-600 italic mt-1 leading-relaxed bg-white p-3 rounded-xl border border-gray-200/50">
                              {(ans as { typedText: string } | undefined)?.typedText || "(No draft text written)"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Suggested Answer:</p>
                            <p className="text-gray-900 font-bold mt-1 leading-relaxed">
                              {q.correct_answer}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Explanation block */}
                      <div className="mt-3.5 pt-3.5 border-t border-gray-100 space-y-2.5">
                        <p className="font-bold text-gray-800 text-xs">Explanations & Criteria:</p>
                        {q.question_type === "MCQ" ? (
                          Object.entries(q.explanations || {}).map(([optKey, expl]) => (
                            <div key={optKey} className="text-xs">
                              <span className="text-gray-700 font-semibold">Option {optKey}:</span>{" "}
                              <span className="text-gray-500">{expl}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
