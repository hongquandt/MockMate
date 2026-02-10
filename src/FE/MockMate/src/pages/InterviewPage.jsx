import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { interviewService } from '../services/api';
import logoImg from '../assets/img/z7430605225117_544001c3f21b8fc1cb5af11cb46703c0.jpg';

const InterviewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { analysisData, cvText } = location.state || {}; // Expect cvText if we want to generate more
    const [sessionId, setSessionId] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [userAnswer, setUserAnswer] = useState("");
    const [startTime, setStartTime] = useState(Date.now()); // Time when the question started
    const [sessionStartTime, setSessionStartTime] = useState(Date.now()); // Time when session started
    const [elapsedTime, setElapsedTime] = useState(0); // Total elapsed seconds

    // Default questions if none provided
    const questions = analysisData?.interviewQuestions || [
        "Please introduce yourself and highlight your key skills.",
        "What motivated you to choose your field of study?",
        "Describe a challenging technical problem you solved recently."
    ];

    useEffect(() => {
        const startInterview = async () => {
            if (analysisData && questions.length > 0) {
                try {
                    // Start session API call
                    const data = await interviewService.startSession(1, analysisData, questions);
                    setSessionId(data.sessionId);
                    setSessionStartTime(Date.now());
                } catch (error) {
                    console.error("Failed to start session:", error);
                }
            }
        };
        startInterview();
    }, []);

    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - sessionStartTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [sessionStartTime]);

    // Reset question start time when question changes
    useEffect(() => {
        setStartTime(Date.now());
    }, [currentQuestionIndex]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const saveAnswer = async (index, answer) => {
        if (sessionId && answer.trim()) {
            try {
                const timeTaken = Math.floor((Date.now() - startTime) / 1000);
                await interviewService.submitAnswer(sessionId, index, answer, timeTaken);
            } catch (error) {
                console.error("Failed to save answer:", error);
            }
        }
    };

    const currentQuestion = questions[currentQuestionIndex];

    // --- Text-to-Speech (TTS) ---
    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            // Cancel any current speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US'; // Set language, maybe make dynamic later?
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        } else {
            alert("Your browser does not support text-to-speech.");
        }
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    // --- Speech-to-Text (STT) ---
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support voice recognition. Please use Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; // Or 'vi-VN' depending on preference
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                 setUserAnswer(prev => prev + " " + finalTranscript);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
        
        // Store recognition instance to stop it later if needed (simple implementation)
        window.recognitionInstance = recognition;
    };

    const stopListening = () => {
        if (window.recognitionInstance) {
            window.recognitionInstance.stop();
        }
        setIsListening(false);
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
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
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                    Thoát
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col md:flex-row">
                {/* Left Panel: Interviewer / Question */}
                <div className="flex-1 p-8 flex flex-col items-center justify-center border-r border-slate-700 relative">
                    {/* AI Avatar Placeholder */}
                    <div className={`w-40 h-40 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-10 shadow-lg shadow-purple-500/20 ${isSpeaking ? 'animate-pulse scale-110 duration-700' : ''}`}>
                        <span className="material-symbols-outlined text-6xl text-white">smart_toy</span>
                    </div>

                    <div className="max-w-2xl text-center space-y-6">
                        <div className="inline-block px-4 py-1.5 bg-slate-800 rounded-full text-sm font-medium text-slate-400 mb-4">
                            Câu hỏi {currentQuestionIndex + 1} / {questions.length}
                        </div>
                        
                        <h2 className="text-3xl font-bold leading-tight">
                            {currentQuestion}
                        </h2>
                        
                        <div className="flex items-center justify-center gap-4">
                            <button 
                                onClick={() => isSpeaking ? stopSpeaking() : speakText(currentQuestion)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isSpeaking ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
                            >
                                <span className="material-symbols-outlined">
                                    {isSpeaking ? 'stop_circle' : 'volume_up'}
                                </span>
                                {isSpeaking ? 'Dừng đọc' : 'Nghe câu hỏi'}
                            </button>
                        </div>
                    </div>

                    {/* Answer Area */}
                    <div className="w-full max-w-2xl mt-8">
                        <div className="relative">
                            <textarea 
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Nhập câu trả lời của bạn hoặc bấm Micro để nói..."
                                className="w-full h-32 bg-slate-800 border border-slate-600 rounded-xl p-4 pr-12 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            ></textarea>
                            
                            <button 
                                onClick={toggleListening}
                                className={`absolute bottom-4 right-4 p-2 rounded-full transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-600 hover:bg-slate-500'}`}
                                title="Bấm để nói"
                            >
                                <span className="material-symbols-outlined text-white">
                                    {isListening ? 'mic_off' : 'mic'}
                                </span>
                            </button>
                        </div>
                        {isListening && <p className="text-xs text-red-400 mt-2 text-right">Đang nghe... (Nói tiếng Anh/Việt tùy vào trình duyệt)</p>}
                    </div>

                    {/* Controls */}
                    <div className="mt-8 flex justify-center gap-4">
                        <button 
                            disabled={currentQuestionIndex === 0}
                            onClick={() => {
                                saveAnswer(currentQuestionIndex, userAnswer); // Save current before moving back? Or implies simple navigation. let's save.
                                setCurrentQuestionIndex(prev => prev - 1);
                                setUserAnswer(""); // Should load previous answer if possible. For now, clear.
                                stopSpeaking();
                            }}
                            className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 disabled:opacity-50 transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        
                        {currentQuestionIndex < questions.length - 1 ? (
                            <button 
                                onClick={() => {
                                    saveAnswer(currentQuestionIndex, userAnswer);
                                    setCurrentQuestionIndex(prev => prev + 1);
                                    setUserAnswer("");
                                    stopSpeaking();
                                }}
                                className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 disabled:opacity-50 transition-colors text-white font-bold"
                            >
                                Câu tiếp theo
                                <span className="material-symbols-outlined ml-2 align-middle">arrow_forward</span>
                            </button>
                        ) : (
                            <button 
                                onClick={async () => {
                                    await saveAnswer(currentQuestionIndex, userAnswer);
                                    if (sessionId) {
                                        await interviewService.completeSession(sessionId, "Completed by User");
                                    }
                                    navigate('/history'); // Go to history page after finishing
                                }}
                                className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-full font-bold transition-all shadow-lg hover:shadow-green-500/30"
                            >
                                Hoàn thành & Xem kết quả
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Panel: Context / Notes */}
                <div className="w-full md:w-96 bg-slate-800 p-6 overflow-y-auto hidden md:block">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">description</span>
                        Gợi ý trả lời
                    </h3>
                    
                    <div className="bg-slate-700/50 p-4 rounded-xl text-sm text-slate-300 leading-relaxed mb-6">
                        Dựa trên CV của bạn, hãy tập trung vào các từ khóa: 
                        <div className="flex flex-wrap gap-2 mt-3">
                            {analysisData?.skills?.map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-slate-600 rounded text-xs text-white">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                         <span className="material-symbols-outlined text-yellow-500">lightbulb</span>
                         Tips
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-300">
                        <li className="flex gap-2">
                            <span className="material-symbols-outlined text-xs mt-1">check</span>
                             Sử dụng mô hình STAR (Situation, Task, Action, Result).
                        </li>
                        <li className="flex gap-2">
                            <span className="material-symbols-outlined text-xs mt-1">check</span>
                             Giữ câu trả lời dưới 2 phút.
                        </li>
                        <li className="flex gap-2">
                            <span className="material-symbols-outlined text-xs mt-1">check</span>
                             Đừng ngại yêu cầu làm rõ câu hỏi.
                        </li>
                        <li className="flex gap-2">
                            <span className="material-symbols-outlined text-xs mt-1">tips_and_updates</span>
                             Nếu AI đọc khó nghe, hãy kiểm tra loa và cài đặt giọng nói của trình duyệt.
                        </li>
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default InterviewPage;
