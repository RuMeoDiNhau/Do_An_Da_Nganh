import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  Unlock, 
  Lock, 
  Plus, 
  CheckCircle2, 
  XCircle,
  Camera,
  VideoOff
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface AccessSecurityProps {
  role: 'Admin' | 'Member';
}

const accessLog = [
  { name: 'Khang', time: 'Today, 07:20 AM', status: 'Granted', type: 'success' },
  { name: 'Lan', time: 'Today, 08:10 AM', status: 'Granted', type: 'success' },
  { name: 'Unknown Guest', time: 'Today, 09:15 AM', status: 'Denied', type: 'danger' },
  // Thêm dữ liệu giả để test thanh cuộn
  { name: 'Minh', time: 'Yesterday, 18:30 PM', status: 'Granted', type: 'success' },
];

export function AccessSecurity({ role }: AccessSecurityProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [dynamicLog, setDynamicLog] = useState(accessLog);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  // const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [detectedFace, setDetectedFace] = useState<{ name: string; confidence: number } | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      setStream(mediaStream);
      setIsCameraOn(true);
    } catch (error) {
      console.error("Lỗi khi truy cập camera: ", error);
      alert("Không thể truy cập camera. Vui lòng kiểm tra quyền trên trình duyệt.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    setDetectedFace(null);
  };

  // useEffect(() => {
  //   if (isCameraOn && videoRef.current && stream) {
  //     videoRef.current.srcObject = stream;
  //   }
  // }, [isCameraOn, stream]);

  // useEffect(() => {
  //   return () => {
  //     if (stream) {
  //       stream.getTracks().forEach((track) => track.stop());
  //     }
  //   };
  // }, [stream]);
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'FACE_DETECTED') {
        setIsLocked(false);
        setDynamicLog(prev => [
          { name: msg.data.user_class, time: new Date().toLocaleTimeString(), status: 'AI Granted', type: 'success' },
          ...prev
        ]);
        setTimeout(() => setIsLocked(true), 5000); // Tự khoá lại sau 5s
      }
    };
    return () => ws.close();
  }, []);

  return (

    <div className="space-y-6 h-full flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Security System</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý cửa chính và lịch sử nhận diện khuôn mặt.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {role === 'Admin' && (
            <Button className="bg-[#0033CC] text-white hover:bg-[#0027a3] shadow-md transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Add New Face
            </Button>
          )}
          <Button variant="outline" className="text-slate-700 hover:bg-slate-50 bg-white shadow-sm border-slate-200 transition-all">
            <Shield className="mr-2 h-4 w-4" /> 
            Security Status
          </Button>
        </div>
      </div>

      {/* Main Grid: Sử dụng items-stretch để 2 cột cao bằng nhau */}
      <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch flex-1">
        
        {/* === CỘT TRÁI: Camera (Chiếm 2/3) === */}
        <Card className="lg:col-span-2 flex flex-col border border-slate-200 shadow-md bg-white overflow-hidden rounded-xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/80 pb-4 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800 font-semibold">
                <Camera className="w-5 h-5 text-blue-600" />
                Face Recognition Entry
              </CardTitle>
              <Badge className={isCameraOn ? "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-sm" : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"}>
                {isCameraOn ? '● LIVE' : 'OFFLINE'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 flex-1 flex flex-col gap-6 justify-between bg-white">
            
            {/* Camera Feed Container */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex shrink-0">
              {isCameraOn ? (
                // <video
                //   ref={videoRef}
                //   autoPlay
                //   playsInline
                //   muted
                //   className="h-full w-full object-cover transform scale-x-[-1]"
                // />
                <img 
                  src="http://localhost:8000/video_feed" 
                  alt="AI Camera Feed"
                  className="h-full w-full object-cover" 
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_50%)]" />
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-400 z-10">
                    <div className="p-4 bg-slate-800/50 rounded-full backdrop-blur-sm">
                      <VideoOff className="h-10 w-10 opacity-70" />
                    </div>
                    <p className="text-sm font-medium tracking-wide">Camera is currently off</p>
                  </div>
                </div>
              )}

              {/* Overlay Camera Info */}
              {isCameraOn && (
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                  <div className="flex justify-between items-start">
                    <Badge className="bg-black/40 text-white border-white/10 backdrop-blur-md">
                      Front Door Camera
                    </Badge>
                  </div>
                  
                  {detectedFace && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-40 h-48 border-2 border-emerald-400/80 rounded-xl animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.3)]" />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {detectedFace && (
                      <Badge className="bg-emerald-500/90 text-white border-none backdrop-blur-md font-medium shadow-sm">
                        ✓ {detectedFace.name} ({detectedFace.confidence}%)
                      </Badge>
                    )}
                    <Badge className="bg-black/60 text-slate-200 border-white/10 backdrop-blur-md font-mono text-xs ml-auto">
                      {new Date().toLocaleTimeString()}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Detection Status (Nếu có khuôn mặt) */}
            {isCameraOn && detectedFace && (
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl shadow-sm shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-full">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Face Recognized</p>
                      <p className="text-xs text-slate-600">{detectedFace.name} detected at {new Date().toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    onClick={() => setIsLocked(false)}
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Unlock Door
                  </Button>
                </div>
              </div>
            )}
            
            {/* Button Control */}
            <div className="mt-auto pt-2 shrink-0">
              <Button 
                variant={isCameraOn ? "destructive" : "default"} 
                className={`w-full py-6 text-base font-semibold transition-all ${
                  !isCameraOn ? 'bg-[#0033CC] hover:bg-[#0027a3] text-white shadow-md' : 'shadow-md'
                }`}
                onClick={isCameraOn ? stopCamera : startCamera}
              >
                <Camera className="w-5 h-5 mr-2" />
                {isCameraOn ? 'Turn Off Camera' : 'Connect to Camera'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* === CỘT PHẢI: Lock & History (Chiếm 1/3) === */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Card 1: Smart Lock (Kích thước cố định) */}
          <Card className="border border-slate-200 shadow-md rounded-xl shrink-0 bg-white">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-3 pt-4">
              <CardTitle className="text-base flex items-center gap-2 text-slate-700 font-semibold">
                <Shield className="w-4 h-4 text-slate-400" />
                Smart Lock
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6">
              
              <div className={`relative flex items-center justify-center w-20 h-20 rounded-full border-[4px] transition-all duration-500 mb-5 shadow-inner ${
                isLocked ? 'border-slate-100 bg-slate-50' : 'border-amber-100 bg-amber-50'
              }`}>
                {isLocked ? (
                  <Lock className="h-8 w-8 text-slate-600 animate-in zoom-in duration-300" />
                ) : (
                  <Unlock className="h-8 w-8 text-amber-500 animate-in zoom-in duration-300" />
                )}
              </div>

              <div className="text-center mb-6">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Front Door</p>
                <h3 className={`text-2xl font-bold transition-colors ${isLocked ? 'text-slate-800' : 'text-amber-600'}`}>
                  {isLocked ? 'Locked' : 'Unlocked'}
                </h3>
              </div>

              <Button 
                onClick={() => setIsLocked(!isLocked)}
                className={`w-full rounded-lg font-semibold shadow-md transition-all h-11 ${
                  isLocked 
                    ? 'bg-slate-800 text-white hover:bg-slate-900' 
                    : 'bg-[#0033CC] text-white hover:bg-[#0027a3]'
                }`}
              >
                {isLocked ? 'Tap to Unlock' : 'Lock Door'}
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: Recent Access (Co giãn linh hoạt để lấp đầy không gian) */}
          <Card className="border border-slate-200 shadow-md flex-1 flex flex-col rounded-xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-3 pt-4 flex flex-row items-center justify-between shrink-0">
              <CardTitle className="text-base text-slate-700 font-semibold">Recent Access</CardTitle>
              <Button variant="link" className="text-[#0033CC] h-auto p-0 text-xs font-semibold hover:no-underline hover:text-blue-800">
                View All
              </Button>
            </CardHeader>
            
            {/* Sử dụng overflow-y-auto để cuộn mượt nếu danh sách dài */}
            <CardContent className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                {/* {accessLog.map((item, index) => ( */}
                {dynamicLog.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full shadow-sm bg-white border ${
                        item.type === 'success' ? 'border-emerald-100 text-emerald-500' : 'border-rose-100 text-rose-500'
                      }`}>
                        {item.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.time}</p>
                      </div>
                    </div>
                    
                    <Badge 
                      variant="outline" 
                      className={`px-2.5 py-1 font-medium text-[10px] border tracking-wide uppercase ${
                        item.type === 'success' 
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-600' 
                          : 'bg-rose-50/50 border-rose-200 text-rose-600'
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}