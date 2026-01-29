import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { uploadService } from '../services/uploadService';
import { pdfService } from '../services/pdfService';
import { aiService } from '../services/aiService';
import logoImg from '../assets/img/z7430605225117_544001c3f21b8fc1cb5af11cb46703c0.jpg';

const DashboardPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const fileInputRef = useRef(null);
  
  // Clean up URL on unmount
  useEffect(() => {
      return () => {
          if (uploadUrl && !uploadUrl.startsWith('http')) {
              URL.revokeObjectURL(uploadUrl);
          }
      }
  }, [uploadUrl]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const selectedFile = e.dataTransfer.files[0];
    validateAndSetFile(selectedFile);
  };
  
  const validateAndSetFile = (selectedFile) => {
      if (selectedFile) {
        if (selectedFile.type !== 'application/pdf') {
          setError('Vui lòng chỉ tải lên file PDF.');
          setFile(null);
          return;
        }
        if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
          setError('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
          setFile(null);
          return;
        }
        setFile(selectedFile);
        
        // Create local preview URL immediately for better UX
        const localUrl = URL.createObjectURL(selectedFile);
        setUploadUrl(localUrl);
        
        setError('');
        setAnalysis(null);
        setUploadProgress(0);
      }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setUploadProgress(10); 

    try {
      // 1. Upload to Cloudinary
      // Fake progress for UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 60));
      }, 300);

      const data = await uploadService.uploadFile(file);
      clearInterval(progressInterval);
      setUploadProgress(70);
      
      const realUrl = data.secure_url;
      // Update with real Cloudinary URL
      setUploadUrl(realUrl);
      
      // 2. Extract Text locally (using the file object directly avoids CORS issues usually)
      // We can use the file reader with pdf.js
      const arrayBuffer = await file.arrayBuffer();
      const text = await pdfService.extractText(arrayBuffer);
      setUploadProgress(85);
      
      // 3. Analyze with AI
      const aiResult = await aiService.analyzeCv(text);
      setAnalysis(aiResult);
      setUploadProgress(100);
      
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra trong quá trình xử lý.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveFile = () => {
    setFile(null);
    setUploadUrl('');
    setAnalysis(null);
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar - Simplified */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
        <div className="p-6 flex items-center gap-3">
             <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg"/>
             <span className="font-bold text-xl dark:text-white">MockMate</span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl font-medium">
                <span className="material-symbols-outlined">dashboard</span>
                Dashboard
            </Link>
            <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl font-medium transition-colors">
                <span className="material-symbols-outlined">person</span>
                Profile
            </Link>
             <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl font-medium transition-colors">
                <span className="material-symbols-outlined">home</span>
                Trang chủ
            </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400">Quản lý CV và lộ trình phỏng vấn của bạn</p>
            </div>
             <div className="flex items-center gap-4">
                 {/* User info normally here */}
            </div>
        </header>

        {/* Upload Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">upload_file</span>
                Tải lên CV (PDF)
            </h2>

            {!uploadUrl ? (
                <div 
                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                        file ? 'border-primary bg-primary/5' : 'border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="application/pdf"
                        className="hidden" 
                    />
                    
                    {!file ? (
                        <>
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl text-slate-400">cloud_upload</span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Kéo thả CV vào đây</h3>
                            <p className="text-slate-500 text-sm mb-6">hoặc</p>
                            <button 
                                onClick={() => fileInputRef.current.click()}
                                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/20"
                            >
                                Chọn file từ máy
                            </button>
                            <p className="text-xs text-slate-400 mt-4">Hỗ trợ định dạng PDF. Tối đa 5MB.</p>
                        </>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                            </div>
                            <p className="font-semibold text-slate-900 dark:text-white text-lg mb-1">{file.name}</p>
                            <p className="text-slate-500 text-sm mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleUpload}
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/20 disabled:opacity-70"
                                >
                                    {loading ? 'Đang tải lên...' : 'Tải lên ngay'}
                                </button>
                                <button 
                                    onClick={handleRemoveFile}
                                    disabled={loading}
                                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors"
                                >
                                    Hủy
                                </button>
                            </div>
                            
                            {/* Progress Bar */}
                            {loading && (
                                <div className="w-full max-w-xs mt-6">
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-center text-slate-500 mt-2">{uploadProgress}%</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    {/* File Info & Action */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">{file?.name || 'CV Document.pdf'}</p>
                                <a href={uploadUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                    Mở trong tab mới
                                </a>
                            </div>
                        </div>
                        <div className="flex gap-3">
                             <button 
                                onClick={handleUploadAndAnalyze}
                                disabled={loading || analysis}
                                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {loading ? 'Đang phân tích...' : analysis ? 'Đã phân tích' : 'Phân tích AI'}
                            </button>
                            <button 
                                onClick={handleRemoveFile}
                                className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors"
                            >
                                Xóa file
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* PDF Viewer */}
                        <div className="h-[600px] bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <object 
                                data={uploadUrl} 
                                type="application/pdf" 
                                className="w-full h-full"
                                title="PDF Preview"
                            >
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 p-4 text-center">
                                    <span className="material-symbols-outlined text-4xl mb-2 text-slate-400">sentiment_dissatisfied</span>
                                    <p>Trình duyệt của bạn không hỗ trợ xem PDF trực tiếp trong khung này.</p>
                                    <a 
                                        href={uploadUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-primary font-bold hover:underline"
                                    >
                                        Nhấn vào đây để xem hoặc tải xuống file PDF
                                    </a>
                                </div>
                            </object>
                        </div>

                        {/* AI Analysis Result */}
                        <div className="flex flex-col gap-6">
                            {loading && (
                                <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI đang phân tích CV...</h3>
                                    <p className="text-slate-500">Quá trình này có thể mất vài giây.</p>
                                    <div className="w-full max-w-xs mt-6 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                </div>
                            )}

                            {analysis && (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                                            <span className="material-symbols-outlined text-xl">auto_awesome</span>
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Kết quả phân tích</h2>
                                        <div className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                                            {analysis.matchScore}/100
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Tóm tắt</h4>
                                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                                {analysis.summary}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Điểm mạnh</h4>
                                            <ul className="space-y-2">
                                                {analysis.strengths?.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                        <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Cần cải thiện</h4>
                                            <ul className="space-y-2">
                                                {analysis.weaknesses?.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                        <span className="material-symbols-outlined text-orange-500 text-lg">warning</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {!loading && !analysis && (
                                <div className="h-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-8 text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">analytics</span>
                                    <p className="text-slate-500">Nhấn "Phân tích AI" để xem đánh giá chi tiết về CV này.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
