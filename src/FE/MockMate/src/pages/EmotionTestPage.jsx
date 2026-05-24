import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/img/z7430605225117_544001c3f21b8fc1cb5af11cb46703c0.jpg';

const EmotionTestPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isTesting, setIsTesting] = useState(false);
  const [emotion, setEmotion] = useState(null);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [history, setHistory] = useState([]);

  // Khởi động Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setError('');
      }
    } catch (err) {
      console.error("Lỗi truy cập camera:", err);
      setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
      setCameraActive(false);
    }
  };

  // Tắt Camera
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsTesting(false);
  }, []);

  useEffect(() => {
    // Clean up camera on unmount
    return () => stopCamera();
  }, [stopCamera]);

  // Gửi ảnh frame tới Backend Python
  const detectEmotion = async () => {
    if (!videoRef.current || !canvasRef.current || !isTesting) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const video = videoRef.current;

    // Vẽ frame hiện tại từ video lên canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Lấy ảnh dạng base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    try {
      // Gọi tới Flask API đang chạy ở port 5000 (app.py)
      const response = await fetch('http://localhost:5000/detect-emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      const data = await response.json();

      if (data.success && data.result) {
        const result = data.result;
        setEmotion(result);
        
        // Cập nhật lịch sử test để vẽ biểu đồ hoặc phân tích
        setHistory(prev => {
          const newHistory = [...prev, {
            time: new Date().toLocaleTimeString(),
            emotion: result.emotion_vi,
            confidence: result.confidence,
            isPsychologicalIssue: result.isPsychologicalIssue
          }].slice(-20); // Lưu 20 kết quả gần nhất
          return newHistory;
        });
      } else if (data.message === 'No face detected') {
         // Xử lý khi không thấy mặt
      } else if (data.error) {
         console.error("API Error:", data.error);
         // Không throw lỗi liên tục để tránh dừng stream, chỉ log
      }
    } catch (error) {
      console.error("Lỗi kết nối tới Backend:", error);
      if (isTesting) {
          setError('Không thể kết nối với hệ thống phân tích AI. Vui lòng đảm bảo Backend Python (app.py) đang chạy ở port 5000.');
          setIsTesting(false);
      }
    }
  };

  // Vòng lặp test
  useEffect(() => {
    let intervalId;
    if (isTesting && cameraActive) {
      intervalId = setInterval(() => {
        detectEmotion();
      }, 1000); // Gửi frame mỗi giây
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTesting, cameraActive]);

  const toggleTest = () => {
    if (!cameraActive) {
      startCamera().then(() => {
        setIsTesting(true);
      });
    } else {
      setIsTesting(!isTesting);
      if (!isTesting) {
         setError('');
      }
    }
  };

  // Đánh giá tâm lý tổng quan
  const calculatePsychologicalStatus = () => {
      if (history.length === 0) return { status: 'Chưa có dữ liệu', color: 'text-slate-500' };
      
      const issues = history.filter(h => h.isPsychologicalIssue).length;
      const ratio = issues / history.length;
      
      if (ratio > 0.6) return { status: 'Dấu hiệu tâm lý bất ổn (Căng thẳng/Sợ hãi cao)', color: 'text-red-500', advice: 'Ứng viên có biểu hiện căng thẳng, sợ hãi hoặc tiêu cực thường xuyên. Cần hỗ trợ tâm lý hoặc thay đổi cách đặt câu hỏi nhẹ nhàng hơn.' };
      if (ratio > 0.3) return { status: 'Có chút căng thẳng', color: 'text-orange-500', advice: 'Ứng viên đôi lúc thể hiện sự lo âu. Đây là bình thường trong phỏng vấn nhưng cần theo dõi.' };
      return { status: 'Tâm lý ổn định', color: 'text-green-500', advice: 'Ứng viên giữ được bình tĩnh và thái độ tích cực hoặc trung lập tốt trong suốt quá trình.' };
  };

  const status = calculatePsychologicalStatus();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar - Simplified */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
        <div className="p-6 flex items-center gap-3">
             <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg"/>
             <span className="font-bold text-xl dark:text-white">MockMate</span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl font-medium transition-colors">
                <span className="material-symbols-outlined">dashboard</span>
                Dashboard
            </Link>
            <Link to="/emotion-test" className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl font-medium">
                <span className="material-symbols-outlined">psychology</span>
                Test Tâm Lý (AI)
            </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Đánh giá Tâm lý Ứng viên</h1>
                <p className="text-slate-500 dark:text-slate-400">Phát hiện cảm xúc qua Camera sử dụng AI (YOLO / Keras)</p>
            </div>
        </header>

        {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl flex items-center gap-3 border border-red-200">
                <span className="material-symbols-outlined">warning</span>
                <p>{error}</p>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Camera View */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">videocam</span>
                        Camera
                    </h2>
                    <div className="flex gap-2">
                        {!cameraActive && (
                            <button onClick={startCamera} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition">
                                Bật Camera
                            </button>
                        )}
                        <button 
                            onClick={toggleTest}
                            className={`px-4 py-2 text-white rounded-lg text-sm font-bold shadow transition flex items-center gap-2 ${
                                isTesting ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-dark'
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm">{isTesting ? 'stop_circle' : 'play_circle'}</span>
                            {isTesting ? 'Dừng Test' : 'Bắt đầu Test Cảm xúc'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden relative min-h-[400px] flex items-center justify-center border border-slate-800">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`}
                    ></video>
                    
                    {/* Canvas ẩn để chụp frame */}
                    <canvas ref={canvasRef} width={640} height={480} className="hidden" />

                    {!cameraActive && (
                        <div className="text-center text-slate-500">
                            <span className="material-symbols-outlined text-5xl mb-2">videocam_off</span>
                            <p>Camera đang tắt</p>
                        </div>
                    )}
                    
                    {isTesting && (
                        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            AI Đang phân tích
                        </div>
                    )}
                </div>
            </div>

            {/* Results View */}
            <div className="flex flex-col gap-6">
                {/* Current Emotion */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-purple-500">mood</span>
                        Cảm xúc hiện tại
                    </h2>
                    
                    {emotion ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className={`text-5xl mb-4 ${emotion.isPsychologicalIssue ? 'text-red-500' : 'text-green-500'}`}>
                                {emotion.emotion_vi === 'Hạnh phúc' && '😄'}
                                {emotion.emotion_vi === 'Buồn' && '😢'}
                                {emotion.emotion_vi === 'Giận dữ' && '😠'}
                                {emotion.emotion_vi === 'Sợ hãi' && '😨'}
                                {emotion.emotion_vi === 'Ghê sợ' && '🤢'}
                                {emotion.emotion_vi === 'Bất ngờ' && '😲'}
                                {emotion.emotion_vi === 'Trung lập' && '😐'}
                            </div>
                            <h3 className="text-2xl font-bold dark:text-white">{emotion.emotion_vi}</h3>
                            <p className="text-slate-500 mt-2">Độ tin cậy: {(emotion.confidence * 100).toFixed(1)}%</p>
                            
                            {emotion.isPsychologicalIssue && (
                                <div className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined">warning</span>
                                    Cảnh báo cảm xúc tiêu cực
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                            <span className="material-symbols-outlined text-5xl mb-3 opacity-50">face</span>
                            <p>{isTesting ? 'Đang chờ phát hiện khuôn mặt...' : 'Chưa có dữ liệu'}</p>
                        </div>
                    )}
                </div>

                {/* Overall Assessment */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex-1">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-blue-500">monitoring</span>
                        Đánh giá Tâm lý Tổng quan
                    </h2>
                    
                    <div className="mb-6">
                        <h3 className={`text-xl font-bold mb-2 ${status.color}`}>{status.status}</h3>
                        {status.advice && <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{status.advice}</p>}
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Lịch sử (20 giây gần nhất)</h4>
                        <div className="flex flex-wrap gap-2">
                            {history.length > 0 ? history.map((h, i) => (
                                <span 
                                    key={i} 
                                    className={`px-2 py-1 text-xs rounded-md font-medium ${
                                        h.isPsychologicalIssue ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                    }`}
                                    title={`Độ tin cậy: ${(h.confidence * 100).toFixed(0)}%`}
                                >
                                    {h.emotion}
                                </span>
                            )) : (
                                <p className="text-sm text-slate-400">Đang thu thập dữ liệu...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Backend Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-sm text-blue-800 dark:text-blue-200">
            <h4 className="font-bold flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined">info</span>
                Hướng dẫn chạy Backend AI
            </h4>
            <p className="mb-2">Tính năng này yêu cầu chạy model Keras AI cục bộ. Bạn cần làm các bước sau:</p>
            <ol className="list-decimal pl-5 space-y-1">
                <li>Cài đặt Python và chạy lệnh: <code className="bg-white dark:bg-slate-800 px-1 rounded border border-blue-100">pip install -r requirements.txt</code> trong thư mục <b>FE/emotion-detection</b></li>
                <li>Chạy server Python: <code className="bg-white dark:bg-slate-800 px-1 rounded border border-blue-100">python app.py</code></li>
                <li>Backend sẽ chạy ở cổng 5000 và tính năng này sẽ hoạt động.</li>
            </ol>
        </div>

      </main>
    </div>
  );
};

export default EmotionTestPage;
