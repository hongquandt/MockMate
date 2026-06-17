import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { interviewService } from "../services/api";
import { aiService } from "../services/aiService";
import logoImg from "../assets/img/z7430605225117_544001c3f21b8fc1cb5af11cb46703c0.jpg";

const InterviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { analysisData, setupData, cvText } = location.state || {}; // Expect cvText if we want to generate more
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [startTime, setStartTime] = useState(Date.now()); // Time when the question started
  const [sessionStartTime, setSessionStartTime] = useState(Date.now()); // Time when session started
  const [elapsedTime, setElapsedTime] = useState(0); // Total elapsed seconds
  const [questionElapsedTime, setQuestionElapsedTime] = useState(0); // Per-question elapsed seconds

  const [answers, setAnswers] = useState({}); // Store all answers locally: { index: "answer" }
  const [saving, setSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const [isGrading, setIsGrading] = useState(false);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    currentIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  // --- Emotion Detection ---
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [emotion, setEmotion] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState([]);

  // Fallback data if page is refreshed or accessed directly
  const defaultAnalysisData = {
    interviewQuestions: [
      "Please introduce yourself and highlight your key skills.",
      "What motivated you to choose your field of study?",
      "Describe a challenging technical problem you solved recently.",
    ],
    skills: ["General", "Communication"],
    matchScore: 0,
  };

  const activeAnalysisData = analysisData || defaultAnalysisData;
  const [questions, setQuestions] = useState(
    activeAnalysisData.interviewQuestions,
  );
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  useEffect(() => {
    const prepareInterview = async () => {
      let finalQuestions = activeAnalysisData.interviewQuestions;

      // Generate custom questions if we just came from the Setup Page
      if (setupData) {
        setIsGeneratingQuestions(true);
        try {
          const rawCvText =
            analysisData?.rawCvText || cvText || "User CV details";
          finalQuestions = await aiService.generateCustomQuestions(
            rawCvText,
            setupData,
          );
          setQuestions(finalQuestions);
        } catch (error) {
          console.error("Failed to generate custom questions. Using fallback.");
        } finally {
          setIsGeneratingQuestions(false);
        }
      }

      if (finalQuestions && finalQuestions.length > 0) {
        try {
          // Start session API call
          const data = await interviewService.startSession(
            1,
            { ...activeAnalysisData, setupData },
            finalQuestions,
          );
          if (data && data.sessionId) {
            setSessionId(data.sessionId);
            setSessionStartTime(Date.now());
          } else {
            console.error("Session started but no sessionId returned", data);
          }
        } catch (error) {
          console.error("Failed to start session on backend:", error);
        }
      }
    };

    prepareInterview();

    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (window.recognitionInstance) window.recognitionInstance.stop();
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // --- Emotion Detection Functions ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Lỗi truy cập camera:", err);
    }
  };

  const detectEmotion = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive || isGrading)
      return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const video = videoRef.current;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg", 0.8);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_EMOTION_API_URL || 'http://localhost:5000'}/detect-emotion`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageData }),
        },
      );
      const data = await response.json();
      if (data.success && data.result) {
        setEmotion(data.result);
        setEmotionHistory((prev) => [
          ...prev,
          {
            questionIndex: currentQuestionIndex,
            emotion_vi: data.result.emotion_vi,
            isIssue: data.result.isPsychologicalIssue,
          },
        ]);
      }
    } catch (error) {
      // Ignore connection errors
    }
  };

  useEffect(() => {
    startCamera();
  }, []);

  useEffect(() => {
    let intervalId;
    if (cameraActive && sessionId && !isGrading) {
      intervalId = setInterval(() => detectEmotion(), 2000); // 2 seconds
    }
    return () => clearInterval(intervalId);
  }, [cameraActive, sessionId, isGrading, currentQuestionIndex]);

  // Timer effect - total session time + per-question time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setElapsedTime(Math.floor((now - sessionStartTime) / 1000));
      setQuestionElapsedTime(Math.floor((now - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime, startTime]);

  // Reset question start time and load answer when question changes
  useEffect(() => {
    setStartTime(Date.now());
    setQuestionElapsedTime(0);
    setUserAnswer(answers[currentQuestionIndex] || "");
  }, [currentQuestionIndex]); // Removed 'answers' dependency to avoid loop, managed manually

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (val) => {
    setUserAnswer(val);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: val,
    }));
  };

  const saveCurrentAnswer = async (manual = false) => {
    if (sessionId && userAnswer.trim()) {
      setSaving(true);
      try {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        await interviewService.submitAnswer(
          sessionId,
          currentQuestionIndex,
          userAnswer,
          timeTaken,
        );

        // Update local state map firmly
        setAnswers((prev) => ({
          ...prev,
          [currentQuestionIndex]: userAnswer,
        }));

        if (manual) {
          setShowSaveSuccess(true);
          setTimeout(() => setShowSaveSuccess(false), 2000);
        }
      } catch (error) {
        console.error("Failed to save answer:", error);
      } finally {
        setSaving(false);
      }
    }
  };

  const currentQuestion = questions[currentQuestionIndex];  // --- Text-to-Speech (TTS) ---
  const getBestVoice = (lang) => {
    const voices = window.speechSynthesis.getVoices();
    const langCode = lang === "Vietnamese" ? "vi" : "en";

    const matchingVoices = voices.filter((v) => v.lang.startsWith(langCode));
    if (matchingVoices.length === 0) return null;

    const googleVoice = matchingVoices.find((v) =>
      v.name.toLowerCase().includes("google"),
    );
    if (googleVoice) return googleVoice;

    const msVoice = matchingVoices.find((v) =>
      v.name.toLowerCase().includes("microsoft"),
    );
    if (msVoice) return msVoice;

    return matchingVoices[0];
  };

  const audioRef = useRef(null); // Ref to store the current playing Audio object

  const speakText = async (text) => {
    // "Unlock" audio context IMMEDIATELY upon button click to bypass browser Autoplay policy
    if (!audioRef.current) {
        audioRef.current = new Audio();
    }
    audioRef.current.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"; // silent empty wav
    audioRef.current.play().catch(() => {});

    const voiceLang = setupData?.voiceLanguage || "Vietnamese";

    // 1. Dùng ElevenLabs API (Giọng AI siêu thực)
    const elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    
    if (elevenLabsApiKey && elevenLabsApiKey !== "your_key_here") {
      try {
        setIsSpeaking(true);
        // Thay voiceId bằng ID giọng bạn thích. 
        // Lấy Voice ID tại: https://elevenlabs.io/app/voice-library
        const voiceId = "pNInz6obpgDQGcFmaJcg"; // Giọng Adam
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": elevenLabsApiKey
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2", // Bắt buộc dùng v2 để hỗ trợ Tiếng Việt
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.7
            }
          })
        });

        if (!response.ok) {
          throw new Error("ElevenLabs API error: " + response.statusText);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => setIsSpeaking(false);
        audioRef.current.onerror = () => {
           console.warn("ElevenLabs TTS playback error, falling back to browser TTS");
           fallbackBrowserTTS(text, voiceLang);
        };
        
        await audioRef.current.play();
        return; // Kết thúc tại đây nếu thành công
      } catch (err) {
        console.error("ElevenLabs API Error:", err);
        // Rớt xuống dùng giọng trình duyệt
      }
    }

    // 2. Dự phòng (Fallback): Dùng giọng trình duyệt mặc định
    fallbackBrowserTTS(text, voiceLang);
  };

  const fallbackBrowserTTS = (text, voiceLang) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const doSpeak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = voiceLang === "Vietnamese" ? "vi-VN" : "en-US";
        const bestVoice = getBestVoice(voiceLang);
        if (bestVoice) {
          utterance.voice = bestVoice;
        } else if (voiceLang === "Vietnamese") {
           // Fallback to finding any voice that has "vi" in it
           const fallbackVi = window.speechSynthesis.getVoices().find(v => v.lang.includes("vi"));
           if (fallbackVi) utterance.voice = fallbackVi;
        }
        utterance.rate = voiceLang === "Vietnamese" ? 0.85 : 1.0;
        utterance.pitch = 1.0;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      };
      
      if (window.speechSynthesis.getVoices().length === 0) {
        const onVoices = () => {
          window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
          doSpeak();
        };
        window.speechSynthesis.addEventListener('voiceschanged', onVoices);
      } else {
        doSpeak();
      }
    } else {
      alert("Trình duyệt của bạn không hỗ trợ đọc giọng nói.");
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };

  // --- Speech-to-Text (STT) ---
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Your browser does not support voice recognition. Please use Chrome or Edge.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    // Dynamically get the language based on setup
    recognition.lang = setupData?.language === "Vietnamese" ? "vi-VN" : "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setUserAnswer((prev) => {
          const newAnswer = prev
            ? prev + " " + finalTranscript
            : finalTranscript;
          setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [currentIndexRef.current]: newAnswer,
          }));
          return newAnswer;
        });
      }
    };
    recognition.onerror = (event) => {
      console.error("Speech error", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
    window.recognitionInstance = recognition;
  };

  const stopListening = () => {
    if (window.recognitionInstance) window.recognitionInstance.stop();
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  // --- Emotion Advice ---
  const getEmotionAdvice = (emotionData) => {
    if (!emotionData) return null;
    const label = (emotionData.emotion_vi || "").toLowerCase();

    if (label.includes("vui") || label.includes("happy")) {
      return {
        icon: "sentiment_very_satisfied",
        color: "text-green-400",
        bg: "bg-green-500/10 border border-green-500/30",
        title: "😊 Tuyệt vời!",
        message:
          "Bạn đang có tâm trạng rất tốt. Hãy duy trì năng lượng tích cực này — sự tự tin sẽ tạo ấn tượng mạnh với nhà tuyển dụng!",
      };
    }
    if (
      label.includes("bình tĩnh") ||
      label.includes("neutral") ||
      label.includes("calm")
    ) {
      return {
        icon: "self_improvement",
        color: "text-blue-400",
        bg: "bg-blue-500/10 border border-blue-500/30",
        title: "😌 Bình tĩnh",
        message:
          "Bạn đang rất ổn định và tập trung. Đây là trạng thái lý tưởng — tiếp tục giữ vững nhịp độ và trả lời rõ ràng, mạch lạc.",
      };
    }
    if (
      label.includes("sợ") ||
      label.includes("lo") ||
      label.includes("fear") ||
      label.includes("anxious")
    ) {
      return {
        icon: "favorite",
        color: "text-orange-400",
        bg: "bg-orange-500/10 border border-orange-500/30",
        title: "💪 Bạn làm được!",
        message:
          "Hít thở sâu 3 giây, thở ra chậm rãi. Lo lắng là bình thường — hãy nhớ rằng bạn đã chuẩn bị kỹ lưỡng và xứng đáng có mặt ở đây!",
      };
    }
    if (label.includes("buồn") || label.includes("sad")) {
      return {
        icon: "wb_sunny",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10 border border-yellow-500/30",
        title: "🌟 Cố lên nào!",
        message:
          "Mỗi câu hỏi là một cơ hội để toả sáng. Hãy nhớ lại những điểm mạnh của bạn và tự tin chia sẻ câu chuyện của mình.",
      };
    }
    if (
      label.includes("tức") ||
      label.includes("angry") ||
      label.includes("disgust") ||
      label.includes("ghê")
    ) {
      return {
        icon: "spa",
        color: "text-red-400",
        bg: "bg-red-500/10 border border-red-500/30",
        title: "🧘 Hãy thư giãn",
        message:
          "Bạn đang có dấu hiệu căng thẳng. Dừng lại vài giây, nhắm mắt hít thở và thư giãn cơ mặt trước khi tiếp tục.",
      };
    }
    if (label.includes("ngạc nhiên") || label.includes("surprise")) {
      return {
        icon: "lightbulb",
        color: "text-purple-400",
        bg: "bg-purple-500/10 border border-purple-500/30",
        title: "💡 Thú vị!",
        message:
          "Câu hỏi hay quá phải không? Hãy dành 2-3 giây suy nghĩ trước khi trả lời — nhà tuyển dụng đánh giá cao sự cẩn thận.",
      };
    }
    // Fallback for any unrecognized issue
    if (emotionData.isPsychologicalIssue) {
      return {
        icon: "warning",
        color: "text-red-400",
        bg: "bg-red-500/10 border border-red-500/30",
        title: "⚠️ Chú ý",
        message:
          "Hãy hít thở sâu và giữ bình tĩnh nhé! Bạn đã chuẩn bị tốt rồi.",
      };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="px-8 py-4 flex items-center justify-between border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg" />
          <span className="font-bold text-xl">MockMate Live Interview</span>
        </div>

        <div className="flex items-center gap-2 text-xl font-mono text-purple-400">
          <span className="material-symbols-outlined">timer</span>
          {formatTime(elapsedTime)}
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
          Thoát
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Left Panel */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center border-r border-slate-700 relative">
          {/* Toast Notification */}
          {showSaveSuccess && (
            <div className="absolute top-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
              <span className="material-symbols-outlined text-sm">
                check_circle
              </span>
              Đã lưu câu trả lời
            </div>
          )}

          {/* AI Avatar */}
          <div
            className={`w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-purple-500/20 ${isSpeaking ? "animate-pulse scale-105 duration-700" : ""}`}
          >
            <span className="material-symbols-outlined text-5xl md:text-6xl text-white">
              smart_toy
            </span>
          </div>

          {isGeneratingQuestions ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <h2 className="text-xl font-bold animate-pulse">
                AI Đang thiết lập kịch bản phỏng vấn...
              </h2>
              <p className="text-slate-400">
                Đang tạo bộ câu hỏi dựa trên CV và cấu hình của bạn.
              </p>
            </div>
          ) : (
            <>
              <div className="max-w-2xl text-center space-y-6 w-full">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="px-4 py-1.5 bg-slate-800 rounded-full text-sm font-medium text-slate-400">
                    Câu hỏi {currentQuestionIndex + 1} / {questions.length}
                  </div>
                  <div className="px-4 py-1.5 bg-slate-800 rounded-full text-sm font-medium text-amber-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">
                      hourglass_top
                    </span>
                    {formatTime(questionElapsedTime)}
                  </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold leading-tight min-h-[80px] flex items-center justify-center">
                  {currentQuestion}
                </h2>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() =>
                      isSpeaking ? stopSpeaking() : speakText(currentQuestion)
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isSpeaking ? "bg-red-500/20 text-red-400 border border-red-500/50" : "bg-slate-700 hover:bg-slate-600 text-slate-200"}`}
                  >
                    <span className="material-symbols-outlined">
                      {isSpeaking ? "stop_circle" : "volume_up"}
                    </span>
                    {isSpeaking ? "Dừng đọc" : "Nghe câu hỏi"}
                  </button>
                </div>
              </div>

              {/* Answer Area */}
              <div className="w-full max-w-2xl mt-8 relative">
                <div className="relative group">
                  <textarea
                    value={userAnswer}
                    readOnly
                    placeholder="Vui lòng bấm Micro để nói câu trả lời của bạn..."
                    className="w-full h-40 bg-slate-800 border border-slate-600 rounded-xl p-4 pr-12 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-not-allowed"
                  ></textarea>

                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                      onClick={toggleListening}
                      className={`p-2 rounded-full transition-all ${isListening ? "bg-red-500 animate-pulse text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
                      title="Bấm để nói"
                    >
                      <span className="material-symbols-outlined text-sm md:text-base">
                        {isListening ? "mic_off" : "mic"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-slate-500 italic">
                    {isListening
                      ? `Đang nghe... (${setupData?.language || "English"})`
                      : "Tips: Bấm micro để ghi âm câu trả lời."}
                  </p>
                  <button
                    onClick={() => saveCurrentAnswer(true)}
                    disabled={!userAnswer.trim() || saving}
                    className="flex items-center gap-2 px-4 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <span className="material-symbols-outlined animate-spin text-sm">
                        sync
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">
                        save
                      </span>
                    )}
                    {saving ? "Đang lưu..." : "Lưu câu trả lời"}
                  </button>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-8 flex justify-center gap-4 w-full max-w-2xl">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => {
                    saveCurrentAnswer(); // Auto-save on nav
                    setCurrentQuestionIndex((prev) => prev - 1);
                    stopSpeaking();
                  }}
                  className="flex-1 p-3 bg-slate-800 rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Câu trước
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={() => {
                      saveCurrentAnswer(); // Auto-save on nav
                      setCurrentQuestionIndex((prev) => prev + 1);
                      stopSpeaking();
                    }}
                    className="flex-[2] p-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
                  >
                    Câu tiếp theo
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </button>
                ) : (
                  <button
                    disabled={isGrading}
                    onClick={async () => {
                      setIsGrading(true);
                      try {
                        await saveCurrentAnswer(); // make sure last answer is saved locally

                        let qaToGrade = questions.map((q, idx) => ({
                          questionIndex: idx,
                          question: q,
                          answer:
                            answers[idx] || userAnswer || "Không trả lời.", // Fallback for last question
                        }));

                        if (sessionId) {
                          const gradingResult =
                            await aiService.gradeInterviewAnswers(
                              qaToGrade,
                              emotionHistory,
                            );
                          await interviewService.completeSession(
                            sessionId,
                            gradingResult,
                          );
                        }
                        navigate(`/cv-history/${sessionId}`);
                      } catch (err) {
                        console.error("Lỗi khi chấm điểm:", err);
                        if (sessionId) {
                          await interviewService.completeSession(sessionId, {
                            totalScore: 0,
                            overallFeedback:
                              "Không thể chấm điểm, có lỗi xảy ra.",
                            details: [],
                          });
                        }
                        navigate(`/cv-history/${sessionId}`);
                      } finally {
                        setIsGrading(false);
                      }
                    }}
                    className="flex-[2] px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-all shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGrading ? (
                      <span className="material-symbols-outlined animate-spin">
                        sync
                      </span>
                    ) : (
                      <span className="material-symbols-outlined">
                        check_circle
                      </span>
                    )}
                    {isGrading ? "Đang chấm điểm AI..." : "Hoàn thành"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Panel: Context / Notes */}
        <div className="w-full md:w-96 bg-slate-800 p-6 overflow-y-auto hidden md:block">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              description
            </span>
            Gợi ý trả lời
          </h3>

          <div className="bg-slate-700/50 p-4 rounded-xl text-sm text-slate-300 leading-relaxed mb-6">
            Dựa trên CV của bạn, hãy tập trung vào các từ khóa:
            <div className="flex flex-wrap gap-2 mt-3">
              {(setupData?.keywords || analysisData?.skills || []).map(
                (skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-slate-600 rounded text-xs text-white border border-slate-500"
                  >
                    {skill}
                  </span>
                ),
              )}
            </div>
            {setupData && (
              <div className="mt-4 pt-4 border-t border-slate-600 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngành nghề:</span>
                  <span className="font-medium text-white">
                    {setupData.industry}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Độ khó:</span>
                  <span className="font-medium text-white">
                    {setupData.difficulty}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thể loại:</span>
                  <span className="font-medium text-white">
                    {setupData.interviewType}
                  </span>
                </div>
              </div>
            )}
            {/* Time Summary */}
            <div className="mt-4 pt-4 border-t border-slate-600 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">
                    timer
                  </span>
                  Tổng thời gian:
                </span>
                <span className="font-mono font-bold text-purple-400">
                  {formatTime(elapsedTime)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">
                    hourglass_top
                  </span>
                  Câu hiện tại:
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {formatTime(questionElapsedTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Camera Feed for Emotion AI */}
          <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-sm text-slate-300 flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-green-400">
                psychology
              </span>
              AI Theo dõi Tâm lý
            </h3>
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-600">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!cameraActive ? "hidden" : ""}`}
              ></video>
              <canvas
                ref={canvasRef}
                width={320}
                height={240}
                className="hidden"
              />
              {!cameraActive && (
                <div className="text-slate-500 text-xs flex flex-col items-center">
                  <span className="material-symbols-outlined mb-1">
                    videocam_off
                  </span>
                  Camera tắt
                </div>
              )}
              {emotion && cameraActive && (
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded border border-slate-500 flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${emotion.isPsychologicalIssue ? "bg-red-500" : "bg-green-500"} animate-pulse`}
                  ></span>
                  {emotion.emotion_vi}
                </div>
              )}
            </div>
            {emotion &&
              (() => {
                const advice = getEmotionAdvice(emotion);
                if (!advice) return null;
                return (
                  <div className={`mt-3 rounded-lg p-3 ${advice.bg}`}>
                    <p
                      className={`text-xs font-bold ${advice.color} flex items-center gap-1.5 mb-1`}
                    >
                      <span className={`material-symbols-outlined text-[14px]`}>
                        {advice.icon}
                      </span>
                      {advice.title}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {advice.message}
                    </p>
                  </div>
                );
              })()}
          </div>

          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-500">
              lightbulb
            </span>
            Tips
          </h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex gap-2">
              <span className="material-symbols-outlined text-xs mt-1">
                check
              </span>
              Sử dụng mô hình STAR (Situation, Task, Action, Result).
            </li>
            <li className="flex gap-2">
              <span className="material-symbols-outlined text-xs mt-1">
                check
              </span>
              Giữ câu trả lời dưới 2 phút.
            </li>
            <li className="flex gap-2">
              <span className="material-symbols-outlined text-xs mt-1">
                check
              </span>
              Đừng ngại yêu cầu làm rõ câu hỏi.
            </li>
            <li className="flex gap-2">
              <span className="material-symbols-outlined text-xs mt-1">
                tips_and_updates
              </span>
              Nếu AI đọc khó nghe, hãy kiểm tra loa và cài đặt giọng nói của
              trình duyệt.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default InterviewPage;
