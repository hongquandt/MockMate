import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/img/z7430605225117_544001c3f21b8fc1cb5af11cb46703c0.jpg';

const TtsTestPage = () => {
  const [text, setText] = useState('Xin chào, tôi là AI phỏng vấn của MockMate. Hãy bắt đầu buổi phỏng vấn nào!');
  const [status, setStatus] = useState('');
  const [logs, setLogs] = useState([]);
  const [isTesting, setIsTesting] = useState(false);
  const audioRef = useRef(null);

  const addLog = (type, msg) => {
    const time = new Date().toLocaleTimeString('vi-VN');
    setLogs(prev => [...prev, { type, msg, time }]);
  };

  const clearLogs = () => setLogs([]);

  // ======= TEST 1: Browser built-in TTS =======
  const testBrowserTTS = () => {
    clearLogs();
    addLog('info', 'Đang thử giọng trình duyệt (Browser SpeechSynthesis)...');
    if (!('speechSynthesis' in window)) {
      addLog('error', 'Trình duyệt KHÔNG hỗ trợ SpeechSynthesis!');
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    const viVoices = voices.filter(v => v.lang.startsWith('vi'));
    addLog('info', `Tìm thấy ${voices.length} giọng tổng cộng, ${viVoices.length} giọng Tiếng Việt.`);
    if (viVoices.length > 0) {
      addLog('success', `Giọng Tiếng Việt: ${viVoices.map(v => v.name).join(', ')}`);
    } else {
      addLog('warn', 'Không có giọng Tiếng Việt nào! Sẽ đọc bằng giọng mặc định.');
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    if (viVoices.length > 0) utterance.voice = viVoices[0];
    utterance.onstart = () => { setStatus('🔊 Đang phát...'); addLog('success', 'Audio bắt đầu phát!'); };
    utterance.onend = () => { setStatus('✅ Hoàn thành'); addLog('success', 'Audio kết thúc bình thường.'); };
    utterance.onerror = (e) => { setStatus('❌ Lỗi'); addLog('error', 'Lỗi SpeechSynthesis: ' + e.error); };
    window.speechSynthesis.speak(utterance);
    setStatus('🔄 Đang xử lý...');
  };

  // ======= TEST 2: ElevenLabs =======
  const testElevenLabs = async () => {
    clearLogs();
    setIsTesting(true);
    setStatus('🔄 Đang kiểm tra ElevenLabs...');

    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    addLog('info', `VITE_ELEVENLABS_API_KEY = "${apiKey}"`);

    if (!apiKey || apiKey === 'your_key_here' || apiKey.trim() === '') {
      addLog('error', '❌ API Key TRỐNG hoặc chưa điền! Hãy kiểm tra file .env');
      setStatus('❌ Thiếu API Key');
      setIsTesting(false);
      return;
    }

    try {
      // Bước 1: Lấy danh sách voices từ tài khoản
      addLog('info', 'Bước 1: Đang lấy danh sách voices từ tài khoản...');
      const voicesRes = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': apiKey }
      });

      if (!voicesRes.ok) {
        const errText = await voicesRes.text();
        addLog('error', `❌ Không lấy được danh sách voices: ${voicesRes.status} - ${errText}`);
        setStatus('❌ Lỗi lấy voices');
        setIsTesting(false);
        return;
      }

      const voicesData = await voicesRes.json();
      const voices = voicesData.voices || [];
      addLog('info', `Tìm thấy ${voices.length} voices trong tài khoản.`);

      if (voices.length === 0) {
        addLog('error', '❌ Không có voice nào trong tài khoản ElevenLabs!');
        setStatus('❌ Không có voices');
        setIsTesting(false);
        return;
      }

      // Log tất cả voices có sẵn
      voices.forEach((v, i) => {
        addLog('info', `  Voice ${i + 1}: "${v.name}" (ID: ${v.voice_id})`);
      });

      // Bước 2: Chọn voice phù hợp
      const preferredNames = ['Rachel', 'Josh', 'Adam', 'Bella', 'Antoni', 'Elli', 'Sam'];
      let selectedVoice = voices.find(v => preferredNames.some(name => v.name.includes(name))) || voices[0];
      addLog('success', `✅ Đã chọn voice: "${selectedVoice.name}" (ID: ${selectedVoice.voice_id})`);

      // Bước 3: Gọi TTS API
      addLog('info', 'Bước 3: Đang gọi API text-to-speech...');
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice.voice_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.7 },
        }),
      });

      addLog('info', `Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errText = await response.text();
        addLog('error', `❌ API trả về lỗi: ${errText}`);
        setStatus(`❌ Lỗi ${response.status}`);
        setIsTesting(false);
        return;
      }

      addLog('success', '✅ API gọi thành công! Đang tạo audio...');
      const blob = await response.blob();
      addLog('info', `Audio blob size: ${blob.size} bytes, type: ${blob.type}`);

      const url = URL.createObjectURL(blob);

      // Unlock autoplay
      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      await audioRef.current.play().catch(() => {});

      audioRef.current.src = url;
      audioRef.current.onplay = () => { setStatus('🔊 Đang phát giọng ElevenLabs...'); addLog('success', '🔊 Audio đang phát!'); };
      audioRef.current.onended = () => { setStatus('✅ Hoàn thành!'); addLog('success', '✅ ElevenLabs hoạt động hoàn hảo!'); URL.revokeObjectURL(url); };
      audioRef.current.onerror = (e) => { setStatus('❌ Lỗi phát audio'); addLog('error', 'Lỗi phát audio: ' + JSON.stringify(e)); };

      await audioRef.current.play();
    } catch (err) {
      addLog('error', `❌ Network/Fetch Error: ${err.message}`);
      setStatus('❌ Lỗi kết nối');
    } finally {
      setIsTesting(false);
    }
  };

  // ======= TEST 3: FPT AI =======
  const testFptAI = async () => {
    clearLogs();
    setIsTesting(true);
    setStatus('🔄 Đang kiểm tra FPT AI...');

    const apiKey = import.meta.env.VITE_FPT_TTS_API_KEY;
    addLog('info', `VITE_FPT_TTS_API_KEY = "${apiKey}"`);

    if (!apiKey) {
      addLog('error', '❌ API Key FPT TRỐNG!');
      setStatus('❌ Thiếu API Key FPT');
      setIsTesting(false);
      return;
    }

    try {
      addLog('info', 'Đang gọi API FPT.AI...');
      const response = await fetch('https://api.fpt.ai/hmi/tts/v5', {
        method: 'POST',
        headers: { 'api-key': apiKey, 'voice': 'banmai' },
        body: text,
      });
      const data = await response.json();
      addLog('info', `FPT Response: ${JSON.stringify(data)}`);

      if (data.error !== 0 || !data.async) {
        addLog('error', `❌ FPT trả về lỗi: ${data.message}`);
        setStatus('❌ FPT API lỗi');
        setIsTesting(false);
        return;
      }

      addLog('success', `✅ FPT trả về URL: ${data.async}`);
      addLog('info', '⏳ Đang chờ 3 giây để FPT render audio...');

      // Unlock autoplay
      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      await audioRef.current.play().catch(() => {});

      // Chờ 3 giây để FPT render file audio (CORS block HEAD request nên không poll được)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Dùng Audio element để load trực tiếp — không bị CORS block
      addLog('info', 'Đang thử load audio trực tiếp...');

      const tryPlayAudio = (url, attempt, maxRetries) => {
        addLog('info', `Lần thử ${attempt}/${maxRetries}: Đang load ${url.substring(0, 60)}...`);
        
        audioRef.current.src = url;
        
        audioRef.current.oncanplaythrough = () => {
          addLog('success', '✅ Audio sẵn sàng! Đang phát...');
          audioRef.current.oncanplaythrough = null; // cleanup
          setStatus('🔊 Đang phát giọng FPT Ban Mai...');
          audioRef.current.play().catch(e => {
            addLog('error', `❌ Lỗi autoplay: ${e.message}`);
          });
        };

        audioRef.current.onended = () => {
          setStatus('✅ FPT AI hoàn thành!');
          addLog('success', '✅ FPT AI hoạt động hoàn hảo!');
          setIsTesting(false);
        };

        audioRef.current.onerror = () => {
          if (attempt < maxRetries) {
            addLog('warn', `Lần ${attempt}: File chưa sẵn sàng, thử lại sau 2 giây...`);
            setTimeout(() => tryPlayAudio(url, attempt + 1, maxRetries), 2000);
          } else {
            addLog('error', `❌ Timeout: File audio FPT không sẵn sàng sau ${maxRetries} lần thử.`);
            setStatus('❌ FPT Timeout');
            setIsTesting(false);
          }
        };

        // Trigger load
        audioRef.current.load();
      };

      tryPlayAudio(data.async, 1, 10);

    } catch (err) {
      addLog('error', `❌ FPT Network Error: ${err.message}`);
      setStatus('❌ Lỗi kết nối FPT');
      setIsTesting(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    window.speechSynthesis.cancel();
    setStatus('⏹ Đã dừng');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
        <div className="p-6 flex items-center gap-3">
          <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg" />
          <span className="font-bold text-xl dark:text-white">MockMate</span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl font-medium transition-colors">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl font-medium transition-colors">
            <span className="material-symbols-outlined">person</span>
            Profile
          </Link>
          <Link to="/emotion-test" className="flex items-center gap-3 px-4 py-3 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl font-medium transition-colors">
            <span className="material-symbols-outlined">psychology</span>
            Test Tâm Lý (AI)
          </Link>
          <Link to="/tts-test" className="flex items-center gap-3 px-4 py-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-xl font-medium">
            <span className="material-symbols-outlined">volume_up</span>
            Test Giọng Nói
          </Link>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl font-medium transition-colors">
            <span className="material-symbols-outlined">home</span>
            Trang chủ
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-green-500">volume_up</span>
            Kiểm tra Tích hợp Giọng Nói
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Dùng trang này để debug và xác nhận API giọng nói nào đang hoạt động</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Controls */}
          <div className="space-y-6">

            {/* Text Input */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-3">Nội dung cần đọc</h2>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={4}
                className="w-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Status */}
            {status && (
              <div className="bg-slate-800 text-white px-5 py-3 rounded-xl font-mono text-sm flex items-center gap-2">
                <span className="text-green-400">STATUS:</span> {status}
              </div>
            )}

            {/* Test Buttons */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-700 dark:text-slate-200">Chọn API để test</h2>

              <button
                onClick={testElevenLabs}
                disabled={isTesting}
                className="w-full flex items-center gap-3 px-5 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              >
                <span className="material-symbols-outlined">smart_toy</span>
                <div className="text-left">
                  <div>Test ElevenLabs API</div>
                  <div className="text-xs font-normal text-indigo-200">Giọng AI siêu thực · eleven_multilingual_v2</div>
                </div>
              </button>

              <button
                onClick={testFptAI}
                disabled={isTesting}
                className="w-full flex items-center gap-3 px-5 py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20"
              >
                <span className="material-symbols-outlined">record_voice_over</span>
                <div className="text-left">
                  <div>Test FPT AI (Ban Mai)</div>
                  <div className="text-xs font-normal text-orange-100">Giọng Việt tự nhiên · fpt.ai/hmi/tts/v5</div>
                </div>
              </button>

              <button
                onClick={testBrowserTTS}
                disabled={isTesting}
                className="w-full flex items-center gap-3 px-5 py-4 bg-slate-600 hover:bg-slate-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all"
              >
                <span className="material-symbols-outlined">laptop</span>
                <div className="text-left">
                  <div>Test Giọng Trình duyệt</div>
                  <div className="text-xs font-normal text-slate-300">SpeechSynthesis API · Offline · Không cần key</div>
                </div>
              </button>

              <button
                onClick={stopAudio}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-xl transition-all"
              >
                <span className="material-symbols-outlined">stop_circle</span>
                Dừng phát
              </button>
            </div>

            {/* API Key Status */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-3">Trạng thái API Keys (từ .env)</h2>
              <div className="space-y-2 font-mono text-xs">
                <div className={`flex items-center gap-2 p-2 rounded-lg ${import.meta.env.VITE_ELEVENLABS_API_KEY && import.meta.env.VITE_ELEVENLABS_API_KEY !== 'your_key_here' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                  <span className="material-symbols-outlined text-base">{import.meta.env.VITE_ELEVENLABS_API_KEY && import.meta.env.VITE_ELEVENLABS_API_KEY !== 'your_key_here' ? 'check_circle' : 'cancel'}</span>
                  <span>VITE_ELEVENLABS_API_KEY: {import.meta.env.VITE_ELEVENLABS_API_KEY ? `"${import.meta.env.VITE_ELEVENLABS_API_KEY.slice(0, 8)}..."` : 'KHÔNG CÓ'}</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded-lg ${import.meta.env.VITE_FPT_TTS_API_KEY ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                  <span className="material-symbols-outlined text-base">{import.meta.env.VITE_FPT_TTS_API_KEY ? 'check_circle' : 'cancel'}</span>
                  <span>VITE_FPT_TTS_API_KEY: {import.meta.env.VITE_FPT_TTS_API_KEY ? `"${import.meta.env.VITE_FPT_TTS_API_KEY.slice(0, 8)}..."` : 'KHÔNG CÓ'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Logs */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-green-400 font-mono flex items-center gap-2">
                <span className="material-symbols-outlined text-base">terminal</span>
                Console Log
              </h2>
              <button onClick={clearLogs} className="text-slate-500 hover:text-white text-xs font-mono transition-colors">
                [clear]
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs">
              {logs.length === 0 && (
                <p className="text-slate-600 italic">Chọn một API ở trên để bắt đầu test...</p>
              )}
              {logs.map((log, i) => (
                <div key={i} className={`flex gap-2 ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'warn' ? 'text-yellow-400' :
                  'text-slate-400'
                }`}>
                  <span className="text-slate-600 shrink-0">[{log.time}]</span>
                  <span className="break-all">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TtsTestPage;
