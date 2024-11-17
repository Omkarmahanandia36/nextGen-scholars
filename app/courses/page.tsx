'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Course {
  id: string;
  name: string;
  description: string;
  subjects: string[];
  level: string;
  category: string;
}

const courses: Course[] = [
  // Secondary Level - Science
  {
    id: '9th-science',
    name: '9th Class Science',
    description: 'Comprehensive coverage of 9th grade science subjects with expert teachers and interactive learning materials.',
    subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science'],
    level: 'Secondary',
    category: 'Science',
  },
  {
    id: '10th-science',
    name: '10th Class Science',
    description: 'Complete preparation for Matriculation science subjects with focus on board examination patterns.',
    subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science'],
    level: 'Secondary',
    category: 'Science',
  },
  
  // Secondary Level - Arts
  {
    id: '9th-arts',
    name: '9th Class Arts',
    description: 'Well-structured arts program covering humanities and social sciences for 9th grade students.',
    subjects: ['English', 'Urdu', 'Islamic Studies', 'Pakistan Studies', 'General Mathematics'],
    level: 'Secondary',
    category: 'Arts',
  },
  {
    id: '10th-arts',
    name: '10th Class Arts',
    description: 'Comprehensive arts curriculum preparing students for Matriculation examinations.',
    subjects: ['English', 'Urdu', 'Islamic Studies', 'Pakistan Studies', 'General Mathematics'],
    level: 'Secondary',
    category: 'Arts',
  },
  
  // Intermediate Level - Pre-Medical
  {
    id: '1st-year-medical',
    name: '1st Year Pre-Medical',
    description: 'Intensive program covering first-year FSc Pre-Medical subjects with experienced faculty.',
    subjects: ['Biology', 'Physics', 'Chemistry', 'English', 'Urdu', 'Islamic Studies'],
    level: 'Intermediate',
    category: 'Pre-Medical',
  },
  {
    id: '2nd-year-medical',
    name: '2nd Year Pre-Medical',
    description: 'Advanced Pre-Medical program preparing students for medical college entrance tests.',
    subjects: ['Biology', 'Physics', 'Chemistry', 'English', 'Urdu', 'Pakistan Studies'],
    level: 'Intermediate',
    category: 'Pre-Medical',
  },
  
  // Intermediate Level - Pre-Engineering
  {
    id: '1st-year-engineering',
    name: '1st Year Pre-Engineering',
    description: 'Comprehensive FSc Pre-Engineering program with focus on mathematical and physical sciences.',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Urdu', 'Islamic Studies'],
    level: 'Intermediate',
    category: 'Pre-Engineering',
  },
  {
    id: '2nd-year-engineering',
    name: '2nd Year Pre-Engineering',
    description: 'Advanced engineering preparation with emphasis on entrance test topics.',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Urdu', 'Pakistan Studies'],
    level: 'Intermediate',
    category: 'Pre-Engineering',
  },
  
  // Intermediate Level - ICS
  {
    id: '1st-year-ics',
    name: '1st Year ICS',
    description: 'Specialized program in computer science and mathematics for first-year students.',
    subjects: ['Computer Science', 'Mathematics', 'Physics', 'English', 'Urdu', 'Islamic Studies'],
    level: 'Intermediate',
    category: 'ICS',
  },
  {
    id: '2nd-year-ics',
    name: '2nd Year ICS',
    description: 'Advanced computer science curriculum with practical programming projects.',
    subjects: ['Computer Science', 'Mathematics', 'Physics', 'English', 'Urdu', 'Pakistan Studies'],
    level: 'Intermediate',
    category: 'ICS',
  },
  
  // Intermediate Level - Arts
  {
    id: '1st-year-arts',
    name: '1st Year Arts',
    description: 'Comprehensive FA program covering humanities and social sciences.',
    subjects: ['Economics', 'Civics', 'Psychology', 'English', 'Urdu', 'Islamic Studies'],
    level: 'Intermediate',
    category: 'Arts',
  },
  {
    id: '2nd-year-arts',
    name: '2nd Year Arts',
    description: 'Advanced arts curriculum with focus on critical thinking and analysis.',
    subjects: ['Economics', 'Civics', 'Psychology', 'English', 'Urdu', 'Pakistan Studies'],
    level: 'Intermediate',
    category: 'Arts',
  },
  
  // Federal Board Secondary Level - Science
  {
    id: 'fbise-9th-science',
    name: 'Federal Board 9th Science',
    description: 'Complete preparation for Federal Board 9th grade science subjects with experienced faculty.',
    subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'English', 'Urdu', 'Islamic Studies'],
    level: 'Secondary',
    category: 'Federal Board Science',
  },
  {
    id: 'fbise-10th-science',
    name: 'Federal Board 10th Science',
    description: 'Comprehensive preparation for Federal Board Matric science subjects with focus on board examination patterns.',
    subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'English', 'Urdu', 'Pakistan Studies'],
    level: 'Secondary',
    category: 'Federal Board Science',
  },

  // Federal Board Intermediate Level - Pre-Medical
  {
    id: 'fbise-1st-year-medical',
    name: 'Federal Board FSc Pre-Medical Part I',
    description: 'Intensive program for Federal Board FSc Pre-Medical first year with board exam preparation.',
    subjects: ['Biology', 'Physics', 'Chemistry', 'English', 'Urdu', 'Islamic Studies', 'Pakistan Studies'],
    level: 'Intermediate',
    category: 'Federal Board Pre-Medical',
  },
  {
    id: 'fbise-2nd-year-medical',
    name: 'Federal Board FSc Pre-Medical Part II',
    description: 'Advanced Pre-Medical program with MDCAT preparation and board exam focus.',
    subjects: ['Biology', 'Physics', 'Chemistry', 'English', 'Urdu', 'Pakistan Studies'],
    level: 'Intermediate',
    category: 'Federal Board Pre-Medical',
  },

  // Federal Board Intermediate Level - Pre-Engineering
  {
    id: 'fbise-1st-year-engineering',
    name: 'Federal Board FSc Pre-Engineering Part I',
    description: 'Comprehensive Federal Board engineering program with ECAT preparation.',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Urdu', 'Islamic Studies'],
    level: 'Intermediate',
    category: 'Federal Board Pre-Engineering',
  },
  {
    id: 'fbise-2nd-year-engineering',
    name: 'Federal Board FSc Pre-Engineering Part II',
    description: 'Advanced engineering subjects with NET/ECAT preparation and board exam focus.',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Urdu', 'Pakistan Studies'],
    level: 'Intermediate',
    category: 'Federal Board Pre-Engineering',
  },

  // O Levels
  {
    id: 'o-level-science',
    name: 'O Level Science',
    description: 'Cambridge O Level science subjects preparation with experienced international faculty.',
    subjects: [
      'Physics', 'Chemistry', 'Biology', 'Mathematics D', 
      'Additional Mathematics', 'English Language', 'English Literature',
      'Urdu', 'Pakistan Studies', 'Islamic Studies'
    ],
    level: 'O Level',
    category: 'Cambridge Science',
  },
  {
    id: 'o-level-commerce',
    name: 'O Level Commerce',
    description: 'Comprehensive O Level commerce subjects with practical business knowledge.',
    subjects: [
      'Principles of Accounts', 'Business Studies', 'Economics',
      'Mathematics D', 'English Language', 'Urdu',
      'Pakistan Studies', 'Islamic Studies'
    ],
    level: 'O Level',
    category: 'Cambridge Commerce',
  },

  // A Levels
  {
    id: 'a-level-science',
    name: 'A Level Science',
    description: 'Advanced Cambridge A Level science subjects with university preparation.',
    subjects: [
      'Physics', 'Chemistry', 'Biology', 'Mathematics',
      'Further Mathematics', 'General Paper', 
      'Thinking Skills', 'Global Perspectives'
    ],
    level: 'A Level',
    category: 'Cambridge Science',
  },
  {
    id: 'a-level-commerce',
    name: 'A Level Commerce',
    description: 'Advanced business and economics preparation for university admission.',
    subjects: [
      'Business', 'Economics', 'Accounting',
      'Mathematics', 'General Paper',
      'Thinking Skills', 'Global Perspectives'
    ],
    level: 'A Level',
    category: 'Cambridge Commerce',
  },

  // Federal Board ICS
  {
    id: 'fbise-1st-year-ics',
    name: 'Federal Board ICS Part I',
    description: 'Specialized Federal Board computer science program with practical training.',
    subjects: ['Computer Science', 'Mathematics', 'Physics', 'English', 'Urdu', 'Islamic Studies'],
    level: 'Intermediate',
    category: 'Federal Board ICS',
  },
  {
    id: 'fbise-2nd-year-ics',
    name: 'Federal Board ICS Part II',
    description: 'Advanced computer science with programming projects and board exam preparation.',
    subjects: ['Computer Science', 'Mathematics', 'Physics', 'English', 'Urdu', 'Pakistan Studies'],
    level: 'Intermediate',
    category: 'Federal Board ICS',
  },

  // Federal Board Commerce
  {
    id: 'fbise-1st-year-commerce',
    name: 'Federal Board I.Com Part I',
    description: 'Comprehensive Federal Board commerce program with practical business knowledge.',
    subjects: ['Principles of Accounting', 'Business Mathematics', 'Economics', 'English', 'Urdu', 'Islamic Studies'],
    level: 'Intermediate',
    category: 'Federal Board Commerce',
  },
  {
    id: 'fbise-2nd-year-commerce',
    name: 'Federal Board I.Com Part II',
    description: 'Advanced commerce subjects with focus on practical business applications.',
    subjects: ['Principles of Accounting', 'Business Statistics', 'Economics', 'English', 'Urdu', 'Pakistan Studies'],
    level: 'Intermediate',
    category: 'Federal Board Commerce',
  }
];

