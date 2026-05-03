import clientPromise from '../config/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, StudentProfile } from '../models/types';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';

interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  onboardingComplete: boolean;
  iat?: number;
  exp?: number;
}

export class AuthService {
  async signup(name: string, email: string, password: string) {
    if (!name || !email || !password) {
      throw new Error('Please provide all required fields');
    }

    const client = await clientPromise;
    const db = client.db();

    const existingUser = await db.collection<User>('users').findOne({ email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user: User = {
      name,
      email,
      passwordHash,
      role: 'student',
      createdAt: new Date(),
    };

    const userResult = await db.collection('users').insertOne(user);

    const profile: StudentProfile = {
      userId: userResult.insertedId,
      className: '',
      subjects: [],
      onboardingComplete: false,
      updatedAt: new Date(),
    };

    await db.collection('student_profiles').insertOne(profile);

    return { success: true, message: 'Account created successfully' };
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new Error('Please provide email and password');
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection<User>('users').findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const profile = await db.collection<StudentProfile>('student_profiles').findOne({ userId: user._id });

    const payload: TokenPayload = { 
      userId: user._id!.toString(), 
      email: user.email, 
      name: user.name,
      role: user.role,
      onboardingComplete: profile?.onboardingComplete || false 
    };

    const token = this.generateToken(payload);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        onboardingComplete: profile?.onboardingComplete || false
      }
    };
  }

  generateToken(payload: TokenPayload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  async verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();
