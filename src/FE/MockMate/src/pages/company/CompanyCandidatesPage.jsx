import React, { useEffect, useState } from 'react';
import CompanySidebar from '../../components/CompanySidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService, companyService } from '../../services/api';

const CompanyCandidatesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const filterJobId = queryParams.get('jobId');

    const [user, setUser] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [resultDetails, setResultDetails] = useState(null);

    useEffect(() => {
        const u = authService.getCurrentUser();
        if (!u || u.roleId !== 3) {
            navigate('/login');
        } else {
            setUser(u);
            fetchCandidates();
        }
    }, [navigate, filterJobId]);

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const data = await companyService.getCandidates(filterJobId);
            setCandidates(data);
        } catch (error) {
            console.error("Error fetching candidates", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewResults = async (sessionId) => {
        try {
            const result = await companyService.getCandidateResult(sessionId);
            setSelectedCandidate(result);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to load results.');
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <CompanySidebar />
            <main className="flex-1 ml-64 p-8">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Candidate Pool</h1>
                        <p className="text-slate-500 mt-1">
                            {filterJobId ? 'Viewing candidates for a specific job.' : 'Review results from candidates who took your mock interviews.'}
                        </p>
                    </div>
                    {filterJobId && (
                        <button onClick={() => navigate('/company/candidates')} className="bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-sm">Clear Filter</button>
                    )}
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-4 text-slate-500">Loading candidates...</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500 text-sm">
                                        <th className="py-4 px-4 font-bold">Candidate Name</th>
                                        <th className="py-4 px-4 font-bold">Applied Job</th>
                                        <th className="py-4 px-4 font-bold">Interview Date</th>
                                        <th className="py-4 px-4 font-bold">Status</th>
                                        <th className="py-4 px-4 text-right font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidates.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-slate-500">No candidates found for your jobs.</td>
                                        </tr>
                                    ) : candidates.map(c => (
                                        <tr key={c.sessionId} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-slate-800">{c.candidateName}</div>
                                                <div className="text-xs text-slate-500">{c.candidateEmail}</div>
                                            </td>
                                            <td className="py-4 px-4 text-slate-700 font-medium">{c.jobTitle}</td>
                                            <td className="py-4 px-4 text-slate-500">{new Date(c.interviewDate).toLocaleDateString()}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    c.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                                }`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right space-x-2">
                                                {c.cvUrl && (
                                                    <a href={c.cvUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors material-symbols-outlined ml-1" title="View CV">description</a>
                                                )}
                                                {c.status === 'Completed' && (
                                                    <button onClick={() => handleViewResults(c.sessionId)} className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors material-symbols-outlined ml-1" title="View Interview Results">analytics</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* MODAL for Details */}
                {selectedCandidate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-2xl w-full max-w-4xl p-8 shadow-xl relative max-h-[90vh] overflow-y-auto">
                            <button 
                                onClick={() => setSelectedCandidate(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 material-symbols-outlined"
                            >
                                close
                            </button>
                            
                            <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-800">{selectedCandidate.candidateName}'s Interview</h2>
                                    <p className="text-slate-500 font-medium">Detailed AI Evaluation Report</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-black text-primary">{selectedCandidate.score}/100</div>
                                    <div className="text-sm font-bold text-slate-400">Overall Score</div>
                                </div>
                            </div>
                            
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Overall Feedback</h3>
                                <div className="bg-blue-50 text-blue-900 p-4 rounded-xl leading-relaxed">
                                    {selectedCandidate.overviewFeedback}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 mb-4">Q&A Breakdown</h3>
                            <div className="space-y-6">
                                {selectedCandidate.answers.map((ans, idx) => (
                                    <div key={idx} className="border border-slate-200 rounded-xl p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-slate-800 text-lg w-5/6">
                                                Q{idx + 1}: {ans.question}
                                            </h4>
                                            <span className="font-black text-primary bg-primary/10 px-3 py-1 rounded-lg">
                                                Score: {ans.score}/100
                                            </span>
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-sm font-bold text-slate-500 mb-1">Candidate's Answer:</p>
                                            <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{ans.answer}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-green-600 mb-1">AI Feedback:</p>
                                            <p className="text-slate-700 bg-green-50/50 p-3 rounded-lg">{ans.feedback}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CompanyCandidatesPage;
