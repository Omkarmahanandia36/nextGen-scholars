import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const numMcq = parseInt(formData.get("num_mcq") as string || "0", 10);
    const num1Mark = parseInt(formData.get("num_1_mark") as string || "0", 10);
    const num2Mark = parseInt(formData.get("num_2_mark") as string || "0", 10);
    const num5Mark = parseInt(formData.get("num_5_mark") as string || "0", 10);

    if (!file) {
      return NextResponse.json({ detail: "No PDF file provided." }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ detail: "Invalid file type. Only PDF documents are supported." }, { status: 400 });
    }

    let totalQuestions = numMcq + num1Mark + num2Mark + num5Mark;
    if (totalQuestions === 0) {
      totalQuestions = 5;
    }

    if (totalQuestions < 1 || totalQuestions > 50) {
      return NextResponse.json({ detail: "Total requested questions must be between 1 and 50." }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (!geminiKey) {
      return NextResponse.json({ detail: "GEMINI_API_KEY environment variable is missing on server." }, { status: 500 });
    }

    // Convert file to Uint8Array for HTTP upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);

    // ==========================================
    // STAGE 1: EXTRACTION (Google Gemini)
    // ==========================================
    console.log("Stage 1: Uploading PDF to Gemini Files API...");
    
    const startResponse = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${geminiKey}`, {
      method: "POST",
      headers: {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": fileBytes.length.toString(),
        "X-Goog-Upload-Header-Content-Type": "application/pdf",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file: { display_name: file.name || "uploaded_doc.pdf" } }),
    });

    if (!startResponse.ok) {
      throw new Error(`Failed to start upload: ${await startResponse.text()}`);
    }

    const uploadUrl = startResponse.headers.get("x-goog-upload-url");
    if (!uploadUrl) {
      throw new Error("No upload URL returned from Google Files API");
    }

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "X-Goog-Upload-Offset": "0",
        "X-Goog-Upload-Command": "finalize",
        "Content-Length": fileBytes.length.toString(),
      },
      body: fileBytes,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file bytes: ${await uploadResponse.text()}`);
    }

    const fileMetadata = await uploadResponse.json();
    const fileNameId = fileMetadata.file.name;
    const fileUri = fileMetadata.file.uri;

    console.log(`Uploaded successfully. File name ID: ${fileNameId}`);

    // Poll status
    let fileState = "PROCESSING";
    let retryCount = 0;
    while (fileState === "PROCESSING" && retryCount < 15) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const stateResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileNameId}?key=${geminiKey}`);
      if (stateResponse.ok) {
        const stateData = await stateResponse.json();
        fileState = stateData.state;
        if (fileState === "FAILED") {
          throw new Error(`File processing failed on Google Files API: ${stateData.error?.message || "Unknown error"}`);
        }
      }
      retryCount++;
    }

    let stage1JsonStr = "";
    try {
      const requirements: string[] = [];
      if (numMcq > 0) requirements.push(`- ${numMcq} Multiple Choice Questions (MCQ)`);
      if (num1Mark > 0) requirements.push(`- ${num1Mark} 1-Mark Questions (concise short answer)`);
      if (num2Mark > 0) requirements.push(`- ${num2Mark} 2-Mark Questions (medium explanation)`);
      if (num5Mark > 0) requirements.push(`- ${num5Mark} 5-Mark Questions (detailed long answer)`);
      
      const requirementsStr = requirements.length > 0 ? requirements.join("\n") : `- 5 Multiple Choice Questions (MCQ)`;

      const promptStage1 = `You are an expert academic examiner. Read the attached document and generate a quiz with exactly the following marking scheme:
${requirementsStr}

Total questions to generate: ${totalQuestions}

