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
  },

  generateCustomQuestions: async (cvText, setupData) => {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
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
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error("AI Grading Error:", error);
      throw error;
    }
  }
};
