import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewService } from '../services/api';
import { trackViewHistory } from '../services/analytics';
import logoImg from '../assets/img/z7430605225117_544001c3f21b8fc1cb5af11cb46703c0.jpg';

const HistoryPage = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        trackViewHistory(); // GA4 Event
        loadHistory();
    }, []);

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

    const handleViewDetails = async (id) => {
        setDetailLoading(true);
        try {
            const data = await interviewService.getSessionDetails(id);
            // Parse CV Analysis JSON if it's a string
            if (typeof data.cvAnalysisJson === 'string') {
                try {
                    data.cvAnalysisData = JSON.parse(data.cvAnalysisJson);
                } catch (e) {
                    console.error("Error parsing CV Analysis JSON", e);
                    data.cvAnalysisData = {};
                }
            }
            setSelectedSession(data);
        } catch (error) {
            console.error("Failed to load details", error);
        } finally {
            setDetailLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">
            {/* Header */}
            <header className="px-8 py-4 flex items-center justify-between border-b border-slate-700 bg-slate-800">
                <div className="flex items-center gap-3">
                    <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg" />
                    <span className="font-bold text-xl">Lịch Sử Phỏng Vấn</span>
                </div>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span> Quay lại Dashboard
                </button>
            </header>

            <main className="p-8 max-w-6xl mx-auto">
                {loading ? (
                    <div className="text-center py-20 text-slate-400">Đang tải lịch sử...</div>
                ) : history.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">Chưa có lịch sử phỏng vấn nào.</div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {history.map((session) => (
                            <div 
                                key={session.id} 
                                onClick={() => handleViewDetails(session.id)}
                                className="bg-slate-800 p-6 rounded-xl hover:bg-slate-700 cursor-pointer transition-all border border-slate-700 hover:border-purple-500/50"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold">
                                        ID: {session.id}
                                    </div>
                                    <span className={`text-xs ${session.status === 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {session.status === 1 ? 'Hoàn thành' : 'Đang xử lý'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg mb-2">Phỏng vấn Vị trí #{session.jobPosition}</h3>
                                <p className="text-slate-400 text-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                                    {formatDate(session.startedAt)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Detail Modal */}
            {selectedSession && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-700/50">
                            <h2 className="text-2xl font-bold">Chi tiết Phiên Phỏng Vấn #{selectedSession.id}</h2>
                            <button 
                                onClick={() => setSelectedSession(null)}
                                className="p-2 hover:bg-slate-600 rounded-full"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-8">
                            {/* CV Analysis Section */}
                            {selectedSession.cvAnalysisData && (
                                <section>
                                    <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined">analytics</span>
                                        Đánh giá CV
                                    </h3>
                                    <div className="bg-slate-900Item p-4 rounded-xl border border-slate-700 bg-slate-900/50">
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <span className="text-slate-400 text-sm">Điểm phù hợp:</span>
                                                <div className="text-2xl font-bold text-green-400">
                                                    {selectedSession.cvAnalysisData.matchScore}/100
                                                </div>
                                            </div>
                                            <div>
                                                 <span className="text-slate-400 text-sm">Vị trí gợi ý:</span>
                                                 <div className="font-medium">{selectedSession.cvAnalysisData.summary}</div>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-bold text-sm text-green-400 mb-2">Điểm mạnh</h4>
                                                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                                                    {selectedSession.cvAnalysisData.strengths?.map((s, i) => (
                                                        <li key={i}>{s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-red-400 mb-2">Điểm yếu / Góp ý</h4>
                                                 <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                                                    {selectedSession.cvAnalysisData.weaknesses?.map((s, i) => (
                                                        <li key={i}>{s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Q&A Section */}
                            <section>
                                <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined">forum</span>
                                    Lịch sử Câu hỏi & Trả lời
                                </h3>
                                <div className="space-y-4">
                                    {selectedSession.questions?.map((q, index) => (
                                        <div key={index} className="bg-slate-700/30 p-4 rounded-xl border border-slate-700">
                                            <p className="font-bold text-white mb-2">Q{index + 1}: {q.questionContent}</p>
                                            
                                            {q.answerContent ? (
                                                <div className="bg-slate-800 p-3 rounded-lg text-slate-300 text-sm mt-2">
                                                    <span className="text-xs text-slate-500 block mb-1">Trả lời của bạn:</span>
                                                    {q.answerContent}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-red-400 italic mt-2">Chưa trả lời</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
