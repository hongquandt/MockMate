import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const PRIMARY_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";

// Fallback model chain: if primary model quota is exhausted, try the next one
const FALLBACK_MODELS = [
  PRIMARY_MODEL,
  "gemini-1.5-flash",
  "gemini-2.0-flash-lite",
];

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Helper: call Gemini with automatic retry + fallback models.
 * - On 429 (rate limit): waits and retries up to MAX_RETRIES times.
 * - If all retries fail for a model: tries the next fallback model.
 * - Extracts retry delay from error message when available.
 */
const MAX_RETRIES = 3;

async function callWithRetryAndFallback(prompt) {
  for (const modelName of FALLBACK_MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[AI] Trying model: ${modelName} (attempt ${attempt}/${MAX_RETRIES})`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown code fences if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
      } catch (error) {
        const is429 = error?.message?.includes("429") || error?.status === 429;
        const isQuotaZero = error?.message?.includes("limit: 0");

        if (isQuotaZero) {
          // Model's free tier is completely disabled (limit: 0), skip to next model immediately
          console.warn(`[AI] Model "${modelName}" free tier is disabled (limit: 0). Trying next model...`);
          break; // break retry loop, go to next model
        }

        if (is429 && attempt < MAX_RETRIES) {
          // Extract retry delay from error message, default to exponential backoff
          const retryMatch = error.message?.match(/retry in (\d+(\.\d+)?)/i);
          const waitSeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : (attempt * 15);
          console.warn(`[AI] Rate limited on "${modelName}". Waiting ${waitSeconds}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
          continue;
        }

        // Last attempt for this model failed
        if (attempt === MAX_RETRIES) {
          console.warn(`[AI] All ${MAX_RETRIES} retries exhausted for model "${modelName}". Trying next model...`);
          break; // try next model
        }

        // Non-429 error, throw immediately
        throw error;
      }
    }
  }

  // All models exhausted
  throw new Error(
    "Tất cả các model AI đều đang bị giới hạn. Vui lòng đợi vài phút rồi thử lại, " +
    "hoặc kiểm tra API Key tại https://aistudio.google.com/apikey"
  );
}

