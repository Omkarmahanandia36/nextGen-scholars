'use client';

import React, { useState, useEffect } from 'react';
import { 
  IoBook, IoFlask, IoSparkles, IoDocumentText, 
  IoChevronForward, IoCheckmarkCircle, IoEye, 
  IoList, IoShieldCheckmark, IoRibbon, IoCopyOutline
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

  // Derive sections list reliably whether stored in array or section_X keys
  const sections: any[] = data.sections || 
    Object.keys(data)
      .filter(k => k.startsWith('section_'))
      .map(k => data[k]);

  const currentSection = sections?.find((s: any) => s.section_id === activeSectionId) || sections?.[0];

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
              {data.subject || 'Chemistry'} • Chapter {data.chapter_number || 1}
            </span>
            <span className="px-3 py-1 bg-emerald-500/30 text-emerald-200 rounded-full text-xs font-bold flex items-center gap-1">
              <IoShieldCheckmark /> Verified Complete Study Guide
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            {data.title}{data.subtitle ? `: ${data.subtitle}` : ''}
          </h1>

          {data.syllabus_scope && (
            <div className="mt-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-xs md:text-sm text-blue-50">
              <div className="font-bold uppercase tracking-wider text-blue-200 mb-1 flex items-center gap-1.5">
                <IoRibbon className="text-base" /> ICSE Syllabus Scope ({data.syllabus_scope.exam_year || 'Board Compliant'})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {Array.isArray(data.syllabus_scope.scope) ? (
                  data.syllabus_scope.scope.map((sc: any, idx: number) => (
                    <div key={idx} className="bg-black/20 p-2.5 rounded-xl">
                      <span className="font-bold text-white block mb-1">✓ {sc.topic || sc.title}</span>
                      <ul className="list-disc list-inside text-xs text-blue-100/90 space-y-0.5">
                        {sc.points?.slice(0, 3).map((pt: string, pIdx: number) => (
                          <li key={pIdx} className="truncate">{pt}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : typeof data.syllabus_scope.scope === 'object' ? (
                  Object.entries(data.syllabus_scope.scope).map(([key, sc]: [string, any], idx: number) => (
                    <div key={idx} className="bg-black/20 p-2.5 rounded-xl">
                      <span className="font-bold text-white block mb-1">✓ {sc.title || key}</span>
                      <ul className="list-disc list-inside text-xs text-blue-100/90 space-y-0.5">
                        {sc.points?.slice(0, 3).map((pt: string, pIdx: number) => (
                          <li key={pIdx} className="truncate">{pt}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : null}
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
            <span>Chapter Theory ({sections?.length || 12} Sections)</span>
          </button>

          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'formulas' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <IoFlask />
            <span>Equations & Trends</span>
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
            <span>Unit Test ({data.unit_test_paper?.marks || 30} Marks)</span>
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
        
        {/* TAB 1: THEORY & SECTIONS */}
        {activeTab === 'theory' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar list of Sections */}
            <div className="lg:col-span-4 space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3 px-2">
                Sections Index ({sections.length})
              </h3>
              <div className="bg-white p-2 rounded-2xl border border-gray-200/80 shadow-sm max-h-[70vh] overflow-y-auto space-y-1">
                {sections?.map((s: any) => (
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

                  {/* Modern Periodic Law Highlight */}
                  {currentSection.modern_periodic_law && (
                    <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md space-y-1">
                      <span className="text-xs uppercase font-bold text-blue-200 tracking-wider">⚖️ Modern Periodic Law (Moseley, 1912)</span>
                      <p className="text-base md:text-lg font-bold leading-relaxed">
                        "{currentSection.modern_periodic_law}"
                      </p>
                    </div>
                  )}

                  {/* Need for classification */}
                  {currentSection.need_for_classification && (
                    <div className="space-y-2 p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900">Need for Classification</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {currentSection.need_for_classification.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* History of classification */}
                  {currentSection.history_of_classification && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Historical Evolution of Classification</h4>
                      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                        <table className="w-full text-left text-xs md:text-sm">
                          <thead className="bg-gray-100 text-gray-800 font-bold border-b border-gray-200">
                            <tr>
                              <th className="p-3">Scientist / Attempt</th>
                              <th className="p-3">Basis</th>
                              <th className="p-3">Outcome / Reason for Discarding</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {currentSection.history_of_classification.map((h: any, i: number) => (
                              <tr key={i} className="hover:bg-blue-50/30">
                                <td className="p-3 font-bold text-gray-900">{h.scientist}</td>
                                <td className="p-3 text-blue-700 font-medium">{h.basis}</td>
                                <td className="p-3 text-gray-600">{h.outcome}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Salient Features */}
                  {currentSection.salient_features && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Salient Features of the Modern Periodic Table</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentSection.salient_features.map((feat: any, idx: number) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80">
                            <span className="font-bold text-blue-700 block mb-1">✨ {feat.feature}</span>
                            <p className="text-xs md:text-sm text-gray-700 leading-relaxed">{feat.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Single Definition */}
                  {typeof currentSection.definition === 'string' && (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                      <span className="font-bold text-xs uppercase tracking-wider text-emerald-800 block mb-1">Definition</span>
                      <p className="text-sm text-gray-800 leading-relaxed">{currentSection.definition}</p>
                    </div>
                  )}

                  {/* Key Concepts */}
                  {currentSection.key_concepts && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Core Definitions & Concepts</h4>
                      <div className="grid gap-3">
                        {currentSection.key_concepts.map((kc: any, i: number) => (
                          <div key={i} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/70">
                            {typeof kc === 'string' ? (
                              <p className="text-gray-800 text-sm font-medium leading-relaxed">📌 {kc}</p>
                            ) : (
                              <>
                                <span className="font-bold text-blue-900 block mb-1">📌 {kc.term}</span>
                                <p className="text-gray-700 text-sm leading-relaxed">{kc.definition}</p>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Seven Periods Table */}
                  {currentSection.seven_periods_table && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">The Seven Periods</h4>
                      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                        <table className="w-full text-left text-xs md:text-sm">
                          <thead className="bg-gray-100 text-gray-800 font-bold border-b border-gray-200">
                            <tr>
                              <th className="p-2.5">Period</th>
                              <th className="p-2.5">Type</th>
                              <th className="p-2.5">No. of Elements</th>
                              <th className="p-2.5">Atomic Numbers</th>
                              <th className="p-2.5">Special Series / Note</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {currentSection.seven_periods_table.map((row: any, i: number) => (
                              <tr key={i} className="hover:bg-blue-50/30">
                                <td className="p-2.5 font-bold text-blue-600">Period {row.period}</td>
                                <td className="p-2.5 font-medium">{row.type}</td>
                                <td className="p-2.5 font-bold">{row.no_of_elements}</td>
                                <td className="p-2.5 font-mono text-gray-700">{row.atomic_numbers}</td>
                                <td className="p-2.5 text-xs text-amber-700 font-medium">{row.note || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Period 2 & 3 Elements Table */}
                  {(currentSection.period_2_elements_table || currentSection.period_3_elements_table) && (
                    <div className="space-y-4">
                      {currentSection.period_2_elements_table && (
                        <div className="space-y-2">
                          <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Period 2 Elements (Li to Ne)</h4>
                          <div className="overflow-x-auto rounded-2xl border border-gray-200">
                            <table className="w-full text-left text-xs md:text-sm">
                              <thead className="bg-gray-100 text-gray-700 font-bold">
                                <tr>
                                  <th className="p-2">Group</th>
                                  <th className="p-2">Element</th>
                                  <th className="p-2">Symbol</th>
                                  <th className="p-2">At. No.</th>
                                  <th className="p-2">Config</th>
                                  <th className="p-2">State</th>
                                  <th className="p-2">Valency</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 bg-white">
                                {currentSection.period_2_elements_table.map((el: any, i: number) => (
                                  <tr key={i}>
                                    <td className="p-2 text-xs font-semibold text-gray-500">{el.group}</td>
                                    <td className="p-2 font-bold text-gray-900">{el.element}</td>
                                    <td className="p-2 font-mono font-bold text-blue-600">{el.symbol}</td>
                                    <td className="p-2">{el.at_no}</td>
                                    <td className="p-2 font-mono text-emerald-700 font-bold">{el.elec_config}</td>
                                    <td className="p-2 text-xs">{el.state}</td>
                                    <td className="p-2 font-bold">{el.valency}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      {currentSection.period_3_elements_table && (
                        <div className="space-y-2">
                          <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Period 3 Elements (Na to Ar)</h4>
                          <div className="overflow-x-auto rounded-2xl border border-gray-200">
                            <table className="w-full text-left text-xs md:text-sm">
                              <thead className="bg-gray-100 text-gray-700 font-bold">
                                <tr>
                                  <th className="p-2">Group</th>
                                  <th className="p-2">Element</th>
                                  <th className="p-2">Symbol</th>
                                  <th className="p-2">At. No.</th>
                                  <th className="p-2">Config</th>
                                  <th className="p-2">State</th>
                                  <th className="p-2">Valency</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 bg-white">
                                {currentSection.period_3_elements_table.map((el: any, i: number) => (
                                  <tr key={i}>
                                    <td className="p-2 text-xs font-semibold text-gray-500">{el.group}</td>
                                    <td className="p-2 font-bold text-gray-900">{el.element}</td>
                                    <td className="p-2 font-mono font-bold text-blue-600">{el.symbol}</td>
                                    <td className="p-2">{el.at_no}</td>
                                    <td className="p-2 font-mono text-emerald-700 font-bold">{el.elec_config}</td>
                                    <td className="p-2 text-xs">{el.state}</td>
                                    <td className="p-2 font-bold">{el.valency}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Period 3 Compounds Table */}
                  {currentSection.period_3_compounds_table && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Period 3 Compounds & Variations (Chlorides, Oxides, Hydroxides, Hydrides)</h4>
                      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-100 font-bold text-gray-800">
                            <tr>
                              {currentSection.period_3_compounds_table.headers?.map((h: string, idx: number) => (
                                <th key={idx} className="p-2.5">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {[
                              { label: 'Chloride Formula', key: 'chloride_formula' },
                              { label: 'Chloride Bonding', key: 'chloride_bonding' },
                              { label: 'Chloride State', key: 'chloride_state' },
                              { label: 'Oxide Formula', key: 'oxide_formula' },
                              { label: 'Oxide Bonding', key: 'oxide_bonding' },
                              { label: 'Oxide Character', key: 'oxide_character' },
                              { label: 'Hydroxide Formula', key: 'hydroxide' },
                              { label: 'Hydroxide Character', key: 'hydroxide_character' },
                              { label: 'Hydride Formula', key: 'hydride' },
                              { label: 'Hydride Character', key: 'hydride_character' },
                            ].map((row, rIdx) => {
                              const vals = currentSection.period_3_compounds_table[row.key] || [];
                              return (
                                <tr key={rIdx} className="hover:bg-blue-50/20">
                                  <td className="p-2.5 font-bold text-gray-800 bg-gray-50/50">{row.label}</td>
                                  {vals.map((v: string, cIdx: number) => (
                                    <td key={cIdx} className="p-2.5 font-medium">{v}</td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Bridge Elements */}
                  {currentSection.bridge_elements && (
                    <div className="p-5 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-purple-900 block">Bridge Elements & Diagonal Relationship</span>
                      <p className="text-sm text-gray-800">{currentSection.bridge_elements.definition}</p>
                      {currentSection.bridge_elements.diagram_ascii && (
                        <pre className="font-mono text-xs bg-slate-900 text-emerald-300 p-3 rounded-xl overflow-x-auto">
                          {currentSection.bridge_elements.diagram_ascii}
                        </pre>
                      )}
                      <p className="text-xs text-purple-800 font-semibold">{currentSection.bridge_elements.example}</p>
                    </div>
                  )}

                  {/* Groups Summary Table */}
                  {currentSection.groups_summary_table && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Classification of Groups in Modern Periodic Table</h4>
                      <div className="overflow-x-auto rounded-2xl border border-gray-200">
                        <table className="w-full text-left text-xs md:text-sm">
                          <thead className="bg-gray-100 text-gray-800 font-bold border-b border-gray-200">
                            <tr>
                              <th className="p-2.5">Group</th>
                              <th className="p-2.5">Family / Type</th>
                              <th className="p-2.5">Elements</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {currentSection.groups_summary_table.map((g: any, i: number) => (
                              <tr key={i} className="hover:bg-blue-50/30">
                                <td className="p-2.5 font-bold text-blue-600">{g.group}</td>
                                <td className="p-2.5 font-bold text-gray-800">{g.type}</td>
                                <td className="p-2.5 text-xs text-gray-600">{g.elements}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Alkali Metals vs Halogens Comparison */}
                  {currentSection.alkali_metals_vs_halogens_comparison && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Group 1 Alkali Metals vs Group 17 Halogens Comparison</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2">
                          <h5 className="font-extrabold text-blue-900 text-base">Group 1: Alkali Metals</h5>
                          <div className="text-xs space-y-1.5 text-gray-800">
                            <div><strong className="text-blue-800">Elements:</strong> {currentSection.alkali_metals_vs_halogens_comparison.group_1_alkali_metals?.elements}</div>
                            <div><strong className="text-blue-800">Valency:</strong> {currentSection.alkali_metals_vs_halogens_comparison.group_1_alkali_metals?.valency}</div>
                            <div><strong className="text-blue-800">Nature:</strong> {currentSection.alkali_metals_vs_halogens_comparison.group_1_alkali_metals?.nature}</div>
                            <div><strong className="text-blue-800">Conductivity:</strong> {currentSection.alkali_metals_vs_halogens_comparison.group_1_alkali_metals?.conductivity}</div>
                            <div><strong className="text-blue-800">Redox Nature:</strong> {currentSection.alkali_metals_vs_halogens_comparison.group_1_alkali_metals?.redox_nature}</div>
                            <div><strong className="text-blue-800">Electronegativity:</strong> {currentSection.alkali_metals_vs_halogens_comparison.group_1_alkali_metals?.electronegativity}</div>
                            <div><strong className="text-blue-800">With Non-metals:</strong> {currentSection.alkali_metals_vs_halogens_comparison.group_1_alkali_metals?.reaction_with_non_metals}</div>
                            <div><strong className="text-blue-800">With Hydrogen:</strong> {currentSection.alkali_metals_vs_halogens_comparison.group_1_alkali_metals?.reaction_with_hydrogen}</div>
                          </div>
                        </div>
                        <div className="p-5 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-2">
                          <h5 className="font-extrabold text-rose-900 text-base">Group 17: Halogens</h5>
                          <div className="text-xs space-y-1.5 text-gray-800">
                            <div><strong className="text-rose-800">Elements:</strong> {currentSection.alkali_metals_vs_halogens_comparison.group_17_halogen?.elements}</div>
                            <div><strong className="text-rose-800">Valency:</strong> {currentSection.alkali_metals_vs_halogens_comparison.group_17_halogen?.valency}</div>
                            <div><strong className="text-rose-800">Nature:</strong> {currentSection.alkali_metals_vs_halogens_comparison.group_17_halogen?.nature}</div>
                            <div><strong className="text-rose-800">Conductivity:</strong> {currentSection.alkali_metals_vs_halogens_comparison.group_17_halogen?.conductivity}</div>
                            <div><strong className="text-rose-800">Redox Nature:</strong> {currentSection.alkali_metals_vs_halogens_comparison.group_17_halogen?.redox_nature}</div>
                            <div><strong className="text-rose-800">Electronegativity:</strong> {currentSection.alkali_metals_vs_halogens_comparison.group_17_halogen?.electronegativity}</div>
                            <div><strong className="text-rose-800">With Non-metals:</strong> {currentSection.alkali_metals_vs_halogens_comparison.group_17_halogen?.reaction_with_non_metals}</div>
                            <div><strong className="text-rose-800">With Hydrogen:</strong> {currentSection.alkali_metals_vs_halogens_comparison.group_17_halogen?.reaction_with_hydrogen}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Definitions Table */}
                  {currentSection.definitions_table && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Periodic Properties Definitions & Equations</h4>
                      <div className="grid gap-3">
                        {currentSection.definitions_table.map((item: any, i: number) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                            <span className="font-bold text-blue-700 text-sm block">✓ {item.property}</span>
                            <p className="text-xs md:text-sm text-gray-700 leading-relaxed">{item.definition}</p>
                            {item.equation && (
                              <div className="font-mono text-xs text-emerald-700 bg-white p-2 rounded-lg border border-gray-100 font-bold">
                                {item.equation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Factors Affecting Property */}
                  {(currentSection.factors_affecting_atomic_size || currentSection.factors_affecting_IP || currentSection.factors_affecting_EA || currentSection.factors_affecting_EN || currentSection.factors_influencing) && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Factors Affecting this Property</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(currentSection.factors_affecting_atomic_size || currentSection.factors_affecting_IP || currentSection.factors_affecting_EA || currentSection.factors_affecting_EN || currentSection.factors_influencing).map((f: any, idx: number) => (
                          <div key={idx} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1">
                            <span className="font-bold text-gray-900 block">⚙️ {f.factor}</span>
                            {f.effect && <p className="text-gray-700">{f.effect}</p>}
                            {f.metallic_char && <p className="text-blue-700 font-semibold">Metallic Character: {f.metallic_char}</p>}
                            {f.non_metallic_char && <p className="text-rose-700 font-semibold">Non-Metallic Character: {f.non_metallic_char}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trends Across Period & Down Group */}
                  {(currentSection.trend_across_a_period || currentSection.trend_down_a_group) && (
                    <div className="space-y-4">
                      {currentSection.trend_across_a_period && (
                        <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs uppercase tracking-wider text-blue-900">
                              Across a Period (Left to Right)
                            </span>
                            <span className="px-3 py-1 bg-blue-600 text-white font-extrabold text-xs rounded-full">
                              {currentSection.trend_across_a_period.trend || `${currentSection.trend_across_a_period.metallic_character ? `Metallic: ${currentSection.trend_across_a_period.metallic_character}` : ''}`}
                            </span>
                          </div>
                          {currentSection.trend_across_a_period.reasons && (
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-gray-700">Reasons:</span>
                              <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                                {currentSection.trend_across_a_period.reasons.map((r: string, rIdx: number) => (
                                  <li key={rIdx}>{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {currentSection.trend_across_a_period.key_facts && (
                            <div className="space-y-1 pt-2 border-t border-blue-200/60">
                              <span className="text-xs font-bold text-blue-900">Key Board Exam Facts:</span>
                              <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                                {currentSection.trend_across_a_period.key_facts.map((kf: string, kIdx: number) => (
                                  <li key={kIdx}>{kf}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {currentSection.trend_down_a_group && (
                        <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs uppercase tracking-wider text-emerald-900">
                              Down a Group (Top to Bottom)
                            </span>
                            <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-full">
                              {currentSection.trend_down_a_group.trend || `${currentSection.trend_down_a_group.metallic_character ? `Metallic: ${currentSection.trend_down_a_group.metallic_character}` : ''}`}
                            </span>
                          </div>
                          {currentSection.trend_down_a_group.reasons && (
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-gray-700">Reasons:</span>
                              <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                                {currentSection.trend_down_a_group.reasons.map((r: string, rIdx: number) => (
                                  <li key={rIdx}>{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {(currentSection.trend_down_a_group.important_note || currentSection.trend_down_a_group.key_note) && (
                            <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-medium">
                              💡 {currentSection.trend_down_a_group.important_note || currentSection.trend_down_a_group.key_note}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary Trend Map (ASCII Art) */}
                  {currentSection.trends_across_a_period_ascii && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Summary Trend Map (ASCII Art)</h4>
                      <pre className="font-mono text-xs bg-slate-900 text-emerald-400 p-4 rounded-2xl overflow-x-auto leading-relaxed">
                        {currentSection.trends_across_a_period_ascii}
                      </pre>
                    </div>
                  )}

                  {/* Reasons Summary Tables in Section L */}
                  {(currentSection.reasons_for_trends_across_a_period || currentSection.reasons_for_trends_down_a_group) && (
                    <div className="space-y-4">
                      {currentSection.reasons_for_trends_across_a_period && (
                        <div className="space-y-2">
                          <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Summary: Trends Across a Period</h4>
                          <div className="overflow-x-auto rounded-2xl border border-gray-200">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-gray-100 font-bold text-gray-800">
                                <tr>
                                  <th className="p-2.5">Property</th>
                                  <th className="p-2.5">Variation</th>
                                  <th className="p-2.5">Reason</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 bg-white">
                                {currentSection.reasons_for_trends_across_a_period.map((row: any, i: number) => (
                                  <tr key={i}>
                                    <td className="p-2.5 font-bold text-gray-900">{row.property}</td>
                                    <td className="p-2.5 font-bold text-blue-600">{row.change}</td>
                                    <td className="p-2.5 text-gray-600">{row.reason}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      {currentSection.reasons_for_trends_down_a_group && (
                        <div className="space-y-2">
                          <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Summary: Trends Down a Group</h4>
                          <div className="overflow-x-auto rounded-2xl border border-gray-200">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-gray-100 font-bold text-gray-800">
                                <tr>
                                  <th className="p-2.5">Property</th>
                                  <th className="p-2.5">Variation</th>
                                  <th className="p-2.5">Reason</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 bg-white">
                                {currentSection.reasons_for_trends_down_a_group.map((row: any, i: number) => (
                                  <tr key={i}>
                                    <td className="p-2.5 font-bold text-gray-900">{row.property}</td>
                                    <td className="p-2.5 font-bold text-emerald-600">{row.change}</td>
                                    <td className="p-2.5 text-gray-600">{row.reason}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chemical Properties Periodicity */}
                  {currentSection.chemical_properties_periodicity && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Variation in Chemical Nature</h4>
                      <div className="overflow-x-auto rounded-2xl border border-gray-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-100 font-bold text-gray-800">
                            <tr>
                              <th className="p-2.5">Property</th>
                              <th className="p-2.5">Across a Period</th>
                              <th className="p-2.5">Down a Group</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {currentSection.chemical_properties_periodicity.table?.map((row: any, i: number) => (
                              <tr key={i}>
                                <td className="p-2.5 font-bold text-gray-900">{row.property}</td>
                                <td className="p-2.5 text-blue-700 font-medium">{row.across_a_period}</td>
                                <td className="p-2.5 text-emerald-700 font-medium">{row.down_a_group}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Chemical Bonding specific comparison table */}
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

                  {/* Chemical Bonding specific summary structures */}
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

        {/* TAB 2: EQUATIONS & TRENDS */}
        {activeTab === 'formulas' && (
          <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <IoFlask className="text-blue-600" />
                Key Chemical Equations, Principles & Periodic Trends
              </h3>
              <p className="text-gray-500 text-sm">
                Essential equations, laws, and summary tables from the syllabus.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {data.key_formulas_and_equations?.map((eq: any, i: number) => (
                  <div key={i} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col justify-between">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">
                      {eq.concept}
                    </span>
                    <span className="font-mono text-sm md:text-base font-black text-gray-900 bg-white px-3 py-2 rounded-xl border border-blue-200">
                      {eq.equation}
                    </span>
                  </div>
                ))}
              </div>

              {/* ASCII Summary Grid if present */}
              {data.ascii_diagrams?.periodic_property_summary_grid && (
                <div className="pt-4 space-y-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-gray-600">
                    Periodic Property Summary Grid
                  </span>
                  <pre className="font-mono text-xs bg-slate-900 text-cyan-300 p-4 rounded-2xl overflow-x-auto leading-relaxed">
                    {data.ascii_diagrams.periodic_property_summary_grid}
                  </pre>
                </div>
              )}

              {/* First 4 Periods ASCII Table if present */}
              {data.ascii_diagrams?.modern_periodic_table_first_4_periods && (
                <div className="pt-4 space-y-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-gray-600">
                    Modern Periodic Table Structure (Periods 1-4)
                  </span>
                  <pre className="font-mono text-xs bg-slate-900 text-emerald-400 p-4 rounded-2xl overflow-x-auto leading-relaxed">
                    {data.ascii_diagrams.modern_periodic_table_first_4_periods}
                  </pre>
                </div>
              )}
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
                  Official workbook questions and ICSE Board Exam MCQs (2017–2025) with revealable explanations.
                </p>
              </div>

              {/* MCQs */}
              {data.practice_questions?.mcqs && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Multiple Choice Questions</h4>
                  {data.practice_questions.mcqs.map((mcq: any, i: number) => {
                    const key = `mcq_${i}`;
                    const isRevealed = revealedAnswers[key];
                    return (
                      <div key={i} className="p-5 bg-blue-50/30 rounded-2xl border border-blue-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-gray-900 text-sm md:text-base">
                            Q{i + 1}. {mcq.question}
                          </p>
                          {mcq.year && (
                            <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md shrink-0">
                              ICSE {mcq.year}
                            </span>
                          )}
                        </div>

                        {mcq.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm font-medium text-gray-700">
                            {Array.isArray(mcq.options)
                              ? mcq.options.map((opt: string, optIdx: number) => {
                                  const letter = String.fromCharCode(65 + optIdx);
                                  return (
                                    <div key={optIdx} className="p-2.5 bg-white rounded-xl border border-gray-200 flex items-center gap-2">
                                      <span className="w-6 h-6 rounded-lg bg-gray-100 font-bold flex items-center justify-center text-gray-700 text-xs">
                                        {letter}
                                      </span>
                                      <span>{opt}</span>
                                    </div>
                                  );
                                })
                              : Object.entries(mcq.options).map(([opt, val]: any) => (
                                  <div key={opt} className="p-2.5 bg-white rounded-xl border border-gray-200 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-gray-100 font-bold flex items-center justify-center text-gray-700 text-xs uppercase">
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
              )}

              {/* Give One Word / Technical Term */}
              {data.practice_questions?.give_one_word_or_phrase && (
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Give One Word or Technical Term</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.practice_questions.give_one_word_or_phrase.map((item: any, i: number) => {
                      const key = `gow_${i}`;
                      const isRevealed = revealedAnswers[key];
                      return (
                        <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 flex flex-col justify-between">
                          <p className="text-xs md:text-sm font-medium text-gray-800">{i + 1}. {item.question}</p>
                          <div>
                            <button
                              onClick={() => toggleReveal(key)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800"
                            >
                              {isRevealed ? 'Hide Term' : 'Show Answer ▼'}
                            </button>
                            {isRevealed && (
                              <div className="mt-1 text-xs font-bold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                                ✓ {item.answer}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Give Reasons */}
              {data.practice_questions?.give_reasons && (
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Give Scientific Reasons</h4>
                  {data.practice_questions.give_reasons.map((gr: any, i: number) => {
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
              )}

              {/* Identify the Following */}
              {data.practice_questions?.identify_the_following && (
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Identify the Element / Compound</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.practice_questions.identify_the_following.map((item: any, i: number) => {
                      const key = `idf_${i}`;
                      const isRevealed = revealedAnswers[key];
                      return (
                        <div key={i} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between">
                          <span className="text-xs text-gray-800 font-medium">{i + 1}. {item.question}</span>
                          <div className="mt-2">
                            <button
                              onClick={() => toggleReveal(key)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800"
                            >
                              {isRevealed ? 'Hide' : 'Show Answer ▼'}
                            </button>
                            {isRevealed && (
                              <div className="mt-1 text-xs font-bold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                                ✓ {item.answer}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: UNIT TEST */}
        {activeTab === 'test' && (
          <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {data.unit_test_paper?.title || 'Chapter Unit Test'}
                  </h3>
                  <p className="text-gray-500 text-sm">Self-assessment test paper covering the entire chapter.</p>
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
                        <div className="space-y-2">
                          {q.items.map((item: any, itemIdx: number) => {
                            const qText = typeof item === 'string' ? item : item.statement || item.question;
                            const ans = typeof item === 'object' ? item.answer : null;
                            return (
                              <div key={itemIdx} className="p-2.5 bg-white rounded-xl border border-gray-100 text-xs md:text-sm">
                                <p className="font-medium text-gray-800">{itemIdx + 1}. {qText}</p>
                                {isRevealed && ans && (
                                  <div className="mt-1 text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-md">
                                    Ans: {ans}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {q.pairs && (
                        <div className="overflow-x-auto rounded-xl border border-gray-200 mt-2">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-gray-200 font-bold text-gray-800">
                              <tr>
                                <th className="p-2">Column X</th>
                                <th className="p-2">Column Y (Correct Match)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {q.pairs.map((p: any, pIdx: number) => (
                                <tr key={pIdx} className="border-t border-gray-100 bg-white">
                                  <td className="p-2 font-semibold">{p.column_X}</td>
                                  <td className="p-2 text-blue-600 font-bold">{isRevealed ? p.column_Y : '••••••'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          onClick={() => toggleReveal(key)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          {isRevealed ? 'Hide Answers' : 'View Answers & Marking Scheme ▼'}
                        </button>
                      </div>
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

              {/* One line summary */}
              {data.quick_revision_summary?.one_line_summary && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl">
                  <span className="font-bold text-xs uppercase tracking-wider text-blue-900 block mb-1">Chapter Essence</span>
                  <p className="text-xs md:text-sm text-gray-800 leading-relaxed font-medium">
                    {data.quick_revision_summary.one_line_summary}
                  </p>
                </div>
              )}

              {/* Mnemonics */}
              {(data.quick_revision_summary?.mnemonic_across_period || data.quick_revision_summary?.mnemonic_down_group) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.quick_revision_summary?.mnemonic_across_period && (
                    <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
                      <span className="font-bold text-xs uppercase tracking-wider text-purple-900">Across Period Mnemonic</span>
                      <p className="text-xs text-purple-950 font-medium">{data.quick_revision_summary.mnemonic_across_period}</p>
                    </div>
                  )}
                  {data.quick_revision_summary?.mnemonic_down_group && (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                      <span className="font-bold text-xs uppercase tracking-wider text-amber-900">Down Group Mnemonic</span>
                      <p className="text-xs text-amber-950 font-medium">{data.quick_revision_summary.mnemonic_down_group}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Compact Trends Grid */}
              {data.quick_revision_summary?.trends_grid_compact && (
                <div className="space-y-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-gray-700">Crucial Trends Grid</span>
                  <pre className="font-mono text-xs bg-slate-900 text-yellow-300 p-4 rounded-2xl overflow-x-auto leading-relaxed">
                    {data.quick_revision_summary.trends_grid_compact}
                  </pre>
                </div>
              )}

              {/* Key Extremes */}
              {data.quick_revision_summary?.key_extremes && (
                <div className="space-y-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-gray-700">Key Extremes in the Periodic Table</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {data.quick_revision_summary.key_extremes.map((ext: string, i: number) => (
                      <div key={i} className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                        <span>{ext}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chemical Bonding specific lone pairs & bond order quick recall if present */}
              {data.quick_revision_summary?.lone_pairs_quick_recall && (
                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                  <h5 className="font-bold text-blue-900 text-sm uppercase">⚡ Lone Pairs Quick Recall</h5>
                  <div className="space-y-1.5 text-xs font-semibold">
                    {data.quick_revision_summary.lone_pairs_quick_recall.map((lp: any, i: number) => (
                      <div key={i} className="flex justify-between p-2 bg-white rounded-lg border border-blue-100">
                        <span className="font-mono text-gray-800">{lp.species}</span>
                        <span className="text-blue-700 font-bold">{lp.lone_pairs} lone pair(s)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exam Tips */}
              {data.quick_revision_summary?.exam_tips && (
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl space-y-3">
                  <h4 className="font-black text-amber-900 text-base flex items-center gap-2">
                    <span>💡</span> Board Exam Presentation Tips
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-950 font-medium">
                    {data.quick_revision_summary.exam_tips.map((tip: string, i: number) => (
                      <li key={i} className="p-2.5 bg-white/80 rounded-xl border border-amber-100 flex items-start gap-2">
                        <span className="text-amber-600 font-bold">{i + 1}.</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
