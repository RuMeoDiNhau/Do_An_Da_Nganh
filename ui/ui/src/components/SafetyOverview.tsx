import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Camera, ShieldCheck, VideoOff, Flame, Wind } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

const hazards = [
  { title: 'Balcony Door', status: 'Locked', safe: true },
  { title: 'Medicine Cabinet', status: 'Opened 2m ago', safe: false },
  { title: 'Kitchen Knife Shelf', status: 'Secured', safe: true },
];

export function SafetyOverview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Hàm bật camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      setStream(mediaStream);
      setIsCameraOn(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Lỗi khi truy cập camera: ", error);
      alert("Không thể truy cập camera. Vui lòng kiểm tra quyền trên trình duyệt.");
    }
  };

  // Hàm tắt camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  // Dọn dẹp khi component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Home Safety</h2>
          <p className="text-sm text-slate-500 mt-1">Giám sát camera an ninh và các khu vực nguy hiểm trong nhà.</p>
        </div>
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 px-4 py-1.5 text-sm font-medium shadow-sm">
          <ShieldCheck className="w-4 h-4 mr-2 inline-block" />
          System Secure
        </Badge>
      </div>

      {/* Main Layout Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Cột Trái (Chiếm 2/3): Camera an ninh */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-xl border-2 border-slate-300 bg-white shadow-sm overflow-hidden flex flex-col h-full">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  Live Camera Feed
                </CardTitle>
                <Badge className={isCameraOn ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" : "bg-slate-200 text-slate-600 hover:bg-slate-200"}>
                  {isCameraOn ? '● LIVE REC' : 'OFFLINE'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col">
              
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner mb-6">
                {isCameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover transform scale-x-[-1]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_50%)]" />
                    <div className="flex flex-col h-full items-center justify-center gap-3 text-slate-500">
                      <VideoOff className="h-12 w-12 opacity-50" />
                      <p className="text-sm font-medium">Camera is currently off</p>
                    </div>
                  </div>
                )}

                {/* Overlay thông tin Camera */}
                {isCameraOn && (
                  <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                    <div className="flex justify-between items-start">
                      <Badge className="bg-black/50 text-white border-none backdrop-blur-sm">
                        Cam 01 - Living Room
                      </Badge>
                    </div>
                    <div className="flex items-center justify-end">
                      <Badge className="bg-black/50 text-white border-none backdrop-blur-sm font-mono text-xs">
                        {new Date().toLocaleTimeString()}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-auto">
                <Button 
                  variant={isCameraOn ? "destructive" : "default"} 
                  className={`w-full py-6 text-base font-semibold ${!isCameraOn && 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'}`}
                  onClick={isCameraOn ? stopCamera : startCamera}
                >
                  <Camera className="w-5 h-5 mr-2" />
                  {isCameraOn ? 'Turn Off Camera' : 'Connect to Web Camera'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột Phải (Chiếm 1/3): Các hệ thống cảnh báo */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Hệ thống báo cháy */}
          <Card className="rounded-xl border-2 border-red-300 bg-[#fffcfc] shadow-sm">
            <CardHeader className="pb-3 border-b border-red-50">
              <CardTitle className="text-lg text-red-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                Fire & Gas System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-slate-600 flex items-center gap-2"><Flame className="w-4 h-4 text-orange-400"/> Temperature</span>
                  <span className="text-orange-600">65°C</span>
                </div>
                <Progress value={65} className="h-2 bg-orange-100 [&>div]:bg-orange-500" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-slate-600 flex items-center gap-2"><Wind className="w-4 h-4 text-blue-400"/> Gas Level</span>
                  <span className="text-slate-900">42 ppm</span>
                </div>
                <Progress value={42} className="h-2 bg-blue-50 [&>div]:bg-blue-500" />
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Test Alarm System
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Giám sát khu vực nguy hiểm */}
          <Card className="rounded-xl border-2 border-slate-300 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                Child Safety Zones
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col divide-y divide-slate-100">
                {hazards.map((hazard) => (
                  <div
                    key={hazard.title}
                    className={`p-4 transition-colors hover:bg-slate-50 flex items-center justify-between ${!hazard.safe ? 'bg-orange-50/50' : ''}`}
                  >
                    <div>
                      <p className={`font-semibold ${!hazard.safe ? 'text-orange-900' : 'text-slate-900'}`}>{hazard.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{hazard.status}</p>
                    </div>
                    <div className={`p-2 rounded-full ${hazard.safe ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                      {hazard.safe ? (
                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      )}
                    </div>
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