You must return the output in a strict, raw JSON array format with no markdown code blocks, no backticks, and no extra text.
Each question object in the JSON array must contain exactly these fields:
- "question_type": string, must be one of: "MCQ", "1_mark", "2_mark", or "5_mark".
- "question": string, the question text.
- "options": object with keys "A", "B", "C", and "D" mapping to their option strings. For "1_mark", "2_mark", and "5_mark" questions, set "options" to null or omit it.
- "correct_answer": string. For "MCQ", it must be "A", "B", "C", or "D". For "1_mark", "2_mark", and "5_mark" questions, it must be the suggested answer or model answer.
- "explanations": object with keys "A", "B", "C", and "D" mapping to explanations. For "1_mark", "2_mark", and "5_mark" questions, set "explanations" to null or omit it.
- "explanation": string. For "MCQ" questions, set to null or omit it. For "1_mark", "2_mark", and "5_mark" questions, provide a clear explanation, marking key points, or assessment rubric.

Format the output strictly as a JSON array like this:
[
  {
    "question_type": "MCQ",
    "question": "What is the primary topic of the document?",
    "options": {
      "A": "First Choice",
      "B": "Second Choice",
      "C": "Third Choice",
      "D": "Fourth Choice"
    },
    "correct_answer": "A"
  }
]
`;

      const generateResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  file_data: {
                    file_uri: fileUri,
                    mime_type: "application/pdf"
                  }
                },
                {
                  text: promptStage1
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        }),
      });

      if (!generateResponse.ok) {
        throw new Error(`Gemini generation failed: ${await generateResponse.text()}`);
      }

      const generateData = await generateResponse.json();
      stage1JsonStr = generateData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } finally {
      // Clean up the file asset immediately from Google Files API
      try {
        await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileNameId}?key=${geminiKey}`, {
          method: "DELETE",
        });
        console.log("Google Files API cleanup successful.");
      } catch (cleanupErr) {
        console.error("Failed to delete Google Files API asset:", cleanupErr);
      }
    }

    if (!stage1JsonStr || !stage1JsonStr.trim()) {
      throw new Error("Stage 1 returned an empty response.");
    }

    // ==========================================
    // STAGE 2: ELABORATION (Groq with Gemini fallback)
    // ==========================================
    console.log("Stage 2: Elaboration...");
    
    const promptStage2 = `You are an educational assistant. You will receive a JSON array containing questions.
Your task is to iterate over every question object in the array and enrich it with explanations:
1. For any object where "question_type" is "MCQ", append or fill the "explanations" field. The "explanations" field must be a nested object containing exactly four keys: "A", "B", "C", and "D", each mapping to a detailed 1-to-2 sentence explanation of why that specific option is correct or incorrect.
2. For any object where "question_type" is "1_mark", "2_mark", or "5_mark", append or fill the "explanation" field (string) with a detailed explanation of the answer, including the key points that are required to score full marks.
3. You MUST preserve all other original fields ("question_type", "question", "options", and "correct_answer") exactly as they are.
Return ONLY the final JSON array. Do not wrap it in markdown code blocks, do not include triple backticks, and do not add any surrounding conversational text.

Input JSON:
${stage1JsonStr}
`;

    let stage2JsonStr = "";

    if (groqKey) {
      try {
        const groq = new Groq({ apiKey: groqKey });
        const groqResponse = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "You are a precise JSON formatting assistant that outputs raw JSON arrays and preserves input fields." },
            { role: "user", content: promptStage2 }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.2
        });
        stage2JsonStr = groqResponse.choices[0]?.message?.content || "";
      } catch (err) {
        console.warn("Groq elaboration failed:", err);
      }
    }

    if (!stage2JsonStr) {
      try {
        const fallbackResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: promptStage2
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2
            }
          }),
        });
        
        if (fallbackResponse.ok) {
          const fbData = await fallbackResponse.json();
          stage2JsonStr = fbData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      } catch (err) {
        console.error("Gemini elaboration fallback failed:", err);
      }
    }

    if (!stage2JsonStr || !stage2JsonStr.trim()) {
      throw new Error("Stage 2 returned an empty response.");
    }

    // ==========================================
    // STAGE 3: VALIDATION (OpenRouter with fallbacks)
    // ==========================================
    console.log("Stage 3: Validation...");
    
    const promptStage3 = `You are a strict JSON validation agent. Your job is to format, validate, and clean the provided JSON text to ensure it conforms exactly to the required schema.
Instructions:
1. Validate that the input is a valid JSON array of question objects.
2. Repair any missing fields, trailing commas, or syntax errors.
3. Ensure each question object contains exactly the fields: "question_type", "question", "correct_answer".
4. If "question_type" is "MCQ", it must contain "options" (keys A, B, C, D) and "explanations" (keys A, B, C, D).
5. If "question_type" is "1_mark", "2_mark", or "5_mark", "options" and "explanations" should be null, and it must contain a string "explanation" field.
6. Remove any markdown styling, triple backticks (\`\`\`json), code blocks, language tags, or explanations outside the JSON array.
7. Return ONLY the raw, parseable JSON array. No extra sentences, no intro, no outro.

Input JSON to validate:
${stage2JsonStr}
`;

    let stage3JsonStr = "";

    if (openrouterKey) {
      try {
        const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openrouterKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/llama-3.3-70b-instruct:free",
            messages: [
              { role: "system", content: "You are a JSON formatting assistant. You output raw JSON arrays only, with zero markdown wrapper code blocks." },
              { role: "user", content: promptStage3 }
            ],
            temperature: 0.1
          })
        });
        if (orResponse.ok) {
          const orData = await orResponse.json();
          stage3JsonStr = orData.choices?.[0]?.message?.content || "";
        }
      } catch (err) {
        console.warn("OpenRouter validation failed:", err);
      }
    }

    if (!stage3JsonStr && groqKey) {
      try {
        const groq = new Groq({ apiKey: groqKey });
        const groqResponse = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "You are a JSON formatting assistant. You output raw JSON arrays only, with zero markdown wrapper code blocks." },
            { role: "user", content: promptStage3 }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.1
        });
        stage3JsonStr = groqResponse.choices[0]?.message?.content || "";
      } catch (err) {
        console.warn("Groq validation failed:", err);
      }
    }

    if (!stage3JsonStr) {
      try {
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: promptStage3
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1
            }
          }),
        });
        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          stage3JsonStr = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      } catch (err) {
        console.warn("Gemini validation fallback failed:", err);
      }
    }

    if (!stage3JsonStr) {
      stage3JsonStr = stage2JsonStr;
    }

    // Clean markdown code blocks from output
    let cleanedJson = stage3JsonStr.trim();
    if (cleanedJson.startsWith("```")) {
      const lines = cleanedJson.split("\n");
      if (lines[0].startsWith("```")) {
        lines.shift();
      }
      if (lines.length > 0 && lines[lines.length - 1].trim() === "```") {
        lines.pop();
      }
      cleanedJson = lines.join("\n").trim();
    }

    // Parse and normalize structure
    let questionsList: any[] = [];
    try {
      const data = JSON.parse(cleanedJson);
      if (Array.isArray(data)) {
        questionsList = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.questions)) {
          questionsList = data.questions;
        } else {
          const keys = Object.keys(data);
          if (keys.length > 0 && Array.isArray(data[keys[0]])) {
            questionsList = data[keys[0]];
          }
        }
      }
    } catch (e) {
      console.warn("Failed to parse stage 3 JSON, trying stage 2...");
      let s2Cleaned = stage2JsonStr.trim();
      if (s2Cleaned.startsWith("```")) {
        const lines = s2Cleaned.split("\n");
        if (lines[0].startsWith("```")) lines.shift();
        if (lines.length > 0 && lines[lines.length - 1].trim() === "```") lines.pop();
        s2Cleaned = lines.join("\n").trim();
      }
      const dataS2 = JSON.parse(s2Cleaned);
      questionsList = Array.isArray(dataS2) ? dataS2 : (dataS2.questions || []);
    }

    return NextResponse.json({ questions: questionsList });
  } catch (error: any) {
    console.error("Pipeline Error:", error);
    return NextResponse.json({ detail: error.message || "Internal server error occurred." }, { status: 500 });
  }
}
