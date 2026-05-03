'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Course {
  id: string;
  name: string;
  description: string;
  subjects: string[];
  level: string;
  board: string;
}

const baseClasses = [
  // Primary Level
  { id: 'class-1', name: 'Class 1', level: 'Primary', subjects: ['Mathematics', 'English', 'Science', 'Social Studies'] },
  { id: 'class-2', name: 'Class 2', level: 'Primary', subjects: ['Mathematics', 'English', 'Science', 'Social Studies'] },
  { id: 'class-3', name: 'Class 3', level: 'Primary', subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Computer Basics'] },
  { id: 'class-4', name: 'Class 4', level: 'Primary', subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Computer Basics'] },
  { id: 'class-5', name: 'Class 5', level: 'Primary', subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Computer Basics'] },
  // Middle Level
  { id: 'class-6', name: 'Class 6', level: 'Middle', subjects: ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Computer Science'] },
  { id: 'class-7', name: 'Class 7', level: 'Middle', subjects: ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Computer Science'] },
  { id: 'class-8', name: 'Class 8', level: 'Middle', subjects: ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Computer Science'] },
  // Secondary Level
  { id: 'class-9', name: 'Class 9', level: 'Secondary', subjects: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology / Computer Science'] },
  { id: 'class-10', name: 'Class 10', level: 'Secondary', subjects: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology / Computer Science'] }
];

const boardsList = ['ICSC', 'CBSE', 'HSC'];

const courses: Course[] = boardsList.flatMap(board =>
  baseClasses.map(cls => ({
    ...cls,
    id: `${cls.id}-${board.toLowerCase()}`,
    name: `${cls.name} (${board})`,
    board: board,
    description: `Complete ${board} curriculum preparation for ${cls.name} with expert faculty and interactive materials.`
  }))
);

const CoursesPage = () => {
  const [selectedLevel, setSelectedLevel] = React.useState<string>('all');
  const [selectedBoard, setSelectedBoard] = React.useState<string>('all');

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (selectedLevel !== 'all' && course.level !== selectedLevel) return false;
      if (selectedBoard !== 'all' && course.board !== selectedBoard) return false;
      return true;
    });
  }, [selectedLevel, selectedBoard]);

  const levels = useMemo(() => ['all', ...new Set(courses.map((course) => course.level))], []);
  const boards = useMemo(() => ['all', ...new Set(courses.map((course) => course.board))], []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6 text-black"
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
                  {level === 'all' ? 'All Courses' : level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Board</label>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {boards.map((board) => (
                <option key={board} value={board}>
                  {board === 'all' ? 'All Boards' : board}
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
      <h3 className="text-2xl font-bold mb-4 text-black">
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
