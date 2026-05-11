import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { 
  Router, Thermometer, Lock, Lightbulb, Camera, 
  Bot, Droplets, Speaker, ShieldAlert, Battery, 
  BatteryFull, BatteryLow, Wifi, WifiOff, Power,
  Wind, ChefHat, Bed, Briefcase, ChevronLeft, Settings
} from 'lucide-react';
import { api } from '../services/api';

const connectedDevices = [
  { name: 'Living Room Hub', type: 'Hub', status: 'Online', battery: null, icon: Router },
  { name: 'Smart Thermostat', type: 'Climate', status: 'Online', battery: 85, icon: Thermometer },
  { name: 'Front Door Lock', type: 'Security', status: 'Online', battery: 67, icon: Lock },
  { name: 'Kitchen Lights', type: 'Lighting', status: 'Online', battery: null, icon: Lightbulb },
  { name: 'Bedroom Camera', type: 'Security', status: 'Offline', battery: 23, icon: Camera },
  { name: 'Robot Vacuum', type: 'Appliance', status: 'Charging', battery: 100, icon: Bot },
  { name: 'Garden Sprinkler', type: 'Outdoor', status: 'Online', battery: 45, icon: Droplets },
  { name: 'Smart Speaker', type: 'Entertainment', status: 'Online', battery: null, icon: Speaker },
  { name: 'Smoke Detector', type: 'Security', status: 'Online', battery: 92, icon: ShieldAlert },
];

const rooms = [
  {
    name: 'Living Room',
    icon: Router,
    lights: 3,
    temp: '72°F',
    occupied: true,
    devices: [
      { name: 'Main Light', type: 'Light', icon: Lightbulb },
      { name: 'Ceiling Fan', type: 'Fan', icon: Wind },
    ],
  },
  {
    name: 'Kitchen',
    icon: ChefHat,
    lights: 2,
    temp: '70°F',
    occupied: false,
    devices: [
      { name: 'Kitchen Light', type: 'Light', icon: Lightbulb },
      { name: 'Range Hood', type: 'Exhaust Fan', icon: Wind },
      { name: 'Oven', type: 'Appliance', icon: Power },
    ],
  },
  {
    name: 'Bedroom',
    icon: Bed,
    lights: 1,
    temp: '68°F',
    occupied: true,
    devices: [
      { name: 'Air Conditioner', type: 'Climate', icon: Thermometer },
      { name: 'Bedside Lamp', type: 'Light', icon: Lightbulb },
      { name: 'Desk Fan', type: 'Fan', icon: Wind },
    ],
  },
  {
    name: 'Office',
    icon: Briefcase,
    lights: 2,
    temp: '71°F',
    occupied: false,
    devices: [
      { name: 'Desk Light', type: 'Light', icon: Lightbulb },
      { name: 'Standing Fan', type: 'Fan', icon: Wind },
      { name: 'Air Purifier', type: 'Air quality', icon: Wind },
    ],
  },
];

