'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaGraduationCap, FaMapMarkerAlt } from 'react-icons/fa';
import { IoMail } from 'react-icons/io5';
import Image from 'next/image';
import RegisterTutorModal from '@/components/modals/RegisterTutorModal';

interface Tutor {
  id: number;
  name: string;
  image: string;
  subjects: string[];
  rating: number;
  reviews: number;
  students: number;
  experience: number;
  location: string;
  bio: string;
}

const tutors: Tutor[] = [];

const TutorsPage = () => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const filteredTutors = tutors;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-28">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
              Expert Tutors
            </span>
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Learn from Bhubaneswara&apos;s most qualified and experienced educators
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Register as a Tutor
          </motion.button>
        </div>


        {/* Tutors Grid */}
        {filteredTutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredTutors.map((tutor) => (
              <motion.div
                key={tutor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-48 bg-gradient-to-r from-blue-100 to-teal-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src={tutor.image}
                      alt={tutor.name}
                      width={128}
                      height={128}
                      className="rounded-full border-4 border-white shadow-lg"
                      priority
                    />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{tutor.name}</h3>
                  <p className="text-gray-600 mb-4">{tutor.bio}</p>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <FaMapMarkerAlt className="text-blue-600" />
                    <span className="text-sm">{tutor.location}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {tutor.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-blue-600 font-bold">
                        <FaStar className="text-yellow-400" />
                        {tutor.rating}
                      </div>
                      <div className="text-sm text-gray-600">{tutor.reviews} Reviews</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-blue-600 font-bold">
                        <FaGraduationCap />
                        {tutor.students}+
                      </div>
                      <div className="text-sm text-gray-600">Students</div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                    >
                      <IoMail className="w-4 h-4" />
                      Contact
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-all duration-300"
                    >
                      View Profile
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No tutors available yet</h3>
            <p className="text-gray-500">We are currently onboarding expert tutors. Please check back later.</p>
          </div>
        )}
      </div>

      <RegisterTutorModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
};

export default TutorsPage;
