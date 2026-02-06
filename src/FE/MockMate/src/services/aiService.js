import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash";

const genAI = new GoogleGenerativeAI(API_KEY);

export const aiService = {
  analyzeCv: async (cvText) => {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const prompt = `
        ROLE: You are a strict Senior Technical Recruiter at a top-tier tech company (FAANG level). Your job is to purely evaluate the quality of the CV itself, not just the candidate.

        CANDIDATE CV CONTENT:
        """
        ${cvText}
        """

        SCORING RUBRIC (Strict Guidelines):
        1. Impact & Metrics (Weight: 30%): Does the candidate quantify their achievements? (e.g., "Improved latency by 20%" vs "Fixed bugs").
           - High score: Specific numbers, clear business impact.
           - Low score: Generic descriptions like "Worked on...", "Helped with...".
        2. Technical Depth & Relevance (Weight: 30%): Are the skills modern and relevant to the implied role?
        3. Experience Quality (Weight: 20%): clear progression, ownership of tasks.
        4. Structure & Clarity (Weight: 20%): logical layout, no typos, professional tone.

        TASK:
        Analyze the CV and provide a structured JSON output.
        
        IMPORTANT: 
        - Be critical. Do not give high scores (90+) easily. A standard "good" CV is usually 70-75.
        - Identify the likely "Target Role" based on the content (e.g., Senior Backend Engineer).
        - Generate 3-5 sharp technical interview questions based on the candidate's WEAKNESSES or highlighted SKILLS.

        OUTPUT JSON FORMAT:
        {
            "matchScore": number (0-100),
            "skills": ["skill1", "skill2"],
            "strengths": ["point 1", "point 2"],
            "weaknesses": ["critique 1", "critique 2"],
            "summary": "Brief professional summary of the candidate's level.",
            "interviewQuestions": [
                "Question 1 (e.g. You mentioned X, but how do you handle scaling...?)",
                "Question 2",
                "Question 3"
            ]
        }
        
        Return ONLY valid JSON.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up markdown if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(text);
    } catch (error) {
      console.error("AI Analysis Error:", error);
      throw error;
    }
  }
};
