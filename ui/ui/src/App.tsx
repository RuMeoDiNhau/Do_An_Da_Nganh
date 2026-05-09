import React, { useState,useEffect } from 'react';
import { Mic, X } from 'lucide-react';
import { DashboardOverview } from './components/DashboardOverview';
import { EnvironmentDevices } from './components/ControlDevices';
import { AccessSecurity } from './components/AccessSecurity';
import { SafetyOverview } from './components/SafetyOverview';
import { SettingsPanel } from './components/SettingsPanel';
import { NavigationSidebar } from './components/NavigationSidebar';
import { LoginPage } from './components/LoginPage';
import { TopBar } from './components/TopBar';

type RoleType = 'Admin' | 'Member';

const VALID_COMMANDS = [
  { intent: "bật đèn", keywords: ["bật đèn", "mở đèn", "sáng đèn"] },
  { intent: "tắt đèn", keywords: ["tắt đèn", "tối đèn"] },
  { intent: "bật quạt", keywords: ["bật quạt", "mở quạt", "quay quạt"] },
  { intent: "tắt quạt", keywords: ["tắt quạt", "ngừng quạt"] }

];const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;


export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: 'Khang', role: 'Admin' as RoleType });

  const [listening, setListening] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [detectedCommand, setDetectedCommand] = useState("");

  const handleLogin = (username: string) => {
    const normalized = username.trim().toLowerCase();
    const role = normalized === 'khang' || normalized.includes('admin') ? 'Admin' : 'Member';
    setUser({ name: username || 'Khang', role });
    setIsLoggedIn(true);
  };

  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false; 

    if (listening) {
      setSpeechText("");
      setDetectedCommand("");
      recognition.start();
    } else {
      recognition.stop();
    }

    recognition.onresult = (event: any) => {
      //Chuẩn hóa chuỗi: Chữ thường, xóa dấu câu (chấm, phẩy, hỏi, than) và xóa khoảng trắng thừa
      let transcript = event.results[0][0].transcript.toLowerCase();
      transcript = transcript.replace(/[.,?!]/g, '').trim();
      
      setSpeechText(transcript);

      let matchedIntent = null;
      let matchedWord = "";

      for (const cmd of VALID_COMMANDS) {
        const found = cmd.keywords.find(kw => transcript.includes(kw));
        if (found) {
          matchedIntent = cmd.intent;
          matchedWord = found;
          break;
        }
      }

      if (matchedIntent) {
        setDetectedCommand(`Lệnh hợp lệ: [${matchedWord}]`);
        
        // Gửi lệnh xuống hệ thống ADA kết nối rồi thì uncomment
        // api.controlDevice('voice_control', { action: matchedIntent })
        //   .catch(err => console.error(err));
        
      } else {
        setDetectedCommand("Không có lệnh nào hợp lệ.");
      }

      setListening(false);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        setSpeechText("Không nghe thấy gì, vui lòng nói lại.");
      } else if (event.error === 'network') {
        setSpeechText("Lỗi mạng: Cần có internet để nhận diện.");
      } else {
        setSpeechText(`Lỗi micro: ${event.error}`);
      }
      setListening(false);
    };

    return () => recognition.stop();
  }, [listening]);

  useEffect(() => {
    if (!listening && speechText !== "") {
      const timer = setTimeout(() => {
        setSpeechText("");
        setDetectedCommand("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [listening, speechText]);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview onNavigate={setActiveSection} />;
      case 'environment':
        return <EnvironmentDevices />;
      case 'access':
        return <AccessSecurity role={user.role} />;
      // case 'safety':
      //   return <SafetyOverview />;
      // case 'settings':
      //   return <SettingsPanel />;
      default:
        return <DashboardOverview onNavigate={setActiveSection} />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <NavigationSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 min-h-screen p-6 ml-64 relative">
        <div className="max-w-7xl mx-auto space-y-6">
          <TopBar
            name={user.name}
            role={user.role}
            listening={listening}
            onToggleListening={() => setListening((prev) => !prev)}
            onLogout={() => setIsLoggedIn(false)}
          />
          {renderActiveSection()}
        </div>

        {(listening || speechText) && (
          <div className="fixed bottom-24 right-6 z-30 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
            {!listening && (
              <button 
                onClick={() => { setSpeechText(""); setDetectedCommand(""); }}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-full ${listening ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-blue-100 text-[#0033CC]'}`}>
                <Mic className="w-5 h-5" />
              </div>
              <span className="font-semibold text-slate-800 text-base">
                {listening ? 'Hệ thống đang nghe...' : 'Kết quả nhận diện'}
              </span>
            </div>
            
            {speechText && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3">
                <p className="text-sm text-slate-600 italic">"{speechText}"</p>
              </div>
            )}

            {detectedCommand && (
              <div className={`px-3 py-2 rounded-lg text-sm font-semibold text-center border ${
                detectedCommand.includes('hợp lệ') 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                {detectedCommand}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          aria-label="Voice control"
          className={`fixed bottom-6 right-6 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full text-white transition-all shadow-lg ${
            listening ? 'animate-pulse bg-red-500 scale-110' : 'bg-[#0033CC] hover:scale-105'
          }`}
          onClick={() => setListening((prev) => !prev)}
        >
          <Mic className="h-6 w-6" />
        </button>
      </main>
    </div>
  );
}