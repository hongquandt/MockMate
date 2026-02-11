import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash";

const genAI = new GoogleGenerativeAI(API_KEY);

export const aiService = {
  analyzeCv: async (cvText) => {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

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
  },

  generateInterviewQuestions: async (cvText) => {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error("AI Question Generation Error:", error);
      return [
        "Could you describe a challenging project you worked on during your studies?",
        "What are your core technical strengths?",
        "Explain a technical concept you learned recently."
      ];
    }
  }
};
