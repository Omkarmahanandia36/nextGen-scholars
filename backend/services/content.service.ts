import { ObjectId } from 'mongodb';
import clientPromise from '../config/mongodb';
import { Material, PracticeExam, ExamResult } from '../models/types';

export class AdminContentService {
  static async addMaterial(material: Omit<Material, '_id' | 'createdAt'>) {
    const client = await clientPromise;
    const db = client.db("nextgenscholar");
    return db.collection('materials').insertOne({
      ...material,
      createdAt: new Date()
    });
  }

  static async deleteMaterial(id: string) {
    const client = await clientPromise;
    const db = client.db("nextgenscholar");
    return db.collection('materials').deleteOne({ _id: new ObjectId(id) });
  }

  static async addExam(exam: Omit<PracticeExam, '_id' | 'createdAt'>) {
    const client = await clientPromise;
    const db = client.db("nextgenscholar");
    return db.collection('practice_exams').insertOne({
      ...exam,
      createdAt: new Date()
    });
  }

  static async deleteExam(id: string) {
    const client = await clientPromise;
    const db = client.db("nextgenscholar");
    return db.collection('practice_exams').deleteOne({ _id: new ObjectId(id) });
  }

  static async getAllMaterials() {
    const client = await clientPromise;
    const db = client.db("nextgenscholar");
    return db.collection('materials').find().sort({ createdAt: -1 }).toArray();
  }

  static async getAllExams() {
    const client = await clientPromise;
    const db = client.db("nextgenscholar");
    return db.collection('practice_exams').find().sort({ createdAt: -1 }).toArray();
  }

  static async getExamResults(examId?: string) {
    const client = await clientPromise;
    const db = client.db("nextgenscholar");
    const query = examId ? { examId: new ObjectId(examId) } : {};
    return db.collection('exam_results').find(query).toArray();
  }
}

export class ExamService {
  static async submitResult(result: Omit<ExamResult, '_id' | 'completedAt'>) {
    const client = await clientPromise;
    const db = client.db("nextgenscholar");
    return db.collection('exam_results').insertOne({
      ...result,
      examId: new ObjectId(result.examId),
      studentId: new ObjectId(result.studentId),
      completedAt: new Date()
    });
  }

  static async getStudentResults(studentId: string) {
    const client = await clientPromise;
    const db = client.db("nextgenscholar");
    return db.collection('exam_results')
      .find({ studentId: new ObjectId(studentId) })
      .sort({ completedAt: -1 })
      .toArray();
  }
}
