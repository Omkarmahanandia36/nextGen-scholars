export interface Tutor {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  qualification: string;
  specialization: string;
  university: string;
  graduationYear: string;
  subjects: string[];
  experience: string;
  preferredLevels: string[];
  teachingMode: string[];
  bio: string;
  expectedRate: string;
  availability: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}
