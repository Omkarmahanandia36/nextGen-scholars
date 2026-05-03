'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  IoBook, IoDocumentText, IoPlay, IoSearch, 
  IoChevronForward 
} from 'react-icons/io5';
import Link from 'next/link';

interface Material {
  _id: string;
  title: string;
  description: string;
  type: 'video' | 'pdf' | 'note';
  url: string;
  subject: string;
  createdAt: string;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [subjects, setSubjects] = useState<string[]>(['All']);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch('/api/student/materials');
        const data = await response.json();
        if (data.success) {
          setMaterials(data.materials);
          // Extract unique subjects
          const uniqueSubjects = ['All', ...new Set(data.materials.map((m: Material) => m.subject))] as string[];
          setSubjects(uniqueSubjects);
        }
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || m.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <Link href="/student/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-700 mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Study Materials</h1>
              <p className="text-gray-500">Access all your course resources and videos.</p>
            </div>
          </div>
        </header>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input 
              type="text" 
              placeholder="Search materials..." 
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
            {subjects.map(subject => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-6 py-4 rounded-2xl font-semibold transition-all whitespace-nowrap ${
                  selectedSubject === subject 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => (
              <motion.div
                key={material._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-4 rounded-2xl ${
                    material.type === 'video' ? 'bg-blue-50 text-blue-600' : 
                    material.type === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-600'
                  }`}>
                    {material.type === 'video' ? <IoPlay className="text-2xl" /> : <IoDocumentText className="text-2xl" />}
                  </div>
                  <span className="px-3 py-1 bg-gray-50 text-gray-500 text-xs font-bold rounded-lg uppercase">
                    {material.subject}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {material.title}
                </h3>
                <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-2">
                  {material.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <span className="text-xs text-gray-400 font-medium">
                    Added {new Date(material.createdAt).toLocaleDateString()}
                  </span>
                  <a 
                    href={material.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 font-bold hover:text-blue-700 transition-all"
                  >
                    <span>{material.type === 'video' ? 'Watch' : 'Open'}</span>
                    <IoChevronForward />
                  </a>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoBook className="text-4xl text-gray-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No materials found</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
