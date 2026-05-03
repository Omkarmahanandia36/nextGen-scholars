'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaChalkboardTeacher, FaUsers, FaBookReader } from 'react-icons/fa';


const AboutPage = () => {
  const stats = [
    { icon: FaGraduationCap, count: '50+', label: 'Students Enrolled' },
    { icon: FaChalkboardTeacher, count: '3+', label: 'Expert Tutors' },
    { icon: FaUsers, count: '95%', label: 'Success Rate' },
    { icon: FaBookReader, count: '20+', label: 'Subjects Offered' },
  ];

  const values = [
    {
      title: 'Excellence',
      description: 'We strive for academic excellence in every aspect of our educational services.',
    },
    {
      title: 'Innovation',
      description: 'Embracing modern teaching methods and technology to enhance learning experiences.',
    },
    {
      title: 'Personalization',
      description: 'Tailoring our approach to meet each student&apos;s unique learning needs and goals.',
    },
    {
      title: 'Integrity',
      description: 'Maintaining the highest standards of professional ethics and accountability.',
    },
  ];

  const testimonials = [
    {
      quote: "NextGen Scholar transformed my child's learning experience. The personalized attention and expert guidance helped them achieve their academic goals.",
      author: "Priyanka Dash",
      role: "Parent"
    },
    {
      quote: "Enrolling my daughter at NextGen Scholar has been incredibly rewarding. The platform's commitment to quality education is exactly what we were looking for.",
      author: "Dr. Rajesh Mohapatra",
      role: "Parent"
    },
    {
      quote: "The quality of education and support my son receives here is exceptional. It's been a game-changer for his academic progress and confidence.",
      author: "Sasmita Nayak",
      role: "Parent"
    }
  ];

  const achievements = [
    {
      year: 'March 2026',
      title: 'Company Founded',
      description: 'Successfully launched NextGen Scholar with a vision to transform education in Bhubaneswara.'
    },
    {
      year: 'April 2026',
      title: '30 Students Enrolled',
      description: 'Reached our first milestone of enrolling 30 students within a month of launch.'
    }
  ];

  const team = [
    {
      name: 'Soval Sarangi',
      role: 'Founder',
      education: 'Bsc (Math) ,MBA in HR and finnance',
      description: 'Leading our academic excellence initiatives with 3+ years of experience in education management.'
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
                Transforming Education in Bhubaneswara
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Since 2026, NextGen Scholar has been at the forefront of educational innovation, 
              combining traditional values with modern teaching methods to create an unparalleled 
              learning experience.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="inline-block p-4 bg-blue-50 rounded-2xl mb-4 group-hover:bg-blue-100 transition-colors duration-300">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.count}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-black text-center mb-12">Our Journey</h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-blue-200"></div>
            
            {/* Timeline Items */}
            <div className="space-y-12">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="text-sm font-semibold text-blue-600 mb-2">{achievement.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{achievement.title}</h3>
                      <p className="text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-black text-center mb-12">Meet Our Leadership</h2>
          <div className="grid grid-cols-1 max-w-md mx-auto gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 group text-center"
              >
                <div className="relative w-full h-64 mb-6 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <span className="text-gray-400 font-medium">Photo Space</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-500 mb-4">{member.education}</p>
                <p className="text-gray-600">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-black text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-black text-center mb-12">What People Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">{testimonial.author}</h3>
                  <p className="text-gray-600">{testimonial.role}</p>
                </div>
                <p className="text-gray-600 italic">&quot;{testimonial.quote}&quot;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
