import OpenAI from "openai";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Khởi tạo OpenAI client
// Cấu hình dangerouslyAllowBrowser: true vì chạy trực tiếp trên Frontend
const openai = new OpenAI({
  apiKey: API_KEY || "YOUR_OPENAI_API_KEY", 
  dangerouslyAllowBrowser: true 
});

/**
 * Hàm hỗ trợ gọi OpenAI API có tự động parse JSON
 * @param {string} prompt Nội dung yêu cầu (Prompt)
 * @param {string} modelName Tên model (gpt-4o-mini hoặc gpt-4o)
 */
async function callOpenAIJSON(prompt, modelName = "gpt-4o-mini") {
  try {
    console.log(`[AI] Đang gọi OpenAI model: ${modelName}...`);
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: "You are a helpful, professional assistant. You must output only valid JSON without any markdown code blocks or extra text." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    let text = response.choices[0].message.content;
    
    // Đề phòng OpenAI trả về markdown
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error(`[OpenAI Error]`, error);
    if (error.status === 401) {
      throw new Error("Lỗi xác thực: OpenAI API Key không hợp lệ hoặc chưa được cấu hình.");
    }
    if (error.status === 429) {
      throw new Error("Lỗi hạn mức: Tài khoản OpenAI của bạn đã hết số dư (Credit) hoặc bị giới hạn (Rate Limit). Vui lòng nạp thêm tiền vào platform.openai.com.");
    }
    throw new Error(`Lỗi gọi OpenAI: ${error.message}`);
  }
}

export const aiService = {
  analyzeCv: async (cvText) => {
    const prompt = `
        ROLE: You are an expert HR and Recruitment Specialist across multiple industries.
        Your goal is to provide an objective, balanced evaluation of the candidate's CV.

        CRITICAL INSTRUCTION: 
        1. FIRST, carefully read the CV and determine the specific industry and field the candidate is applying for or has experience in. 
        2. DO NOT assume the candidate is in IT/Software Engineering unless the CV explicitly contains IT-specific skills. If the CV is about Marketing, evaluate them STRICTLY on Marketing skills.
        3. Validate their readiness for THEIR actual chosen industry.

        CV CONTENT:
        """
        ${cvText}
        """

        TASK:
        Analyze the CV based on the detected industry and provide a structured JSON output.
        
        IMPORTANT: 
        - The candidate's CV might be in English or Vietnamese. You must read and evaluate it regardless of its language.
        - Be objective. A solid, employable CV should typically score between 70-80. Outstanding ones can go higher (85+).
        - Highlight specific gaps that, if fixed, would genuinely improve their employability.
        - Generate 3-5 relevant interview questions based on their actual domain, skills, and gaps.
        - Regardless of the CV's original language, ALL text values in the JSON output MUST be written entirely in Vietnamese (Tiếng Việt), including summary, strengths, weaknesses, and interview questions.

        OUTPUT JSON FORMAT:
        {
            "industry": "Tên ngành nghề dự đoán (ví dụ: Marketing, IT, Finance, HR...)",
            "matchScore": number (0-100),
            "skills": ["kỹ năng 1", "kỹ năng 2"],
            "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
            "weaknesses": ["Điểm cần cải thiện 1", "Điểm cần cải thiện 2"],
            "summary": "Đánh giá tổng quan về trình độ ứng viên dựa trên đúng ngành nghề của họ.",
            "interviewQuestions": [
                "Câu hỏi 1",
                "Câu hỏi 2",
                "Câu hỏi 3"
            ]
        }
        
        Return ONLY valid JSON matching the format above.
      `;

    // Sử dụng gpt-4o-mini cho tác vụ phân tích CV để tiết kiệm chi phí mà vẫn rất thông minh
    return await callOpenAIJSON(prompt, "gpt-4o-mini");
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
        {
          "questions": [
            "Question 1",
            "Question 2",
            "Question 3",
            "Question 4",
            "Question 5"
          ]
        }
      `;

      const result = await callOpenAIJSON(prompt, "gpt-4o-mini");
      return result.questions;
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
        The wording should be entirely in: ${setupData.language}.
        
        OUTPUT JSON FORMAT:
        {
          "questions": [
            "Question 1",
            "Question 2",
            "Question 3",
            "Question 4",
            "Question 5"
          ]
        }
      `;

      // Dùng gpt-4o-mini để tạo câu hỏi cực nhanh
      const result = await callOpenAIJSON(prompt, "gpt-4o-mini");
      return result.questions;
    } catch (error) {
      console.error("AI Custom Question Generation Error:", error);
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
          "overallFeedback": "Tổng kết đánh giá phần trả lời của ứng viên, nhấn mạnh điểm mạnh và điểm yếu.",
          "emotionFeedback": "Đánh giá chi tiết về tâm lý ứng viên dựa trên EMOTION ANALYSIS SUMMARY và đưa ra lời khuyên thiết thực.",
          "details": [
            {
              "questionIndex": number,
              "score": number (0-10, grade for this specific question),
              "aiFeedback": "Nhận xét chi tiết cho câu trả lời này: ứng viên làm tốt điều gì, thiếu sót điều gì."
            }
          ]
        }
      `;

    // SỬ DỤNG GPT-4o CHUẨN ĐỂ CHẤM ĐIỂM (Cực kỳ chính xác và khắt khe như HR thật)
    const result = await callOpenAIJSON(prompt, "gpt-4o");

    if (result && result.emotionFeedback) {
      result.overallFeedback =
        (result.overallFeedback || "") +
        "\n\n💡 **Đánh giá Cảm xúc & Tâm lý:**\n" +
        result.emotionFeedback;
    }

    return result;
  },
};
