import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash";

const genAI = new GoogleGenerativeAI(API_KEY);

export const aiService = {
  analyzeCv: async (cvText) => {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const prompt = `
        ROLE: You are an expert technical recruiter analyzing a candidate's CV.
        
        CANDIDATE CV CONTENT:
        ${cvText}
        
        TASK: Analyze the CV and provide a structured JSON output with the following fields:
        1. matchScore (0-100): An estimated score of how well written this CV is for a general technical role.
        2. skills (array): List of technical and soft skills found.
        3. strengths (array): Top 3-5 strong points.
        4. weaknesses (array): Top 3 areas for improvement.
        5. summary (string): A brief professional summary.
        
        OUTPUT FORMAT: Return ONLY valid JSON. Do not use Markdown code blocks.
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