export const aiService = {
  analyzeCv: async (cvText) => {
    const prompt = `
        ROLE: You are a professional Technical Recruiter. Your goal is to provide an objective, balanced evaluation of the candidate's CV, validating their readiness for the industry while being fair.

        CANDIDATE CV CONTENT:
        """
        ${cvText}
        """

        SCORING RUBRIC (Professional & Objective):
        1. Impact & Results (Weight: 30%): Look for tangible results. If metrics are missing, look for clear ownership and successful delivery of features/tasks.
           - High score: Quantifiable impact or complex problem solving.
           - Medium score: Clear responsibilities and successful completion of tasks.
           - Low score: Vague descriptions without clear outcomes.
        2. Technical Proficiency (Weight: 30%): Assess the depth and relevance of skills mentioned.
        3. Experience Quality (Weight: 20%): Logical progression and relevant projects.
        4. Structure & Clarity (Weight: 20%): Professional formatting and clarity.

        TASK:
        Analyze the CV and provide a structured JSON output.
        
        IMPORTANT: 
        - Be objective. Do not be overly harsh, but do not give high scores for free.
        - A solid, employable CV should typically score between 70-80. Outstanding ones can go higher (85+).
        - Highlight specific gaps that, if fixed, would genuinely improve their employability.
        - Generate 3-5 relevant technical interview questions based on the skills and gaps.

        OUTPUT JSON FORMAT:
        {
            "matchScore": number (0-100),
            "skills": ["skill1", "skill2"],
            "strengths": ["Strong point 1", "Strong point 2"],
            "weaknesses": ["Improvement area 1", "Improvement area 2"],
            "summary": "Professional summary of the candidate's level.",
            "interviewQuestions": [
                "Question 1",
                "Question 2",
                "Question 3"
            ]
        }
        
        Return ONLY valid JSON.
      `;

    return await callWithRetryAndFallback(prompt);
  },

  generateInterviewQuestions: async (cvText) => {
    try {
      const prompt = `
        ROLE: You are a Technical Interviewer.
        CONTEXT: The candidate has provided their CV.
        
        CV CONTENT:
        """
        ${cvText}
        """
        
        TASK:
        Generate 5 deeper technical interview questions specifically focusing on the "Education" (what they learned) and "Skills" (what they claim to know) sections of the CV.
        Verify if they truly understand the concepts they listed.
        
        OUTPUT JSON FORMAT:
        [
            "Question 1",
            "Question 2",
            "Question 3",
            "Question 4",
            "Question 5"
        ]
        
        Return ONLY valid JSON array.
      `;

      return await callWithRetryAndFallback(prompt);
    } catch (error) {
      console.error("AI Question Generation Error:", error);
      return [
        "Could you describe a challenging project you worked on during your studies?",
        "What are your core technical strengths?",
        "Explain a technical concept you learned recently."
      ];
    }
  },

  generateCustomQuestions: async (cvText, setupData) => {
    try {
      const prompt = `
        ROLE: You are an Expert Technical Recruiter & Interviewer.
        CONTEXT: The candidate has provided their CV and selected specific criteria for this mock interview.
        
        CV CONTENT:
        """
        ${cvText}
        """

        INTERVIEW CRITERIA:
        - Industry: ${setupData.industry}
        - Job Description: ${setupData.jobDescription || "Not provided, focus on their CV matching the industry."}
        - Difficulty/Level: ${setupData.difficulty}
        - Interview Type: ${setupData.interviewType} (Knowledge, Behavioral, Situational, etc.)
        - Target Skills/Keywords to focus on: ${setupData.keywords?.join(", ")}
        - Language to generate questions in: ${setupData.language}
        
        TASK:
        Generate 5 specific, highly relevant interview questions tailored EXACTLY to the above criteria and the candidate's CV level.
        If the interview type is Behavioral, generate questions based on the STAR method related to their past experience.
        If it's Situational, present a hypothetical scenario relevant to the job and level.
        The wording should be entirely in: ${setupData.language}.
        
        OUTPUT JSON FORMAT:
        [
            "Question 1",
            "Question 2",
            "Question 3",
            "Question 4",
            "Question 5"
        ]
        
        Return ONLY a valid JSON array of format string[].
      `;

      return await callWithRetryAndFallback(prompt);
    } catch (error) {
      console.error("AI Custom Question Generation Error:", error);
      // Fallback
      return [
        "Xin bạn hãy giới thiệu ngắn gọn bản thân (Please introduce yourself).",
        "Kể về một dự án khó nhằn bạn từng tham gia trong công việc.",
        "Điểm mạnh nhất của bạn đối với vị trí này là gì?"
      ];
    }
  },

  gradeInterviewAnswers: async (qaArray) => {
    const prompt = `
        ROLE: You are an expert Technical Interviewer.
        CONTEXT: The candidate has completed a technical interview. I will provide you with the questions asked and the candidate's answers.

        Q&A PAIRS:
        """
        ${JSON.stringify(qaArray, null, 2)}
        """

        TASK:
        Grade each answer and provide overall feedback for the interview session.
        Be constructive, objective, and professional.

        OUTPUT JSON FORMAT:
        {
          "totalScore": number (0-10),
          "overallFeedback": "A summary of their performance across all questions, highlighting key strengths and areas for improvement.",
          "details": [
            {
              "questionIndex": number,
              "score": number (0-10, grade for this specific question),
              "aiFeedback": "Specific feedback for this answer, what they did well, what was missing."
            }
          ]
        }

        Return ONLY valid JSON.
      `;

    return await callWithRetryAndFallback(prompt);
  }
};
