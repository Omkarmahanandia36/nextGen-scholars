'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaGraduationCap, FaMapMarkerAlt } from 'react-icons/fa';
import { IoMail } from 'react-icons/io5';
import Image from 'next/image';
import RegisterTutorModal from '@/components/modals/RegisterTutorModal';

interface Tutor {
  id?: string;
  name: string;
  image: string;
  subjects: string[];
  rating: number;
  reviews: number;
  students: number;
  experience: number;
  location: string;
  bio: string;
  qualification: string;
}

const FEATURED_TUTORS: Tutor[] = [
  {
    id: 'teacher-1',
    name: 'Priyanka jena',
    qualification: 'B.Sc. in Chemistry and B.Ed. in CBZ, with a hearing impairment.',
    image: '/images/tutors/priyanka-jena.png', // Place your teacher's photo inside public/images/tutors/priyanka-jena.png
    subjects: ['Chemistry', 'Physics'],
    rating: 5.0,
    reviews: 98,
    students: 240,
    experience: 6,
    location: 'Bhubaneswar',
    bio: 'Dedicated senior educator passionate about simplifying mathematics and general sciences for school and competitive board exam preparations.'
  }
];


const TutorsPage = () => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const allTutors = FEATURED_TUTORS;


  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-28">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 animate-pulse">
              Expert Tutors
            </span>
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Learn from Bhubaneswar&apos;s most qualified, verified, and passionate educators.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-400/20"
          >
            Register as a Tutor
          </motion.button>
        </div>

        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {allTutors.map((tutor, idx) => (
              <motion.div
                key={tutor.id || `tutor-${idx}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-white rounded-2xl shadow-md border border-gray-100/80 overflow-hidden hover:shadow-2xl hover:border-blue-100 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Header Banner */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-50/50 to-teal-50/50 flex items-center justify-center border-b border-gray-100/50">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent" />
                    <div className="relative">
                      <Image
                        src={tutor.image}
                        alt={tutor.name}
                        width={128}
                        height={128}
                        className="rounded-full border-4 border-white shadow-xl object-cover h-[128px] w-[128px] hover:scale-105 transition-transform duration-300"
                        priority={idx < 3}
                      />
                      {/* Rating Badge Overlay */}
                      <div className="absolute -bottom-1 right-2 bg-yellow-400 text-gray-900 font-bold px-2 py-0.5 rounded-full text-xs flex items-center gap-1 shadow-md">
                        <FaStar className="w-3 h-3 fill-gray-900" />
                        <span>{tutor.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tutor Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{tutor.name}</h3>
                    
                    {/* Qualification Display (Requested highlight) */}
                    {tutor.qualification && (
                      <div className="flex items-center gap-2 text-teal-600 font-semibold text-sm mb-4">
                        <FaGraduationCap className="text-teal-500 text-base flex-shrink-0" />
                        <span className="line-clamp-1">{tutor.qualification}</span>
                      </div>
                    )}

                    <p className="text-gray-600 mb-5 text-sm leading-relaxed min-h-[40px] line-clamp-2">
                      {tutor.bio}
                    </p>

                    <div className="flex items-center gap-2 text-gray-500 mb-4 text-xs font-medium">
                      <FaMapMarkerAlt className="text-blue-500 flex-shrink-0" />
                      <span>{tutor.location} • {tutor.experience}+ Years Exp</span>
                    </div>

                    {/* Subject Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {tutor.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="px-2.5 py-0.5 bg-blue-50/70 text-blue-600 rounded-lg text-xs font-semibold border border-blue-100/50"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="p-6 pt-0 mt-auto border-t border-gray-50/50 bg-gray-50/30">
                  <div className="grid grid-cols-2 gap-4 mb-4 mt-4">
                    <div className="text-center p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <div className="text-sm font-bold text-gray-900">{tutor.reviews}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">Reviews</div>
                    </div>
                    <div className="text-center p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <div className="text-sm font-bold text-gray-900">{tutor.students}+</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">Students</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                    >
                      <IoMail className="w-4 h-4" />
                      Contact
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 px-4 py-2.5 border border-blue-600/30 text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-50/50 transition-all duration-300"
                    >
                      View Profile
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>

      <RegisterTutorModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
};

export default TutorsPage;
