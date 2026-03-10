import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService } from '../services/api';

const CvHistoryPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    useEffect(() => {
        if (id && history.length > 0) {
            handleSelectSession(id);
        }
    }, [id, history]);

    const loadHistory = async () => {
        try {
            const data = await interviewService.getHistory();
            setHistory(data);
        } catch (error) {
            console.error("Failed to load history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSession = async (sessionId) => {
        setDetailLoading(true);
        try {
            const data = await interviewService.getSessionDetails(sessionId);
            // Parse CV Analysis
            if (typeof data.cvAnalysisJson === 'string') {
                try {
                    data.cvAnalysisData = JSON.parse(data.cvAnalysisJson);
                } catch (e) {
                    console.error("Error parsing CV Analysis", e);
                }
            }
            setSelectedSession(data);
        } catch (error) {
            console.error("Failed to load session details", error);
        } finally {
            setDetailLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/profile')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600">article</span>
                        Lịch sử Đánh giá CV & Phỏng vấn
                    </h1>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar List */}
                <aside className="w-1/3 min-w-[300px] bg-white border-r border-slate-200 overflow-y-auto hidden md:block">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Đang tải...</div>
                    ) : history.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">Chưa có dữ liệu.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {history.map(session => {
                                let score = 0;
                                try {
                                    if(session.cvAnalysisJson) {
                                        const parsed = JSON.parse(session.cvAnalysisJson);
                                        score = parsed.matchScore || parsed.MatchScore || 0;
                                    }
                                } catch(e){}

                                return (
                                    <div 
                                        key={session.id}
                                        onClick={() => navigate(`/cv-history/${session.id}`)}
                                        className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 ${String(session.id) === id ? 'bg-purple-50 border-l-4 border-purple-600' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-slate-800 line-clamp-1">{session.jobPosition || `Session #${session.id}`}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${score >= 80 ? 'bg-green-100 text-green-700' : score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {score}/100
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                                            <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                                            {new Date(session.startedAt).toLocaleDateString('vi-VN')}
                                        </div>
                                        <div className="flex gap-2">
                                            {session.status === 1 ? (
                                                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100">Đã hoàn thành</span>
                                            ) : (
                                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">Đang thực hiện</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
                    {!id ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-6xl mb-4 text-slate-300">plagiarism</span>
                            <p>Chọn một phiên làm việc để xem chi tiết đánh giá CV</p>
                        </div>
                    ) : detailLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <span className="material-symbols-outlined animate-spin text-4xl text-purple-600">progress_activity</span>
                        </div>
                    ) : selectedSession && selectedSession.cvAnalysisData ? (
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Summary Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Kết quả đánh giá CV</h2>
                                        <p className="text-slate-500">Vị trí: <span className="font-semibold text-purple-600">{selectedSession.jobPosition?.title || "N/A"}</span></p>
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-4xl font-bold ${selectedSession.cvAnalysisData.matchScore >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {selectedSession.cvAnalysisData.matchScore}
                                        </div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Điểm phù hợp</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
                                    <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-500">info</span>
                                        Nhận xét tổng quan
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed text-sm">
                                        {selectedSession.cvAnalysisData.summary}
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                                            <span className="material-symbols-outlined">check_circle</span>
                                            Điểm mạnh
                                        </h3>
                                        <ul className="space-y-2">
                                            {selectedSession.cvAnalysisData.strengths?.map((item, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm text-slate-700 bg-green-50/50 p-2 rounded-lg">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2">
                                            <span className="material-symbols-outlined">warning</span>
                                            Điểm cần cải thiện
                                        </h3>
                                        <ul className="space-y-2">
                                            {selectedSession.cvAnalysisData.weaknesses?.map((item, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm text-slate-700 bg-red-50/50 p-2 rounded-lg">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Interview Q&A Preview */}
                            {selectedSession.questions && selectedSession.questions.length > 0 && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-orange-500">forum</span>
                                        Câu hỏi phỏng vấn đã trả lời
                                    </h3>
                                    
                                    {selectedSession.overallFeedback && selectedSession.overallFeedback !== "Completed by User" && selectedSession.overallFeedback !== "Interview Started" && (
                                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                                            <h4 className="font-bold text-purple-700 mb-2 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">stars</span>
                                                Nhận xét tổng quan buổi phỏng vấn
                                                {selectedSession.totalScore != null && (
                                                    <span className="ml-auto bg-purple-600 text-white px-2 py-0.5 rounded text-xs">
                                                        Điểm: {selectedSession.totalScore}/10
                                                    </span>
                                                )}
                                            </h4>
                                            <p className="text-sm text-slate-700 leading-relaxed">{selectedSession.overallFeedback}</p>
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        {selectedSession.questions.map((q, idx) => (
                                            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                                <p className="font-bold text-slate-800 text-sm mb-3">
                                                    Q{idx+1}: {q.questionContent}
                                                </p>
                                                
                                                <div className="bg-white border border-slate-100 p-3 rounded-lg mb-3">
                                                    <span className="text-xs font-bold text-slate-400 uppercase mb-1 block">Câu trả lời của bạn:</span>
                                                    <p className="text-sm text-slate-600">
                                                        {q.answerContent || <span className="italic text-slate-400">Không có câu trả lời</span>}
                                                    </p>
                                                </div>

                                                {q.aiFeedback && (
                                                    <div className="bg-green-50 border border-green-100 p-3 rounded-lg flex items-start flex-col gap-2">
                                                        <div className="flex items-center justify-between w-full">
                                                            <span className="text-xs font-bold text-green-700 uppercase flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                                                                AI Đánh giá
                                                            </span>
                                                            {q.score != null && (
                                                                <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-0.5 rounded">
                                                                    {q.score}/10
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-green-900">{q.aiFeedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-20">Không tìm thấy dữ liệu đánh giá CV.</div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CvHistoryPage;
