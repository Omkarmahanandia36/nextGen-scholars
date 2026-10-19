'use client';

import React from 'react';
import Link from 'next/link';
import { IoArrowBack } from 'react-icons/io5';
import NoteViewer from '@/components/materials/NoteViewer';

export default function ChemicalBondingNotePage() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] flex flex-col">
      {/* Top back breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link 
          href="/student/materials" 
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors"
        >
          <IoArrowBack className="text-lg" />
          <span>Back to Materials</span>
        </Link>
        <div className="text-xs font-semibold text-gray-500">
          Class 10 ICSE Chemistry • Chapter 2
        </div>
      </div>

      {/* Main Full-Height Note Reader */}
      <div className="flex-1">
        <NoteViewer noteUrl="/notes/chemical-bonding.json" />
      </div>
    </div>
  );
}
