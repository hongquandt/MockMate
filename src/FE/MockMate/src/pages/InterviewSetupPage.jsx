import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logoImg from '../assets/img/z7430605225117_544001c3f21b8fc1cb5af11cb46703c0.jpg';

const InterviewSetupPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { analysisData } = location.state || {};
  
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [industry, setIndustry] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [interviewType, setInterviewType] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [language, setLanguage] = useState('Vietnamese');

  const industries = ['IT', 'Marketing', 'Communication', 'Data Science', 'BA'];
  const difficulties = ['Intern', 'Fresher', 'Junior', 'Senior'];
  const interviewTypes = ['Kiến thức', 'Hành vi', 'Tình huống', 'Khác'];
  const languages = ['Vietnamese', 'English'];

  // Keywords available from CV
  const availableKeywords = analysisData?.skills || ['Leadership', 'Problem Solving', 'Communication', 'Teamwork', 'Project Management'];

  useEffect(() => {
    // Select all keywords by default
    setSelectedKeywords(availableKeywords);
  }, []);

  const toggleKeyword = (kw) => {
    if (selectedKeywords.includes(kw)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== kw));
    } else {
      setSelectedKeywords([...selectedKeywords, kw]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!industry || !difficulty || !interviewType || !language) {
      alert('Vui lòng chọn đầy đủ các trường bắt buộc');
      return;
    }
    
    const setupData = {
      keywords: selectedKeywords,
      industry,
      difficulty,
      interviewType,
      jobDescription,
      language
    };

    navigate('/interview', { state: { analysisData: analysisData, setupData } });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center py-10">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="p-8 border-b border-slate-200 dark:border-slate-700 flex items-center gap-4">
             <img src={logoImg} alt="Logo" className="h-10 w-10 rounded-xl" />
             <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cấu hình buổi phỏng vấn</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Thiết lập chi tiết để AI cá nhân hóa câu hỏi sát với thực tế nhất</p>
             </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Keywords from CV */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 flex items-center gap-2">
                 <span className="material-symbols-outlined text-primary text-xl">vpn_key</span>
                 Từ khóa trích xuất từ CV
              </h3>
              <p className="text-xs text-slate-500 mb-4 dark:text-slate-400">Chọn các kỹ năng/từ khóa bạn muốn tập trung vào trong buổi phỏng vấn</p>
              <div className="flex flex-wrap gap-3">
                 {availableKeywords.map((kw, idx) => {
                   const isSelected = selectedKeywords.includes(kw);
                   return (
                     <button
                        type="button"
                        key={idx}
                        onClick={() => toggleKeyword(kw)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border flex items-center gap-1 ${isSelected ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                     >
                       {kw}
                       {isSelected && <span className="material-symbols-outlined text-[14px] leading-none">check</span>}
                     </button>
                   );
                 })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ngành nghề */}
                <div>
                   <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ngành nghề <span className="text-red-500">*</span></label>
                   <select required value={industry} onChange={e => setIndustry(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
                     <option value="" disabled>-- Chọn ngành nghề --</option>
                     {industries.map(ind => (
                       <option key={ind} value={ind}>{ind}</option>
                     ))}
                   </select>
                </div>

                {/* Độ khó */}
                <div>
                   <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Độ khó <span className="text-red-500">*</span></label>
                   <select required value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
                     <option value="" disabled>-- Chọn độ khó --</option>
                     {difficulties.map(diff => (
                       <option key={diff} value={diff}>{diff}</option>
                     ))}
                   </select>
                </div>

                {/* Loại phỏng vấn */}
                <div>
                   <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Loại phỏng vấn <span className="text-red-500">*</span></label>
                   <select required value={interviewType} onChange={e => setInterviewType(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
                     <option value="" disabled>-- Chọn phân loại --</option>
                     {interviewTypes.map(type => (
                       <option key={type} value={type}>{type}</option>
                     ))}
                   </select>
                </div>

                {/* Ngôn ngữ */}
                <div>
                   <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ngôn ngữ <span className="text-red-500">*</span></label>
                   <select required value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
                     {languages.map(lang => (
                       <option key={lang} value={lang}>{lang}</option>
                     ))}
                   </select>
                </div>
            </div>

            {/* Mục mô tả vị trí */}
            <div>
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mô tả về vị trí công việc (JD)</label>
               <textarea 
                 rows="4"
                 value={jobDescription}
                 onChange={e => setJobDescription(e.target.value)}
                 placeholder="Dán hoặc nhập mô tả công việc vào đây. Càng chi tiết, câu hỏi sẽ càng sát với thực tế..."
                 className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
               ></textarea>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700">
               <button 
                 type="button" 
                 onClick={() => navigate(-1)}
                 className="px-6 py-3 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors flex items-center gap-2"
               >
                 <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                 Quay lại
               </button>
               <button 
                 type="submit"
                 className="px-8 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-primary/30 flex items-center gap-2 transform transition-all hover:-translate-y-0.5"
               >
                 Bắt đầu Phỏng vấn
                 <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
               </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewSetupPage;
