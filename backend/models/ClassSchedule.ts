export interface ClassSchedule {
  studentName: string;
  email: string;
  phone: string;
  courseId: string;
  courseName: string;
  subjects: string[];
  preferredDays: string[];
  preferredTime: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}
