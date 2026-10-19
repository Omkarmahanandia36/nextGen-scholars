'use client';

import React, { useState, useEffect } from 'react';
import { 
  IoBook, IoFlask, IoSchool, IoSparkles, IoDocumentText, 
  IoChevronDown, IoChevronForward, IoCheckmarkCircle, IoEye, 
  IoClose, IoList, IoShieldCheckmark, IoRibbon
} from 'react-icons/io5';

interface NoteViewerProps {
  noteData?: any;
  noteUrl?: string;
  onClose?: () => void;
}

export default function NoteViewer({ noteData: initialData, noteUrl, onClose }: NoteViewerProps) {
  const [data, setData] = useState<any>(initialData || null);
  const [loading, setLoading] = useState(!initialData && !!noteUrl);
  const [activeTab, setActiveTab] = useState<'theory' | 'formulas' | 'glossary' | 'practice' | 'test' | 'revision'>('theory');
  const [activeSectionId, setActiveSectionId] = useState<string>('A');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [searchGlossary, setSearchGlossary] = useState('');

  useEffect(() => {
    if (!data && noteUrl) {
      setLoading(true);
      fetch(noteUrl)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch note`);
          return res.json();
        })
        .then(json => {
          setData(json);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load note data:', err);
          setLoading(false);
        });
    }
  }, [noteUrl, data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 font-semibold text-sm">Loading comprehensive chapter study guide...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Study guide content could not be loaded.</p>
      </div>
    );
  }

  const toggleReveal = (key: string) => {
    setRevealedAnswers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const currentSection = data.sections?.find((s: any) => s.section_id === activeSectionId) || data.sections?.[0];

  const filteredGlossary = (data.key_terms_glossary || []).filter((item: any) =>
    item.term.toLowerCase().includes(searchGlossary.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchGlossary.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#FAFBFD] text-gray-900 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 md:p-8 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <IoFlask className="text-9xl text-white" />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white">
              {data.board || 'ICSE'} • {data.grade_level || 'Class 10'}
            </span>
            <span className="px-3 py-1 bg-blue-500/30 rounded-full text-xs font-bold text-blue-100">
              {data.subject || 'Chemistry'} • Chapter {data.chapter_number || 2}
            </span>
            <span className="px-3 py-1 bg-emerald-500/30 text-emerald-200 rounded-full text-xs font-bold flex items-center gap-1">
              <IoShieldCheckmark /> Verified Complete Study Guide
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            {data.title}: {data.subtitle}
          </h1>

          {data.syllabus_scope && (
            <div className="mt-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-xs md:text-sm text-blue-50">
              <div className="font-bold uppercase tracking-wider text-blue-200 mb-1 flex items-center gap-1.5">
                <IoRibbon className="text-base" /> ICSE Syllabus Scope ({data.syllabus_scope.exam_year || 'Board Compliant'})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                {data.syllabus_scope.scope?.map((sc: any, idx: number) => (
                  <div key={idx} className="bg-black/20 p-2.5 rounded-xl">
                    <span className="font-bold text-white block mb-1">✓ {sc.topic}</span>
                    <ul className="list-disc list-inside text-xs text-blue-100/90 space-y-0.5">
                      {sc.points?.slice(0, 2).map((pt: string, pIdx: number) => (
                        <li key={pIdx} className="truncate">{pt}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex overflow-x-auto scrollbar-none px-4 py-2 gap-2 text-sm font-bold">
          <button
            onClick={() => setActiveTab('theory')}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'theory' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <IoBook />
            <span>Chapter Theory ({data.sections?.length || 13} Sections)</span>
          </button>

          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'formulas' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <IoFlask />
            <span>Equations & Redox</span>
          </button>

          <button
            onClick={() => setActiveTab('glossary')}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'glossary' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <IoList />
            <span>Glossary ({data.key_terms_glossary?.length || 30}+ Terms)</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'practice' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <IoSparkles />
            <span>Practice & Board MCQs</span>
          </button>

          <button
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'test' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <IoDocumentText />
            <span>Unit Test (30 Marks)</span>
          </button>

          <button
            onClick={() => setActiveTab('revision')}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'revision' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <IoCheckmarkCircle />
            <span>Quick Revision & Tips</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
        
        {/* TAB 1: THEORY & SECTIONS A-M */}
        {activeTab === 'theory' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar list of Sections */}
            <div className="lg:col-span-4 space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3 px-2">
                Sections A to M Index
              </h3>
              <div className="bg-white p-2 rounded-2xl border border-gray-200/80 shadow-sm max-h-[70vh] overflow-y-auto space-y-1">
                {data.sections?.map((s: any) => (
                  <button
                    key={s.section_id}
                    onClick={() => setActiveSectionId(s.section_id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer text-xs font-semibold ${
                      activeSectionId === s.section_id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    <span className={`px-2 py-0.5 rounded-md font-bold shrink-0 ${
                      activeSectionId === s.section_id ? 'bg-white text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {s.section_id}
                    </span>
                    <span className="leading-tight line-clamp-2">{s.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Section Content Detail */}
            <div className="lg:col-span-8 space-y-6">
              {currentSection ? (
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      Section {currentSection.section_id}
                    </span>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 mt-2">
                      {currentSection.title}
                    </h2>
                  </div>

                  {/* Key Concepts / Definitions */}
                  {currentSection.key_concepts && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Core Definitions & Concepts</h4>
                      <div className="grid gap-3">
                        {currentSection.key_concepts.map((kc: any, i: number) => (
                          <div key={i} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/70">
                            <span className="font-bold text-blue-900 block mb-1">📌 {kc.term}</span>
                            <p className="text-gray-700 text-sm leading-relaxed">{kc.definition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Definitions if separate */}
                  {currentSection.definitions && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Key Definitions</h4>
                      <div className="grid gap-3">
                        {currentSection.definitions.map((def: any, i: number) => (
                          <div key={i} className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/80">
                            <span className="font-bold text-emerald-900 block mb-1">✓ {def.term}</span>
                            <p className="text-gray-700 text-sm leading-relaxed">{def.definition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Noble Gas Reference Table */}
                  {currentSection.noble_gas_table && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Noble Gas Electronic Configurations</h4>
                      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                        <table className="w-full text-left text-xs md:text-sm">
                          <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                            <tr>
                              <th className="p-3">Element</th>
                              <th className="p-3">Symbol</th>
                              <th className="p-3">At. No.</th>
                              <th className="p-3">Electronic Configuration</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {currentSection.noble_gas_table.map((g: any, i: number) => (
                              <tr key={i} className="hover:bg-blue-50/30">
                                <td className="p-3 font-semibold text-gray-900">{g.name}</td>
                                <td className="p-3 font-mono font-bold text-blue-600">{g.symbol}</td>
                                <td className="p-3">{g.atomic_number}</td>
                                <td className="p-3 font-mono bg-blue-50/40 font-bold text-gray-800">{g.electronic_configuration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Formation Steps */}
                  {currentSection.formation_process && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Formation Process</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {currentSection.formation_process.map((step: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Electron Dot & Ionic Equation Highlights */}
                  {currentSection.electron_dot_structure && (
                    <div className="p-5 bg-gradient-to-br from-indigo-900 to-blue-900 text-white rounded-2xl shadow-md space-y-2">
                      <span className="text-xs uppercase font-bold text-blue-200 tracking-wider block">
                        ⚛️ Electron Dot Representation
                      </span>
                      <div className="text-base md:text-lg font-mono font-bold text-amber-300 bg-black/40 p-3 rounded-xl">
                        {currentSection.electron_dot_structure}
                      </div>
                    </div>
                  )}

                  {currentSection.ionic_equation && (
                    <div className="p-4 bg-gray-900 text-white rounded-2xl space-y-1">
                      <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Ionic Equations</span>
                      <div className="space-y-1 font-mono text-sm text-emerald-400">
                        {currentSection.ionic_equation.map((eq: string, i: number) => (
                          <div key={i}>{eq}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specific compound objects */}
                  {currentSection.compounds && (
                    <div className="space-y-4">
                      {currentSection.compounds.map((comp: any, i: number) => (
                        <div key={i} className="p-5 bg-blue-50/40 rounded-2xl border border-blue-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-base text-gray-900">{comp.name}</h5>
                            <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg">
                              {comp.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comp.formation}</p>
                          <div className="p-3 bg-white rounded-xl font-mono text-sm text-blue-700 border border-blue-200 font-bold">
                            {comp.electron_dot_structure}
                          </div>
                          {comp.lone_pairs && (
                            <div className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 inline-block">
                              ⚡ Lone Pairs: {comp.lone_pairs}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comparison Table for Section L */}
                  {currentSection.comparison_table && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">
                        Electrovalent vs Covalent Compounds (Side-by-Side)
                      </h4>
                      <div className="overflow-x-auto rounded-2xl border border-gray-200">
                        <table className="w-full text-left text-xs md:text-sm">
                          <thead className="bg-gray-100 text-gray-900 font-black">
                            <tr>
                              <th className="p-3 w-1/4">Property</th>
                              <th className="p-3 w-3/8 text-blue-700">Electrovalent (Ionic)</th>
                              <th className="p-3 w-3/8 text-indigo-700">Covalent</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {currentSection.comparison_table.map((row: any, i: number) => (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                <td className="p-3 font-bold text-gray-800">{row.property}</td>
                                <td className="p-3 text-gray-700 leading-relaxed">{row.electrovalent}</td>
                                <td className="p-3 text-gray-700 leading-relaxed">{row.covalent}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Summary structures for Section M */}
                  {currentSection.summary_structures && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">
                        Summary Chart of All 11 Electron Dot Structures
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentSection.summary_structures.map((s: any, i: number) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-sm text-gray-900">{s.compound}</span>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">
                                {s.type}
                              </span>
                            </div>
                            <div className="font-mono text-xs font-bold text-blue-700 bg-white p-2 rounded-lg border border-gray-100">
                              {s.structure}
                            </div>
                            {s.configurations && (
                              <div className="text-[11px] text-gray-500 font-mono">{s.configurations}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* TAB 2: EQUATIONS & REDOX */}
        {activeTab === 'formulas' && (
          <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <IoFlask className="text-blue-600" />
                Key Chemical Equations & Redox Reactions
              </h3>
              <p className="text-gray-500 text-sm">
                Essential oxidation, reduction, formation, and electrolytic equations mandated in the ICSE syllabus.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {data.key_formulas_and_equations?.map((eq: any, i: number) => (
                  <div key={i} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col justify-between">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">
                      {eq.concept}
                    </span>
                    <span className="font-mono text-base font-black text-gray-900 bg-white px-3 py-2 rounded-xl border border-blue-200">
                      {eq.equation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GLOSSARY */}
        {activeTab === 'glossary' && (
          <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <IoList className="text-blue-600" />
                    Key Terms & Definitions Glossary
                  </h3>
                  <p className="text-gray-500 text-sm">Every definition from the chapter formatted for quick revision.</p>
                </div>
                <input
                  type="text"
                  placeholder="Search glossary terms..."
                  value={searchGlossary}
                  onChange={e => setSearchGlossary(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-600 text-sm font-semibold max-w-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGlossary.map((item: any, i: number) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 hover:border-blue-200 transition-colors">
                    <h5 className="font-bold text-blue-700 text-base mb-1">{item.term}</h5>
                    <p className="text-gray-700 text-sm leading-relaxed">{item.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRACTICE & BOARD MCQS */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <IoSparkles className="text-blue-600" />
                  Practice Questions & Previous Year Board MCQs
                </h3>
                <p className="text-gray-500 text-sm">
                  Official workbook questions and ICSE Board Exam MCQs (2013–2025) with revealable explanations.
                </p>
              </div>

              {/* MCQs */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Multiple Choice Questions</h4>
                {data.practice_questions?.mcqs?.map((mcq: any, i: number) => {
                  const key = `mcq_${i}`;
                  const isRevealed = revealedAnswers[key];
                  return (
                    <div key={i} className="p-5 bg-blue-50/30 rounded-2xl border border-blue-100 space-y-3">
                      <p className="font-bold text-gray-900 text-sm md:text-base">
                        Q{i + 1}. {mcq.question}
                      </p>

                      {mcq.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm font-medium text-gray-700">
                          {Object.entries(mcq.options).map(([opt, val]: any) => (
                            <div key={opt} className="p-2.5 bg-white rounded-xl border border-gray-200 flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-gray-100 font-bold flex items-center justify-center text-gray-700">
                                {opt}
                              </span>
                              <span>{val}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          onClick={() => toggleReveal(key)}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <IoEye />
                          <span>{isRevealed ? 'Hide Answer' : 'Show Answer & Explanation'}</span>
                        </button>

                        {isRevealed && (
                          <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-sm font-semibold animate-fadeIn">
                            ✅ <strong>Correct Answer:</strong> {mcq.answer}
                            {mcq.note && <p className="text-xs text-gray-600 mt-1">{mcq.note}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Give Reasons */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Give Scientific Reasons</h4>
                {data.practice_questions?.give_reasons?.map((gr: any, i: number) => {
                  const key = `gr_${i}`;
                  const isRevealed = revealedAnswers[key];
                  return (
                    <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
                      <p className="font-bold text-gray-900 text-sm">
                        {i + 1}. {gr.question}
                      </p>
                      <button
                        onClick={() => toggleReveal(key)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {isRevealed ? 'Hide Reason' : 'Show Scientific Explanation ▼'}
                      </button>
                      {isRevealed && (
                        <p className="text-sm text-gray-700 bg-white p-3 rounded-xl border border-gray-200 leading-relaxed">
                          {gr.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: UNIT TEST (30 MARKS) */}
        {activeTab === 'test' && (
          <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {data.unit_test_paper?.title || 'Unit Test Paper 2'}
                  </h3>
                  <p className="text-gray-500 text-sm">Self-assessment paper covering the entire chapter.</p>
                </div>
                <span className="px-4 py-2 bg-blue-100 text-blue-800 font-extrabold rounded-2xl text-sm">
                  Total: {data.unit_test_paper?.marks || 30} Marks
                </span>
              </div>

              <div className="space-y-6">
                {data.unit_test_paper?.questions?.map((q: any, i: number) => {
                  const key = `ut_${i}`;
                  const isRevealed = revealedAnswers[key];
                  return (
                    <div key={i} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-blue-700 text-base">{q.number}: {q.type}</span>
                        <span className="text-xs font-bold bg-white px-3 py-1 rounded-full border border-gray-200 text-gray-700">
                          [{q.marks} Marks]
                        </span>
                      </div>

                      {q.items && (
                        <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-800 font-medium">
                          {q.items.map((item: any, itemIdx: number) => (
                            <li key={itemIdx} className="leading-relaxed">
                              {typeof item === 'string' ? item : item.statement || item.question}
                            </li>
                          ))}
                        </ul>
                      )}

                      {q.table_rows && (
                        <div className="overflow-x-auto rounded-xl border border-gray-200 mt-2">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-gray-200 font-bold text-gray-800">
                              <tr>
                                <th className="p-2">Element Pair</th>
                                <th className="p-2">Expected Bond</th>
                                <th className="p-2">Formula</th>
                              </tr>
                            </thead>
                            <tbody>
                              {q.table_rows.map((row: any, rIdx: number) => (
                                <tr key={rIdx} className="border-t border-gray-100 bg-white">
                                  <td className="p-2 font-semibold">{row.pair}</td>
                                  <td className="p-2 text-blue-600">{row.expected_bond}</td>
                                  <td className="p-2 font-mono font-bold text-emerald-600">{row.expected_formula}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {q.answer_hints && (
                        <div className="pt-2">
                          <button
                            onClick={() => toggleReveal(key)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800"
                          >
                            {isRevealed ? 'Hide Marking Scheme' : 'View Suggested Marking Scheme ▼'}
                          </button>
                          {isRevealed && (
                            <div className="mt-2 p-3 bg-white rounded-xl border border-gray-200 text-xs text-gray-700 font-medium">
                              {q.answer_hints}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: QUICK REVISION & TIPS */}
        {activeTab === 'revision' && (
          <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <IoCheckmarkCircle className="text-blue-600" />
                Night-Before-Exam Quick Revision & Pro Tips
              </h3>

              {/* Quick Recall tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                  <h5 className="font-bold text-blue-900 text-sm uppercase">⚡ Lone Pairs Quick Recall</h5>
                  <div className="space-y-1.5 text-xs font-semibold">
                    {data.quick_revision_summary?.lone_pairs_quick_recall?.map((lp: any, i: number) => (
                      <div key={i} className="flex justify-between p-2 bg-white rounded-lg border border-blue-100">
                        <span className="font-mono text-gray-800">{lp.species}</span>
                        <span className="text-blue-700 font-bold">{lp.lone_pairs} lone pair(s)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
                  <h5 className="font-bold text-purple-900 text-sm uppercase">🔗 Bond Order Quick Recall</h5>
                  <div className="space-y-1.5 text-xs font-semibold">
                    {data.quick_revision_summary?.bond_order_quick_recall?.map((bo: any, i: number) => (
                      <div key={i} className="flex justify-between p-2 bg-white rounded-lg border border-purple-100">
                        <span className="font-mono text-gray-800">{bo.molecule}</span>
                        <span className="text-purple-700 font-bold">{bo.bond_type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Exam Tips */}
              <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl space-y-3">
                <h4 className="font-black text-amber-900 text-base flex items-center gap-2">
                  <span>💡</span> 12 Proven Board Exam Presentation Tips
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-950 font-medium">
                  {data.quick_revision_summary?.exam_tips?.map((tip: string, i: number) => (
                    <li key={i} className="p-2.5 bg-white/80 rounded-xl border border-amber-100 flex items-start gap-2">
                      <span className="text-amber-600 font-bold">{i + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
