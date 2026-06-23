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
async function callOpenAIJSON(prompt, systemPrompt, modelName = "gpt-4o-mini") {
  try {
    console.log(`[AI] Đang gọi OpenAI model: ${modelName}...`);
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt || "You are a helpful, professional assistant. You must output only valid JSON without any markdown code blocks or extra text." },
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
    const systemPrompt = `Bạn là một chuyên gia Tuyển dụng & Nhân sự (HR) cấp cao với hơn 15 năm kinh nghiệm đánh giá CV ứng viên ở nhiều ngành nghề khác nhau (IT, Marketing, Finance, Design, HR, Sales, Communication, Data Science, v.v.).

Nguyên tắc cốt lõi:
- Bạn PHẢI đọc kỹ toàn bộ CV trước khi đưa ra bất kỳ nhận xét nào.
- Bạn PHẢI xác định đúng ngành nghề thực tế của ứng viên dựa trên nội dung CV (KHÔNG mặc định là IT nếu CV không đề cập đến lập trình).
- Bạn đánh giá CV dựa trên ĐÚNG tiêu chuẩn của ngành nghề đã xác định.
- Bạn viết nhận xét chi tiết, có chiều sâu, mang tính xây dựng — giống như một HR thật sự đang review CV cho ứng viên.
- Tất cả nội dung text trong JSON output PHẢI được viết hoàn toàn bằng Tiếng Việt.
- Bạn chỉ trả về JSON hợp lệ, không có markdown hay text thừa.`;

    const prompt = `
Hãy phân tích CV dưới đây một cách chi tiết và chuyên sâu.

=== NỘI DUNG CV ===
${cvText}
=== HẾT CV ===

YÊU CẦU PHÂN TÍCH CHI TIẾT:

1. XÁC ĐỊNH NGÀNH NGHỀ:
   - Đọc kỹ toàn bộ CV và xác định ngành nghề chính xác (VD: nếu CV có SEO, Content Marketing → ngành Marketing; nếu có React, Java → ngành IT).
   - Nếu CV đa ngành, chọn ngành chiếm ưu thế nhất.

2. CHẤM ĐIỂM (matchScore: 0-100) theo rubric sau:
   a) Kết quả & Tác động (30%): Ứng viên có nêu được thành tựu cụ thể, con số đo lường được không? (VD: "Tăng doanh thu 20%", "Quản lý team 5 người", "Deploy hệ thống phục vụ 10K users").
      - 85-100: Có nhiều thành tựu định lượng, impact rõ ràng.
      - 70-84: Có mô tả công việc rõ ràng nhưng thiếu con số cụ thể.
      - 50-69: Mô tả chung chung, không rõ kết quả đạt được.
      - Dưới 50: Hầu như không có thông tin về kết quả công việc.
   b) Kỹ năng chuyên môn (30%): Độ sâu, độ phù hợp của các kỹ năng được liệt kê so với ngành nghề đã xác định. Có phải là kỹ năng mà thị trường đang cần không?
   c) Kinh nghiệm & Dự án (20%): Sự liên tục trong sự nghiệp, tính liên quan của các dự án/công việc đã làm.
   d) Trình bày & Cấu trúc (20%): CV có rõ ràng, dễ đọc, chuyên nghiệp không? Có lỗi chính tả hay ngữ pháp không?

3. PHÂN TÍCH ĐIỂM MẠNH (strengths): Liệt kê 3-5 điểm mạnh nổi bật. Mỗi điểm mạnh phải CỤ THỂ, có DẪN CHỨNG từ CV (VD: "Có kinh nghiệm thực tế triển khai chiến dịch Marketing trên Facebook Ads với ngân sách lớn" thay vì chỉ nói "Giỏi Marketing").

4. PHÂN TÍCH ĐIỂM YẾU (weaknesses): Liệt kê 3-5 điểm cần cải thiện. Mỗi điểm yếu phải KÈM THEO gợi ý cách khắc phục cụ thể (VD: "CV thiếu phần mô tả kết quả định lượng → Nên bổ sung số liệu cụ thể như tỷ lệ chuyển đổi, số lượng khách hàng đã tiếp cận, v.v.").

5. TỔNG KẾT (summary): Viết một đoạn đánh giá tổng quan DÀI 4-6 câu. Đề cập đến:
   - Ngành nghề đã xác định và mức độ phù hợp của ứng viên.
   - Điểm nổi bật nhất khiến ứng viên có lợi thế cạnh tranh.
   - Điểm yếu lớn nhất cần khắc phục ngay.
   - Lời khuyên tổng thể để nâng cao chất lượng CV.

6. CÂU HỎI PHỎNG VẤN (interviewQuestions): Tạo 5 câu hỏi phỏng vấn thật sự chất lượng:
   - 2 câu kiểm tra kiến thức chuyên sâu về kỹ năng ứng viên liệt kê trong CV.
   - 1 câu hành vi (Behavioral) theo phương pháp STAR về kinh nghiệm thực tế.
   - 1 câu tình huống (Situational) giả định liên quan đến ngành nghề.
   - 1 câu về điểm yếu/gap đã phát hiện để xem ứng viên có nhận thức được không.

OUTPUT JSON FORMAT:
{
    "industry": "Tên ngành nghề (VD: IT, Marketing, Finance...)",
    "matchScore": number (0-100),
    "skills": ["kỹ năng 1", "kỹ năng 2", ...],
    "strengths": ["Điểm mạnh chi tiết 1", "Điểm mạnh chi tiết 2", ...],
    "weaknesses": ["Điểm yếu + gợi ý khắc phục 1", "Điểm yếu + gợi ý khắc phục 2", ...],
    "summary": "Đoạn đánh giá tổng quan dài 4-6 câu, chi tiết và mang tính xây dựng.",
    "interviewQuestions": [
        "Câu hỏi 1",
        "Câu hỏi 2",
        "Câu hỏi 3",
        "Câu hỏi 4",
        "Câu hỏi 5"
    ]
}

Lưu ý: Tất cả nội dung PHẢI viết bằng Tiếng Việt. Trả về CHỈ JSON hợp lệ.`;

    return await callOpenAIJSON(prompt, systemPrompt, "gpt-4o-mini");
  },

  generateInterviewQuestions: async (cvText) => {
    try {
      const systemPrompt = "Bạn là một chuyên gia phỏng vấn chuyên nghiệp. Bạn tạo ra các câu hỏi sâu sắc để kiểm tra xem ứng viên có thực sự hiểu biết về những gì họ ghi trong CV hay không. Chỉ trả về JSON hợp lệ.";
      const prompt = `
Dựa trên CV dưới đây, hãy tạo 5 câu hỏi phỏng vấn chuyên sâu.

=== CV ===
${cvText}
=== HẾT CV ===

Yêu cầu:
- 2 câu kiểm tra kiến thức chuyên môn sâu về kỹ năng ứng viên liệt kê.
- 1 câu hành vi (STAR method) về kinh nghiệm thực tế.
- 1 câu tình huống giả định liên quan đến ngành.
- 1 câu về gap/điểm yếu trong CV.
- Câu hỏi phải bằng Tiếng Việt.

OUTPUT JSON:
{
  "questions": ["Câu 1", "Câu 2", "Câu 3", "Câu 4", "Câu 5"]
}
`;

      const result = await callOpenAIJSON(prompt, systemPrompt, "gpt-4o-mini");
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
      const systemPrompt = `Bạn là một chuyên gia tuyển dụng dày dạn kinh nghiệm. Bạn tạo câu hỏi phỏng vấn cá nhân hóa dựa trên CV và tiêu chí cụ thể. Câu hỏi phải sát với thực tế tuyển dụng, đúng độ khó và đúng loại phỏng vấn được yêu cầu. Chỉ trả về JSON hợp lệ.`;
      const prompt = `
Dựa trên CV và tiêu chí phỏng vấn dưới đây, hãy tạo 5 câu hỏi phỏng vấn chất lượng cao.

=== CV ===
${cvText}
=== HẾT CV ===

=== TIÊU CHÍ PHỎNG VẤN ===
- Ngành nghề: ${setupData.industry}
- Mô tả công việc (JD): ${setupData.jobDescription || "Không có — hãy tập trung vào CV và ngành nghề."}
- Cấp độ/Độ khó: ${setupData.difficulty}
- Loại phỏng vấn: ${setupData.interviewType}
- Kỹ năng trọng tâm: ${setupData.keywords?.join(", ") || "Theo CV"}
- Ngôn ngữ đầu ra: ${setupData.language}
=== HẾT TIÊU CHÍ ===

Quy tắc tạo câu hỏi:
- Nếu loại là "Kiến thức": Hỏi sâu về lý thuyết, công cụ, framework liên quan đến ngành & CV.
- Nếu loại là "Hành vi": Dùng phương pháp STAR (Situation, Task, Action, Result) để hỏi về kinh nghiệm thực tế.
- Nếu loại là "Tình huống": Đặt ra tình huống giả định sát với công việc thực tế ở đúng cấp độ ${setupData.difficulty}.
- Câu hỏi phải phù hợp với cấp độ ${setupData.difficulty} (Intern thì hỏi cơ bản, Senior thì hỏi chiến lược, kiến trúc).
- Toàn bộ câu hỏi viết bằng: ${setupData.language}.

OUTPUT JSON:
{
  "questions": ["Câu 1", "Câu 2", "Câu 3", "Câu 4", "Câu 5"]
}
`;

      const result = await callOpenAIJSON(prompt, systemPrompt, "gpt-4o-mini");
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

    const systemPrompt = `Bạn là một Giám khảo Phỏng vấn chuyên nghiệp cấp cao với hơn 15 năm kinh nghiệm tuyển dụng. Bạn có khả năng:
- Đánh giá chính xác chất lượng câu trả lời dựa trên nội dung, cấu trúc, và chiều sâu.
- Phân tích tâm lý ứng viên dựa trên dữ liệu cảm xúc từ hệ thống AI nhận diện khuôn mặt.
- Đưa ra nhận xét chi tiết, dài, mang tính xây dựng giúp ứng viên cải thiện thực sự.

Quy tắc chấm điểm (0-10):
- 9-10: Câu trả lời xuất sắc, có ví dụ cụ thể, cấu trúc STAR rõ ràng, thể hiện tư duy sâu.
- 7-8: Câu trả lời tốt, đúng hướng, có nội dung nhưng thiếu chiều sâu hoặc ví dụ cụ thể.
- 5-6: Câu trả lời trung bình, chạm đúng vấn đề nhưng hời hợt, thiếu dẫn chứng.
- 3-4: Câu trả lời yếu, lạc đề hoặc quá ngắn, không thể hiện sự am hiểu.
- 1-2: Câu trả lời rất kém, gần như không liên quan hoặc để trống.
- 0: Không trả lời.

Bạn PHẢI viết tất cả nội dung bằng Tiếng Việt. Chỉ trả về JSON hợp lệ.`;

    const prompt = `
Hãy chấm điểm và nhận xét chi tiết buổi phỏng vấn dưới đây.

=== CÁC CẶP CÂU HỎI - CÂU TRẢ LỜI ===
${JSON.stringify(qaArray, null, 2)}
=== HẾT Q&A ===

=== KẾT QUẢ PHÂN TÍCH CẢM XÚC (từ hệ thống AI Camera) ===
${emotionSummary}
=== HẾT CẢM XÚC ===

YÊU CẦU CHẤM ĐIỂM CHI TIẾT:

1. CHẤM TỪNG CÂU (details):
   Với MỖI câu hỏi, hãy viết nhận xét "aiFeedback" DÀI ÍT NHẤT 3-4 câu bao gồm:
   - Ứng viên đã trả lời ĐÚNG những gì? Nội dung nào có giá trị?
   - Ứng viên THIẾU SÓT hoặc SAI ở đâu? Câu trả lời mong đợi (lý tưởng) nên như thế nào?
   - GỢI Ý CỤ THỂ: Ứng viên nên bổ sung/cải thiện điều gì để câu trả lời hoàn hảo hơn?
   - Nếu câu trả lời quá ngắn hoặc để trống: Chỉ ra đây là điểm trừ nghiêm trọng và gợi ý cách trả lời.

2. TỔNG KẾT CHUNG (overallFeedback):
   Viết một đoạn nhận xét tổng quan DÀI 5-8 câu, bao gồm:
   - Đánh giá tổng thể về năng lực và sự chuẩn bị của ứng viên.
   - 2-3 điểm mạnh nổi bật nhất trong cách trả lời.
   - 2-3 điểm yếu cần cải thiện nhất.
   - Mức độ phù hợp của ứng viên với vị trí (dựa trên chất lượng câu trả lời).
   - Lời khuyên thiết thực nhất để ứng viên cải thiện cho lần phỏng vấn tiếp theo.

3. ĐÁNH GIÁ TÂM LÝ (emotionFeedback):
   Dựa trên KẾT QUẢ PHÂN TÍCH CẢM XÚC ở trên, viết nhận xét DÀI 3-5 câu:
   - Ứng viên có giữ được bình tĩnh không? Có dấu hiệu lo âu, căng thẳng không?
   - Cảm xúc tiêu cực (nếu có) ảnh hưởng thế nào đến chất lượng câu trả lời?
   - Gợi ý 2-3 phương pháp cụ thể để ứng viên kiểm soát cảm xúc tốt hơn (VD: kỹ thuật hít thở 4-7-8, phương pháp Power Posing, cách luyện tập trước gương, v.v.).

4. ĐIỂM TỔNG (totalScore): Trung bình cộng có trọng số của tất cả các câu, làm tròn 1 chữ số thập phân.

OUTPUT JSON:
{
  "totalScore": number (0-10),
  "overallFeedback": "Đoạn nhận xét tổng quan dài 5-8 câu bằng tiếng Việt.",
  "emotionFeedback": "Đoạn đánh giá tâm lý dài 3-5 câu bằng tiếng Việt.",
  "details": [
    {
      "questionIndex": 0,
      "score": number (0-10),
      "aiFeedback": "Nhận xét chi tiết dài 3-4 câu cho câu trả lời này."
    }
  ]
}
`;

    const result = await callOpenAIJSON(prompt, systemPrompt, "gpt-4o");

    if (result && result.emotionFeedback) {
      result.overallFeedback =
        (result.overallFeedback || "") +
        "\n\n💡 **Đánh giá Cảm xúc & Tâm lý:**\n" +
        result.emotionFeedback;
    }

    return result;
  },
};
