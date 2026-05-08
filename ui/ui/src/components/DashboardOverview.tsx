import React from 'react';
import { 
  Lightbulb, 
  Thermometer, 
  Shield, 
  Zap, 
  Home,
  TrendingUp,
  AlertTriangle,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

interface DashboardOverviewProps {
  onNavigate: (section: string) => void;
}

export function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  const [sensors, setSensors] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getEnvironment();
        setSensors(response.data);
      } catch (error) {
        console.error('Failed to fetch environment data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const quickStats = [
    { 
      label: 'Temperature', 
      value: sensors?.temperature ? `${sensors.temperature}°C` : '32.2°C', 
      icon: Thermometer, 
      color: 'text-[#0033CC]' 
    },
    { 
      label: 'Humidity', 
      value: sensors?.humidity ? `${sensors.humidity}%` : '72.1%', 
      icon: Shield, 
      color: 'text-[#0033CC]' 
    },
    { 
      label: 'Light', 
      value: sensors?.light ? `${sensors.light}%` : '75%', 
      icon: Lightbulb, 
      color: 'text-[#0033CC]' 
    },
    { 
      label: 'Gas', 
      value: sensors?.gas ? `${sensors.gas} ppm` : '42 ppm', 
      icon: Zap, 
      color: 'text-[#0033CC]' 
    },
  ];



  const climateTrendData = [
    { time: '8:30 AM', temperature: 29.5, humidity: 48, gas: 38, light: 50 },
    { time: '8:35 AM', temperature: 30, humidity: 70, gas: 40, light: 200 },
    { time: '8:40 AM', temperature: 30.7, humidity: 77, gas: 42, light: 310 },
    { time: '8:45 AM', temperature: 30.2, humidity: 53, gas: 41, light: 280 },
    { time: '8:50 AM', temperature: 31.3, humidity: 53, gas: 39, light: 150 },
    { time: '8:55 AM', temperature: 31.3, humidity: 58, gas: 37, light: 80 },
  ];

  const energyChartData = [
    { category: 'Lighting', usage: 0.8, percentage: 33 },
    { category: 'AC', usage: 1.2, percentage: 50 },
    { category: 'Appliances', usage: 0.4, percentage: 17 },
  ];

  const pieData = energyChartData.map(item => ({
    name: item.category,
    value: item.percentage,
    usage: item.usage
  }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-semibold text-slate-900">Overview</h1>
          <p className="text-sm text-slate-500">Quickly monitor your home status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-slate-100 text-slate-700">All sensors online</Badge>
        </div>
      </div>

      {/* Emergency Alert - COMMENTED OUT */}
      {/* <Card className="border border-red-600 bg-red-600">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Emergency alert</p>
            <p className="mt-1 text-base font-semibold text-white">
              Alert: Kitchen gas levels are rising!
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-white">
            <AlertTriangle className="h-5 w-5" />
            Check immediately
          </div>
        </CardContent>
      </Card> */}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="cursor-pointer transition-colors hover:bg-slate-50 border-2 border-slate-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section - 2 Column Layout with Enhanced Visibility */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Total Energy Use (Donut Chart) - COMMENTED OUT */}
        {/* <Card className="flex flex-col border-2 border-slate-300">
          <CardHeader>
            <CardTitle>Total Energy Use</CardTitle>
            <p className="text-sm text-muted-foreground">Total: 2.4 kW</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            {/* <div className="mt-6 space-y-3">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <div className="text-slate-600">
                    <span className="font-semibold">{item.value}%</span> 
                    <span className="text-slate-400 text-xs ml-1">({item.usage} kW)</span>
                  </div>
                </div>
              ))}
            </div> */}
        {/* </CardContent>
        </Card> */}

        {/* Temperature Trend */}
        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle>Temperature Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Room temperature over the day.</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={climateTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`${value}°C`, 'Temperature']} />
                  <Area type="monotone" dataKey="temperature" stroke="#fb7185" fillOpacity={1} fill="url(#tempGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Humidity Trend */}
        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle>Humidity Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Indoor humidity levels.</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={climateTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`${value}% RH`, 'Humidity']} />
                  <Area type="monotone" dataKey="humidity" stroke="#38bdf8" fillOpacity={1} fill="url(#humidityGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gas Levels Trend
        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle>Gas Levels Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Indoor air quality monitoring.</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={climateTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`${value} ppm`, 'Gas Level']} />
                  <Area type="monotone" dataKey="gas" stroke="#a78bfa" fillOpacity={1} fill="url(#gasGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card> */}

        {/* Light Intensity Trend */}
        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle>Light Intensity Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Indoor light levels monitoring.</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={climateTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`${value} Lux`, 'Light Intensity']} />
                  <Area type="monotone" dataKey="light" stroke="#fbbf24" fillOpacity={1} fill="url(#lightGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}