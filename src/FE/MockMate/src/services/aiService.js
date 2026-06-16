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
        ROLE: You are an expert HR and Recruitment Specialist across multiple industries (Marketing, Finance, IT, Healthcare, Business, etc.).
        Your goal is to provide an objective, balanced evaluation of the candidate's CV.

        CRITICAL INSTRUCTION: 
        1. FIRST, carefully read the CV and determine the specific industry and field the candidate is applying for or has experience in (e.g., Marketing, Sales, IT, Graphic Design, etc.). 
        2. DO NOT assume the candidate is in IT/Software Engineering unless the CV explicitly contains IT-specific skills (like programming languages, frameworks, cloud, etc.). If the CV is about Marketing, evaluate them STRICTLY on Marketing skills, campaigns, content creation, SEO, event management, etc.
        3. Validate their readiness for THEIR actual chosen industry based on the extracted content.

        CV CONTENT:
        """
        ${cvText}
        """

        SCORING RUBRIC (Professional & Objective):
        1. Impact & Results (Weight: 30%): Look for tangible results, measurable achievements, or clear demonstrations of executing their duties in THEIR industry.
           - High score: Quantifiable impact or complex problem solving.
           - Medium score: Clear responsibilities and successful completion of tasks.
           - Low score: Vague descriptions without clear outcomes.
        2. Professional Skills (Weight: 30%): Assess the depth, relevance, and proficiency of skills mentioned, including hard and soft skills applicable strictly to THEIR industry.
        3. Experience Quality (Weight: 20%): Logical progression, relevant projects, or work history.
        4. Structure & Clarity (Weight: 20%): Professional formatting, grammar, and clarity.

        TASK:
        Analyze the CV based on the detected industry and provide a structured JSON output.
        
        IMPORTANT: 
        - The candidate's CV might be in English or Vietnamese. You must read and evaluate it regardless of its language.
        - Be objective. Do not be overly harsh, but do not give high scores for free.
        - A solid, employable CV should typically score between 70-80. Outstanding ones can go higher (85+).
        - Highlight specific gaps that, if fixed, would genuinely improve their employability in THEIR SPECIFIC FIELD.
        - Generate 3-5 relevant interview questions based on their actual domain, skills, and gaps.
        - Regardless of the CV's original language, ALL text values in the JSON output MUST be written entirely in Vietnamese (Tiếng Việt), including summary, strengths, weaknesses, and interview questions.
        - In the "summary", mention the detected industry (e.g. "Ứng viên có nền tảng tốt trong lĩnh vực Marketing...").

        OUTPUT JSON FORMAT:
        {
            "industry": "Tên ngành nghề dự đoán (ví dụ: Marketing, IT, Finance, HR...)",
            "matchScore": number (0-100),
            "skills": ["kỹ năng 1", "kỹ năng 2"],
            "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
            "weaknesses": ["Điểm cần cải thiện 1", "Điểm cần cải thiện 2"],
            "summary": "Đánh giá tổng quan về trình độ ứng viên dựa trên đúng ngành nghề của họ (bằng tiếng Việt).",
            "interviewQuestions": [
                "Câu hỏi 1 (đúng chuyên ngành của ứng viên)",
                "Câu hỏi 2",
                "Câu hỏi 3"
            ]
        }
        
        Return ONLY valid JSON.
      `;

    return await callWithRetryAndFallback(prompt);
  },

  generateInterviewQuestions: async (cvText) => {
    try {
      const prompt = `
        ROLE: You are a Professional Interviewer.
        CONTEXT: The candidate has provided their CV.
        
        CV CONTENT:
        """
        ${cvText}
        """
        
        TASK:
        Generate 5 deeper interview questions specifically focusing on the "Education" (what they learned) and "Skills" (what they claim to know) sections of the CV.
        Verify if they truly understand the concepts or tools they listed.
        
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
        ROLE: You are an Expert HR & Recruiter.
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
        ROLE: You are an Expert Interviewer and Assessor.
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
        
        IMPORTANT: ALL your feedback text (overallFeedback, emotionFeedback, aiFeedback) MUST be written entirely in Vietnamese.

        OUTPUT JSON FORMAT:
        {
          "totalScore": number (0-10),
          "overallFeedback": "Tổng kết đánh giá phần trả lời của ứng viên, nhấn mạnh điểm mạnh và điểm yếu (bằng tiếng Việt).",
          "emotionFeedback": "Đánh giá chi tiết về tâm lý ứng viên dựa trên EMOTION ANALYSIS SUMMARY và đưa ra lời khuyên (bằng tiếng Việt).",
          "details": [
            {
              "questionIndex": number,
              "score": number (0-10, grade for this specific question),
              "aiFeedback": "Nhận xét chi tiết cho câu trả lời này: ứng viên làm tốt điều gì, thiếu sót điều gì (bằng tiếng Việt)."
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
