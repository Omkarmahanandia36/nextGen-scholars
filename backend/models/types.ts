import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'admin';
  createdAt: Date;
}

export interface Tutor {
  _id?: ObjectId;
  name: string;
  email: string;
  specialization: string[];
  bio: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface StudentProfile {
  _id?: ObjectId;
  userId: ObjectId | string; 
  board?: string;
  className: string; 
  subjects: string[]; 
  tutorIds?: (ObjectId | string)[]; // Array of assigned tutors
  onboardingComplete: boolean;
  updatedAt: Date;
}

export interface Material {
  _id?: ObjectId;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'link' | 'text' | 'note';
  url: string;
  board?: string;
  className: string; 
  subject: string; 
  folderName?: string;
  createdBy: ObjectId | string; 
  createdAt: Date;
}

export interface PracticeExam {
  _id?: ObjectId;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  board?: string;
  className: string;
  subject: string;
  questions: {
    questionText: string;
    options: string[]; 
    correctOptionIndex: number;
    explanation?: string;
  }[];
  durationMinutes: number;
  folderName?: string;
  examType?: 'daily' | 'most-probable';
  createdBy: string | ObjectId;
  createdAt: Date;
}

export interface ExamResult {
  _id?: ObjectId;
  examId: ObjectId | string;
  studentId: ObjectId | string;
  score: number;
  totalQuestions: number;
  answers: {
    questionIndex: number;
    selectedOptionIndex: number;
    isCorrect: boolean;
  }[];
  completedAt: Date;
}
