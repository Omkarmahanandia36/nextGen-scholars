import Groq from 'groq-sdk';
import { PracticeExam } from '../models/types';
import { SYLLABUS } from '../config/syllabus';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export class AIService {
  static async generateQuiz(className: string, subject: string, chapter?: string): Promise<Omit<PracticeExam, '_id' | 'createdAt'>> {
    const todayDate = new Date().toISOString().split('T')[0];
    const sessionSeed = Math.random().toString(36).substring(2, 10);
    
    // Fetch syllabus topics if available
    const classSyllabus = SYLLABUS[className] || SYLLABUS[className.replace('Class ', 'Grade ')];
    let topics = classSyllabus ? classSyllabus[subject] : null;
    if (classSyllabus && !topics) {
      if (['Physics', 'Chemistry', 'Biology'].includes(subject) && classSyllabus['Science']) {
        topics = classSyllabus['Science'];
      } else if (subject === 'Social Studies' && classSyllabus['Social Science']) {
        topics = classSyllabus['Social Science'];
      } else if (subject === 'Social Studies' && classSyllabus['Environmental Studies']) {
        topics = classSyllabus['Environmental Studies'];
      }
    }
    
    let syllabusContext = topics 
      ? `SYLLABUS TOPICS: ${topics.join(', ')}. ONLY generate questions from these topics.`
      : `SYLLABUS: Ensure questions are strictly appropriate for the ${className} level in ${subject}.`;

    if (chapter) {
      syllabusContext = `FOCUS CHAPTER: ${chapter}. ONLY generate questions from the chapter "${chapter}" for ${subject} at the ${className} level.`;
    }

    const prompt = `Generate a rigorous practice exam for students of ${className} on the subject: ${subject}${chapter ? ` (Chapter: ${chapter})` : ''}.
    
    ${syllabusContext}

    CRITICAL INSTRUCTIONS:
    1. STRICT SYLLABUS ADHERENCE: Questions MUST be strictly based on the ${className} curriculum for ${subject}. Do not include topics from higher or lower grades.
    2. EXACT QUANTITY: You MUST generate exactly 30 high-quality multiple choice questions. No more, no less.
    3. DURATION: Set the "durationMinutes" to 30.
    4. VARIETY & DIFFICULTY: Ensure a balanced mix of Easy (10), Medium (10), and Hard (10) questions covering as many topics from the syllabus as possible.
    5. REQUEST UNIQUENESS: This specific request has a session seed of ${sessionSeed}. Every time this is called, you MUST prioritize different concepts, scenarios, and question styles. Avoid repeating common textbook examples. Focus on conceptual depth.
    6. FORMAT: Each question must have 4 options, a correctOptionIndex (0-3), and a clear, educational explanation.

    The response must be a valid JSON object strictly following this structure:
    {
      "title": "Daily Practice: ${subject} - ${todayDate}",
      "date": "${todayDate}",
      "className": "${className}",
      "subject": "${subject}",
      "durationMinutes": 30,
      "questions": [
        {
          "questionText": "A conceptual or calculation-based question...",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctOptionIndex": 1,
          "explanation": "A step-by-step explanation of why Option 2 is correct."
        }
      ]
    }
    Return ONLY the JSON object. Do not include any conversational text.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a highly precise educational assessment engine that generates curriculum-aligned practice exams in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from AI');
      }

      const quizData = JSON.parse(content);
      
      // Inject chapter as folderName if provided
      if (chapter) {
        quizData.folderName = chapter;
      }
      
      // Basic validation to ensure we got questions
      if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
        throw new Error('Invalid quiz data generated: No questions found');
      }

      return quizData;
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw new Error(`Failed to generate quiz via AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
