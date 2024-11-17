'use client';

import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Interactive Learning',
    description: 'Engage in dynamic online sessions with real-time interaction and multimedia resources.',
    icon: '🖥️',
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Expert Mentorship',
    description: 'Learn from industry professionals and experienced educators who guide your journey.',
    icon: '👨‍🏫',
    color: 'from-teal-500 to-teal-600',
  },
  {
    title: 'Flexible Schedule',
    description: 'Choose your preferred time slots that perfectly fit your daily routine.',
    icon: '⏰',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed progress reports and analytics.',
    icon: '📊',
    color: 'from-blue-500 to-teal-500',
  },
  {
    title: 'Personalized Path',
    description: 'Get a customized learning plan tailored to your goals and current level.',
    icon: '🎯',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    title: '24/7 Support',
    description: 'Access learning resources and support whenever you need them.',
    icon: '💬',
    color: 'from-blue-500 to-cyan-500',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const FeaturesSection = () => {
  return (
    <div className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              EduVista Academy
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience a revolutionary approach to education with our comprehensive
            features designed to enhance your learning journey
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-teal-100 rounded-2xl transform group-hover:scale-105 transition-transform duration-300" />
              <div className="relative p-8 bg-white rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <span className="text-4xl mr-4">{feature.icon}</span>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-20"
        >
          <button onClick={() => window.location.href = '/#schedule-class'} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
            Start Learning Today
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturesSection;