const CoursesPage = () => {
  const [selectedLevel, setSelectedLevel] = React.useState<string>('all');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (selectedLevel !== 'all' && course.level !== selectedLevel) return false;
      if (selectedCategory !== 'all' && course.category !== selectedCategory) return false;
      return true;
    });
  }, [selectedLevel, selectedCategory]);

  const levels = useMemo(() => ['all', ...new Set(courses.map((course) => course.level))], []);
  const categories = useMemo(() => ['all', ...new Set(courses.map((course) => course.category))], []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500"
          >
            Explore Our Courses
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Discover our comprehensive range of academic programs designed to help you excel in your studies
          </motion.p>
        </div>

        {/* Filters */}
        <div className="mb-12 flex flex-wrap gap-4 justify-center">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Education Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
};

const CourseCard = React.memo(({ course }: { course: Course }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -5 }}
    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
  >
    <div className="p-8">
      <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
        {course.name}
      </h3>
      <p className="text-gray-600 mb-6">{course.description}</p>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Subjects Covered:</h4>
          <div className="flex flex-wrap gap-2">
            {course.subjects.map((subject) => (
              <span
                key={subject}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between pt-4">
          <span className="text-sm font-medium text-gray-500">{course.level}</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
            onClick={() => window.location.href = '/#schedule-class'}
          >
            Enroll Now
          </motion.button>
        </div>
      </div>
    </div>
  </motion.div>
));

CourseCard.displayName = 'CourseCard';

export default CoursesPage;
