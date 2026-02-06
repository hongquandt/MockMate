import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/img/z7430605225117_544001c3f21b8fc1cb5af11cb46703c0.jpg';

const InterviewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { analysisData } = location.state || {};
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const questions = analysisData?.interviewQuestions || [
        "Please introduce yourself.",
        "What are your greatest strengths?",
        "Why do you want to work here?"
    ];

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            {/* Header */}
            <header className="px-8 py-4 flex items-center justify-between border-b border-slate-700 bg-slate-800">
                <div className="flex items-center gap-3">
                    <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg" />
                    <span className="font-bold text-xl">MockMate Live Interview</span>
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
                    <div className="w-40 h-40 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-10 shadow-lg shadow-purple-500/20 animate-pulse">
                        <span className="material-symbols-outlined text-6xl text-white">smart_toy</span>
                    </div>

                    <div className="max-w-2xl text-center space-y-6">
                        <div className="inline-block px-4 py-1.5 bg-slate-800 rounded-full text-sm font-medium text-slate-400 mb-4">
                            Câu hỏi {currentQuestionIndex + 1} / {questions.length}
                        </div>
                        
                        <h2 className="text-3xl font-bold leading-tight">
                            {currentQuestion}
                        </h2>
                        
                        <p className="text-slate-400">
                            Hãy trả lời to, rõ ràng. AI đang lắng nghe...
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
                        <button 
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 disabled:opacity-50 transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        
                        <button className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20 transition-all hover:scale-105">
                            <span className="material-symbols-outlined text-3xl">mic</span>
                        </button>

                        <button 
                            disabled={currentQuestionIndex === questions.length - 1}
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 disabled:opacity-50 transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* Right Panel: Context / Notes */}
                <div className="w-full md:w-96 bg-slate-800 p-6 overflow-y-auto">
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
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default InterviewPage;
