import Groq from 'groq-sdk';
import { PracticeExam } from '../models/types';
import { SYLLABUS } from '../config/syllabus';

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

    // 1. Try Groq if API key is present
    if (process.env.GROQ_API_KEY) {
      try {
        console.log('Attempting quiz generation with Groq...');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
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
        if (content) {
          const quizData = JSON.parse(content);
          if (quizData.questions && Array.isArray(quizData.questions) && quizData.questions.length > 0) {
            if (chapter) quizData.folderName = chapter;
            quizData.createdBy = quizData.createdBy || 'system';
            return quizData;
          }
        }
      } catch (groqErr) {
        console.warn('Groq Quiz Generation failed, trying Gemini fallback:', groqErr);
      }
    }

    // 2. Try Gemini REST API if API key is present
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        console.log('Attempting quiz generation with Gemini REST API...');
        const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
        for (const model of models) {
          try {
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.2,
                  },
                }),
              }
            );

            if (response.ok) {
              const geminiData = await response.json();
              const textContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textContent) {
                const quizData = JSON.parse(textContent);
                if (quizData.questions && Array.isArray(quizData.questions) && quizData.questions.length > 0) {
                  if (chapter) quizData.folderName = chapter;
                  quizData.createdBy = quizData.createdBy || 'system';
                  return quizData;
                }
              }
            }
          } catch (modelErr) {
            console.warn(`Gemini model ${model} failed:`, modelErr);
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini Quiz Generation failed:', geminiErr);
      }
    }

    // 3. Fallback Curriculum Question Generator (Guaranteed result if AI APIs fail)
    console.log('Using curriculum fallback quiz generator...');
    return this.generateFallbackQuiz(className, subject, chapter, topics);
  }

  private static generateFallbackQuiz(
    className: string,
    subject: string,
    chapter?: string,
    topics?: string[] | null
  ): Omit<PracticeExam, '_id' | 'createdAt'> {
    const todayDate = new Date().toISOString().split('T')[0];
    const targetTopics = chapter ? [chapter] : (topics && topics.length > 0 ? topics : [subject]);
    
    const sampleQuestions = targetTopics.flatMap((topicName, tIdx) => {
      return [
        {
          questionText: `Which of the following is a fundamental principle of ${topicName}?`,
          options: [
            `Core concept governing ${topicName} behavior`,
            `An unrelated secondary phenomenon`,
            `A contradictory hypothesis`,
            `An obsolete early assumption`
          ],
          correctOptionIndex: 0,
          explanation: `The fundamental principle of ${topicName} defines its primary governing mechanisms.`
        },
        {
          questionText: `In the study of ${topicName}, what happens when standard conditions are varied?`,
          options: [
            `The system exhibits a proportional response according to established laws`,
            `No observable change occurs under any conditions`,
            `The system completely destabilizes without pattern`,
            `The fundamental units double instantly`
          ],
          correctOptionIndex: 0,
          explanation: `Varying parameters in ${topicName} demonstrates predictable proportional relationships.`
        },
        {
          questionText: `What is the primary unit or application associated with ${topicName}?`,
          options: [
            `Standard metric unit used in ${subject} calculations`,
            `Non-standard arbitrary estimate`,
            `Unrelated unit from another discipline`,
            `Theoretical construct with no measurement unit`
          ],
          correctOptionIndex: 0,
          explanation: `${topicName} relies on standardized units to measure and quantify physical/academic quantities.`
        }
      ];
    });

    // Ensure at least 10 questions are present by repeating and varying topics
    const questions: any[] = [];
    let qCount = 1;
    while (questions.length < 15) {
      for (const q of sampleQuestions) {
        if (questions.length >= 15) break;
        questions.push({
          questionText: `Q${qCount}. (${targetTopics[(qCount - 1) % targetTopics.length]}) ${q.questionText}`,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          explanation: q.explanation
        });
        qCount++;
      }
    }

    return {
      title: `Practice: ${subject}${chapter ? ` - ${chapter}` : ''}`,
      date: todayDate,
      className,
      subject,
      folderName: chapter || 'Practice Set',
      durationMinutes: 30,
      createdBy: 'system',
      questions
    };
  }
}
