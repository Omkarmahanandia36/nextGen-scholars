'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IoBook, IoDocumentText, IoPlay, IoSearch,
  IoChevronForward, IoFolderOpen, IoArrowBack, IoLink, IoClose
} from 'react-icons/io5';
import Link from 'next/link';

interface Material {
  _id: string;
  title: string;
  description: string;
  type: 'video' | 'pdf' | 'note' | 'link';
  url: string;
  subject: string;
  folderName?: string;
  createdAt: string;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const getEmbedUrl = (url: string, type?: string) => {
    if (!url) return '';
    
    // Handle Google Drive links
    if (url.includes('drive.google.com')) {
      return url.replace(/\/view.*$/, '/preview');
    }
    
    // Handle YouTube links
    if (url.includes('youtube.com/watch')) {
      try {
        const videoId = new URL(url).searchParams.get('v');
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      } catch (e) {
        // ignore invalid URL
      }
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    // Handle Uploadthing or direct PDF links using Google Docs Viewer for reliable cross-device iframe rendering
    if (type === 'pdf' || url.toLowerCase().endsWith('.pdf') || url.includes('utfs.io/f/') || url.includes('.ufs.sh/f/')) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }

    return url;
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch('/api/student/materials');
        const data = await response.json();
        if (data.success) {
          setMaterials(data.materials);
          setEnrolledSubjects(data.enrolledSubjects || []);
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
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const displaySubjects = enrolledSubjects.filter(subject => 
    subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    filteredMaterials.some(m => m.subject === subject)
  );
  
  const foldersInSubject = currentSubject 
    ? Array.from(new Set(filteredMaterials.filter(m => m.subject === currentSubject).map(m => m.folderName || 'General')))
    : [];

  const filesInFolder = (currentSubject && currentFolder)
    ? filteredMaterials.filter(m => m.subject === currentSubject && (m.folderName || 'General') === currentFolder)
    : [];

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
          <div className="flex flex-wrap items-center space-x-2 text-sm font-semibold text-gray-500 mb-4">
            <Link href="/student/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <button 
              onClick={() => { setCurrentSubject(null); setCurrentFolder(null); }}
              className={`hover:text-blue-600 transition-colors ${!currentSubject ? 'text-blue-600' : ''}`}
            >
              Materials
            </button>
            {currentSubject && (
              <>
                <span>/</span>
                <button 
                  onClick={() => setCurrentFolder(null)}
                  className={`hover:text-blue-600 transition-colors ${!currentFolder ? 'text-blue-600' : ''}`}
                >
                  {currentSubject}
                </button>
              </>
            )}
            {currentFolder && (
              <>
                <span>/</span>
                <span className="text-blue-600">{currentFolder}</span>
              </>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {!currentSubject ? 'Study Materials' : !currentFolder ? `${currentSubject} Folders` : `${currentFolder} Files`}
              </h1>
              <p className="text-gray-500">Access all your course resources and videos.</p>
            </div>
          </div>
        </header>

        {/* Search Bar - only show if there are materials */}
        <div className="mb-8">
          <div className="relative">
            <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search materials..."
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* View 1: Subjects View */}
        {!currentSubject && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displaySubjects.length > 0 ? (
              displaySubjects.map((subject) => (
                <motion.div
                  key={subject}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  onClick={() => setCurrentSubject(subject)}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center cursor-pointer group hover:shadow-xl hover:border-blue-100 transition-all"
                >
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <IoFolderOpen className="text-3xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 text-center">{subject}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredMaterials.filter(m => m.subject === subject).length} items
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IoBook className="text-4xl text-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No materials found</h3>
                <p className="text-gray-500">Try adjusting your search.</p>
              </div>
            )}
          </div>
        )}

        {/* View 2: Folders View */}
        {currentSubject && !currentFolder && (
          <div>
            <button 
              onClick={() => setCurrentSubject(null)}
              className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors"
            >
              <IoArrowBack className="mr-2" /> Back to Subjects
            </button>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {foldersInSubject.map((folder) => (
                <motion.div
                  key={folder}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  onClick={() => setCurrentFolder(folder)}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center cursor-pointer group hover:shadow-xl hover:border-blue-100 transition-all"
                >
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <IoFolderOpen className="text-3xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 text-center">{folder}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredMaterials.filter(m => m.subject === currentSubject && (m.folderName || 'General') === folder).length} items
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* View 3: Files View */}
        {currentSubject && currentFolder && (
          <div>
             <button 
              onClick={() => setCurrentFolder(null)}
              className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors"
            >
              <IoArrowBack className="mr-2" /> Back to Folders
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filesInFolder.length > 0 ? (
                filesInFolder.map((material) => (
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
                        material.type === 'pdf' ? 'bg-red-50 text-red-600' : 
                        material.type === 'link' ? 'bg-purple-50 text-purple-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {material.type === 'video' ? <IoPlay className="text-2xl" /> : 
                         material.type === 'link' ? <IoLink className="text-2xl" /> :
                         <IoDocumentText className="text-2xl" />}
                      </div>
                      <span className="px-3 py-1 bg-gray-50 text-gray-500 text-xs font-bold rounded-lg uppercase">
                        {material.type}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {material.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-2">
                      {material.description || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                      <span className="text-xs text-gray-400 font-medium">
                        Added {new Date(material.createdAt).toLocaleDateString()}
                      </span>
                      <a
                        href={material.type === 'link' ? material.url : '#'}
                        onClick={(e) => {
                          if (material.type !== 'link') {
                            e.preventDefault();
                            setSelectedMaterial(material);
                          }
                        }}
                        target={material.type === 'link' ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-600 font-bold hover:text-blue-700 transition-all cursor-pointer"
                      >
                        <span>{material.type === 'video' ? 'Watch' : material.type === 'link' ? 'Visit Link' : 'View'}</span>
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
                </div>
              )}
            </div>
          </div>
        )}

        {/* Material Viewer Modal */}
        {selectedMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className={`p-2 rounded-xl ${
                    selectedMaterial.type === 'video' ? 'bg-blue-50 text-blue-600' :
                    selectedMaterial.type === 'pdf' ? 'bg-red-50 text-red-600' : 
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {selectedMaterial.type === 'video' ? <IoPlay className="text-lg" /> : <IoDocumentText className="text-lg" />}
                  </div>
                  <h3 className="font-bold text-gray-900 truncate">{selectedMaterial.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <a 
                    href={selectedMaterial.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex items-center justify-center"
                    title="Open in new tab"
                  >
                    <IoLink className="text-xl" />
                  </a>
                  <button
                    onClick={() => setSelectedMaterial(null)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center"
                  >
                    <IoClose className="text-2xl" />
                  </button>
                </div>
              </div>
              <div className="flex-1 w-full bg-gray-100 relative">
                <iframe
                  src={getEmbedUrl(selectedMaterial.url, selectedMaterial.type)}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
