import { ObjectId } from 'mongodb';
import clientPromise from '../config/mongodb';
import { StudentProfile } from '../models/types';

export class StudentService {
  private static async getCollection() {
    const client = await clientPromise;
    return client.db().collection('student_profiles');
  }

  static async getProfile(userId: string) {
    const collection = await this.getCollection();
    return collection.findOne({ userId: new ObjectId(userId) });
  }

  static async updateProfile(userId: string, profileData: { className?: string; subjects?: string[]; name?: string; board?: string }) {
    const collection = await this.getCollection();
    const client = await clientPromise;
    const db = client.db();

    const { name, ...otherData } = profileData;

    // Update user name if provided
    if (name) {
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: { name } }
      );
    }

    // Update profile data
    if (Object.keys(otherData).length > 0) {
      await collection.updateOne(
        { userId: new ObjectId(userId) },
        { 
          $set: { 
            ...otherData, 
            updatedAt: new Date() 
          } 
        },
        { upsert: true }
      );
    }

    return { success: true };
  }

  static async completeOnboarding(userId: string, profileData: { className: string; board: string; subjects: string[] }) {
    const collection = await this.getCollection();
    
    const result = await collection.updateOne(
      { userId: new ObjectId(userId) },
      { 
        $set: { 
          ...profileData, 
          onboardingComplete: true,
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );

    return result;
  }

  static async getMaterials(className: string, board?: string, subject?: string) {
    const client = await clientPromise;
    const db = client.db();
    const query: { className: string; board?: string; subject?: string } = { className };
    if (board) query.board = board;
    if (subject) query.subject = subject;
    
    return db.collection('materials').find(query).sort({ createdAt: -1 }).toArray();
  }

  static async getDailyExams(className: string, board?: string, subject?: string) {
    const client = await clientPromise;
    const db = client.db();
    const today = new Date().toISOString().split('T')[0];
    
    const query: any = { className, date: today };
    if (board) query.board = board;
    if (subject) query.subject = subject;
    // By default, daily exams are type 'daily' or undefined
    query.examType = { $ne: 'most-probable' };
    
    return db.collection('practice_exams').find(query).toArray();
  }

  static async getExams(filters: { className: string; board?: string; subject?: string; folderName?: string; examType?: string }) {
    const client = await clientPromise;
    const db = client.db();
    const query: any = { className: filters.className };
    
    if (filters.board) query.board = filters.board;
    if (filters.subject) query.subject = filters.subject;
    if (filters.folderName) query.folderName = filters.folderName;
    if (filters.examType) query.examType = filters.examType;
    
    return db.collection('practice_exams').find(query).sort({ createdAt: -1 }).toArray();
  }

  static async getAssignedTutors(userId: string) {
    const client = await clientPromise;
    const db = client.db();
    
    const profile = await this.getProfile(userId);
    if (!profile || !profile.tutorIds || profile.tutorIds.length === 0) {
      return [];
    }

    const tutorObjectIds = profile.tutorIds.map((id: string) => new ObjectId(id));
    return db.collection('tutors').find({ _id: { $in: tutorObjectIds } }).toArray();
  }
}