export function EnvironmentDevices() {
  // Quản lý trạng thái: null nghĩa là đang xem danh sách phòng. Nếu có tên phòng, nghĩa là đang xem chi tiết phòng đó.
  const [activeRoomDetail, setActiveRoomDetail] = useState<string | null>(null);
  
  const [roomDeviceStates, setRoomDeviceStates] = useState(() => {
    return rooms.reduce((acc, room) => {
      acc[room.name] = room.devices.reduce((deviceMap, device) => {
        deviceMap[device.name] = true;
        return deviceMap;
      }, {} as Record<string, boolean>);
      return acc;
    }, {} as Record<string, Record<string, boolean>>);
  });

  const [loadingDevices, setLoadingDevices] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeRoom = rooms.find((room) => room.name === activeRoomDetail);

  const mapDeviceNameToId = (deviceName: string): string => {
    const nameMap: Record<string, string> = {
      'Main Light': 'light',
      'Kitchen Light': 'light',
      'Bedside Lamp': 'light',
      'Desk Light': 'light',
      'Ceiling Fan': 'fan',
      'Range Hood': 'fan',
      'Desk Fan': 'fan',
      'Standing Fan': 'fan',
    };
    return nameMap[deviceName] || 'button1';
  };

  const toggleRoomDevice = async (roomName: string, deviceName: string) => {
    const deviceKey = `${roomName}-${deviceName}`;
    const currentState = roomDeviceStates[roomName][deviceName];
    
    // Optimistically update UI
    setRoomDeviceStates((prev) => ({
      ...prev,
      [roomName]: {
        ...prev[roomName],
        [deviceName]: !prev[roomName][deviceName],
      },
    }));

    setLoadingDevices((prev) => new Set(prev).add(deviceKey));
    setErrorMessage(null);

    try {
      const deviceId = mapDeviceNameToId(deviceName);
      const action = !currentState ? 'turn_on' : 'turn_off';

      await api.controlDevice(deviceId, { action });
    } catch (error) {
      // Revert on error
      setRoomDeviceStates((prev) => ({
        ...prev,
        [roomName]: {
          ...prev[roomName],
          [deviceName]: currentState,
        },
      }));

      const errorMsg = error instanceof Error ? error.message : 'Failed to control device';
      setErrorMessage(`${deviceName}: ${errorMsg}`);
      console.error(`Failed to control ${deviceName}:`, error);
    } finally {
      setLoadingDevices((prev) => {
        const updated = new Set(prev);
        updated.delete(deviceKey);
        return updated;
      });
    }
  };

  const getBatteryIcon = (level: number | null) => {
    if (level === null) return <Power className="h-4 w-4 text-slate-400" />;
    if (level > 80) return <BatteryFull className="h-4 w-4 text-emerald-500" />;
    if (level < 30) return <BatteryLow className="h-4 w-4 text-red-500" />;
    return <Battery className="h-4 w-4 text-slate-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Device Control</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý toàn bộ thiết bị kết nối và không gian sống của bạn.</p>
        </div>
        <Badge className="bg-blue-50 text-[#0033CC] border-[#cbe0ff] px-4 py-1.5 text-sm font-medium shadow-sm">
          <Wifi className="w-4 h-4 mr-2 inline-block" />
          Connected Home
        </Badge>
      </div>

      <Card className="border-2 border-slate-300 shadow-md">
        <Tabs defaultValue="connected" className="w-full">
          <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl pb-4">
            {/* Thanh Tab được làm to hơn, rộng hơn để dễ bấm */}
            <TabsList className="grid w-full grid-cols-2 h-14 bg-slate-200/50 p-1.5 rounded-xl">
              <TabsTrigger 
                value="connected" 
                className="rounded-lg text-base font-medium py-2 data-[state=active]:shadow-sm data-[state=active]:bg-white"
                onClick={() => setActiveRoomDetail(null)} // Reset detail view when switching tabs
              >
                Connected Devices
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="rounded-lg text-base font-medium py-2 data-[state=active]:shadow-sm data-[state=active]:bg-white"
              >
                Room Settings
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent className="p-6">
            
            {/* Tab: Connected Devices */}
            <TabsContent value="connected" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectedDevices.map((device) => {
                  const DeviceIcon = device.icon;
                  const isOnline = device.status === 'Online';
                  const isCharging = device.status === 'Charging';
                  
                  return (
                    <div
                      key={device.name}
                      className="group flex flex-col justify-between rounded-xl border-2 border-slate-300 bg-white p-5 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-2.5 rounded-lg ${isOnline || isCharging ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                          <DeviceIcon className="h-6 w-6" />
                        </div>
                        <Badge
                          className={`text-xs px-2.5 py-0.5 font-medium flex items-center gap-1.5 ${
                            isOnline 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isCharging
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {isOnline ? <Wifi className="w-3 h-3" /> : isCharging ? <Power className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                          {device.status}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{device.name}</p>
                        <p className="text-xs text-slate-500 font-medium mb-4">{device.type}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                        {getBatteryIcon(device.battery)}
                        <div className="flex-1">
                          {device.battery !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${device.battery > 30 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                                  style={{ width: `${device.battery}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-500 font-medium w-8">{device.battery}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Cắm điện trực tiếp</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Tab: Room Settings */}
            <TabsContent value="settings" className="mt-0">
              
              {/* CHẾ ĐỘ 1: XEM DANH SÁCH CÁC PHÒNG */}
              {!activeRoomDetail && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {rooms.map((room) => {
                    const RoomIcon = room.icon;
                    return (
                      <button
                        key={room.name}
                        onClick={() => setActiveRoomDetail(room.name)}
                        className="group flex flex-col justify-between text-left rounded-2xl border-2 border-slate-300 bg-white p-6 hover:border-blue-500 hover:shadow-lg hover:ring-2 hover:ring-blue-100 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-6 w-full">
                          <div className="p-3.5 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <RoomIcon className="w-8 h-8" />
                          </div>
                          <Badge className={`text-[10px] uppercase tracking-wider px-2 py-0.5 ${room.occupied ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                            {room.occupied ? 'Occupied' : 'Empty'}
                          </Badge>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700">{room.name}</h3>
                          <p className="text-sm text-slate-500 mt-1">{room.devices.length} Connected Devices</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            <span className="font-medium">{room.lights}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Thermometer className="w-4 h-4 text-rose-500" />
                            <span className="font-medium">{room.temp}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* CHẾ ĐỘ 2: XEM CHI TIẾT THIẾT BỊ TRONG PHÒNG ĐÃ CHỌN */}
              {activeRoomDetail && activeRoom && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {/* Nút Back và Tiêu đề */}
                  <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full h-10 w-10 hover:bg-slate-100"
                      onClick={() => setActiveRoomDetail(null)}
                    >
                      <ChevronLeft className="h-5 w-5 text-slate-600" />
                    </Button>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <activeRoom.icon className="w-6 h-6 text-blue-600" />
                        {activeRoom.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">Điều khiển thiết bị và thông số không gian.</p>
                    </div>
                  </div>

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                      <p className="font-semibold"> Lỗi:</p>
                      <p>{errorMessage}</p>
                    </div>
                  )}

                  {/* Danh sách thiết bị */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeRoom.devices.map((device) => {
                      const DeviceIcon = device.icon;
                      const isOn = roomDeviceStates[activeRoom.name][device.name];
                      const deviceKey = `${activeRoom.name}-${device.name}`;
                      const isLoading = loadingDevices.has(deviceKey);
                      
                      return (
                        <div
                          key={device.name}
                          className={`flex flex-col gap-4 rounded-xl border-2 p-5 transition-all duration-200 ${
                            isOn ? 'bg-blue-50/50 border-blue-300 shadow-sm' : 'bg-white border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-full transition-colors ${isOn ? 'bg-blue-100 text-blue-600 shadow-inner' : 'bg-slate-100 text-slate-400'}`}>
                                <DeviceIcon className="w-6 h-6" />
                              </div>
                              <div>
                                <p className={`text-lg font-semibold ${isOn ? 'text-slate-900' : 'text-slate-600'}`}>{device.name}</p>
                                <p className="text-sm text-slate-500 mt-0.5">{device.type}</p>
                              </div>
                            </div>
                            
                            <Switch 
                              checked={isOn}
                              disabled={isLoading}
                              onCheckedChange={() => toggleRoomDevice(activeRoom.name, device.name)}
                              className="data-[state=checked]:bg-blue-600"
                            />
                          </div>
                          
                          {/* Dải nút Configure */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 mt-2">
                            <Badge variant="outline" className={`${isOn ? 'bg-blue-100 text-blue-700 border-none' : 'bg-slate-100 text-slate-500 border-none'}`}>
                              {isLoading ? 'Đang xử lý...' : isOn ? 'Đang hoạt động' : 'Đang tắt'}
                            </Badge>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className={`gap-2 ${isOn ? 'bg-white hover:bg-blue-100 text-blue-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                              disabled={isLoading}
                            >
                              <Settings className="w-4 h-4" />
                              Configure
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
