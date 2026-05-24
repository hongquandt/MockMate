import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const PRIMARY_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash";

// Fallback model chain: if primary model quota is exhausted, try the next one
const FALLBACK_MODELS = [PRIMARY_MODEL, "gemini-flash-latest", "gemini-2.0-flash-lite"];

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Helper: call Gemini with automatic retry + fallback models.
 * - On 429 (rate limit): waits and retries up to MAX_RETRIES times.
 * - If all retries fail for a model: tries the next fallback model.
 * - Extracts retry delay from error message when available.
 */
const MAX_RETRIES = 3;

async function callWithRetryAndFallback(prompt) {
  let lastErrorMsg = "";

  for (const modelName of FALLBACK_MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(
          `[AI] Trying model: ${modelName} (attempt ${attempt}/${MAX_RETRIES})`,
        );
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown code fences if present
        text = text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        return JSON.parse(text);
      } catch (error) {
        lastErrorMsg = error?.message || error?.toString();
        const is429 = lastErrorMsg.includes("429") || error?.status === 429;
        const is503 = lastErrorMsg.includes("503") || error?.status === 503;
        const isQuotaZero = lastErrorMsg.includes("limit: 0");

        if (isQuotaZero) {
          // Model's free tier is completely disabled (limit: 0), skip to next model immediately
          console.warn(
            `[AI] Model "${modelName}" free tier is disabled (limit: 0). Trying next model...`,
          );
          break; // break retry loop, go to next model
        }

        if ((is429 || is503) && attempt < MAX_RETRIES) {
          // Extract retry delay from error message, default to exponential backoff
          const retryMatch = lastErrorMsg.match(/retry in (\d+(\.\d+)?)/i);
          const waitSeconds = retryMatch
            ? Math.ceil(parseFloat(retryMatch[1]))
            : attempt * 15;
          console.warn(
            `[AI] Rate limited or overloaded (503/429) on "${modelName}". Waiting ${waitSeconds}s before retry...`,
          );
          await new Promise((resolve) =>
            setTimeout(resolve, waitSeconds * 1000),
          );
          continue;
        }

        // Last attempt for this model failed
        if (attempt === MAX_RETRIES) {
          console.warn(
            `[AI] All ${MAX_RETRIES} retries exhausted for model "${modelName}". Trying next model...`,
          );
          break; // try next model
        }

        // Non-429/503 error, throw immediately
        throw new Error(`[Google AI Error] ${lastErrorMsg}`);
      }
    }
  }

  // All models exhausted
  throw new Error(
    "Tất cả các model AI đều đang bị giới hạn hoặc API Key đã hết lượt sử dụng.\nChi tiết lỗi từ Google: " + 
    lastErrorMsg + 
    "\n\nVui lòng đợi vài phút rồi thử lại, hoặc tạo một API Key mới tại https://aistudio.google.com/apikey"
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
        "Explain a technical concept you learned recently.",
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
        "Điểm mạnh nhất của bạn đối với vị trí này là gì?",
      ];
    }
  },

  gradeInterviewAnswers: async (qaArray, emotionHistory = []) => {
    let emotionSummary = "Không có dữ liệu cảm xúc.";
    if (emotionHistory && emotionHistory.length > 0) {
      const issues = emotionHistory.filter((e) => e.isIssue).length;
      const total = emotionHistory.length;
      const ratio = issues / total;

      let freqMap = {};
      emotionHistory.forEach((e) => {
        if (e.emotion_vi) {
          freqMap[e.emotion_vi] = (freqMap[e.emotion_vi] || 0) + 1;
        }
      });
      const dominantEmotion =
        Object.keys(freqMap).length > 0
          ? Object.keys(freqMap).reduce((a, b) =>
              freqMap[a] > freqMap[b] ? a : b,
            )
          : "Không rõ";

      if (ratio > 0.4) {
        emotionSummary = `Ứng viên có biểu hiện căng thẳng, sợ hãi hoặc tiêu cực (chiếm ${(ratio * 100).toFixed(0)}% thời gian). Cảm xúc chủ đạo là ${dominantEmotion}.`;
      } else if (ratio > 0.2) {
        emotionSummary = `Ứng viên đôi lúc thể hiện sự lo âu, thiếu tự tin (chiếm ${(ratio * 100).toFixed(0)}% thời gian). Cảm xúc chủ đạo là ${dominantEmotion}.`;
      } else {
        emotionSummary = `Ứng viên giữ được bình tĩnh và thái độ ổn định. Cảm xúc chủ đạo là ${dominantEmotion}.`;
      }
    }

    const prompt = `
        ROLE: You are an expert Technical Interviewer.
        CONTEXT: The candidate has completed a technical interview. I will provide you with the questions asked and the candidate's answers.
        Additionally, an AI emotion detection system has monitored the candidate's face during the interview.

        Q&A PAIRS:
        """
        ${JSON.stringify(qaArray, null, 2)}
        """

        EMOTION ANALYSIS SUMMARY:
        "${emotionSummary}"

        TASK:
        Grade each answer and provide overall feedback for the interview session.
        Based on the EMOTION ANALYSIS SUMMARY, provide specific feedback on their psychological state and recommend how they can practice to improve their confidence and emotion management.
        Be constructive, objective, and professional.

        OUTPUT JSON FORMAT:
        {
          "totalScore": number (0-10),
          "overallFeedback": "A summary of their performance across all questions, highlighting key strengths and areas for improvement.",
          "emotionFeedback": "Detailed feedback on their psychological state during the interview based on the EMOTION ANALYSIS SUMMARY, including recommendations for practice.",
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

    const result = await callWithRetryAndFallback(prompt);

    // Merge emotionFeedback into overallFeedback so it gets saved to DB
    if (result && result.emotionFeedback) {
      result.overallFeedback =
        (result.overallFeedback || "") +
        "\n\n💡 **Đánh giá Cảm xúc & Tâm lý:**\n" +
        result.emotionFeedback;
    }

    return result;
  },
};
