import React, { useEffect, useState } from 'react';
import {
  Lightbulb,
  Thermometer,
  Shield,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';

interface DashboardOverviewProps {
  onNavigate: (section: string) => void;
}

interface SnapshotMetric {
  value: number | null;
  capturedAt?: string;
}

interface EnvironmentSnapshot {
  temperature?: SnapshotMetric | null;
  humidity?: SnapshotMetric | null;
  light?: SnapshotMetric | null;
  gas?: SnapshotMetric | null;
}

interface EnvironmentReading {
  en_id: string | number;
  temp: number | null;
  humidity: number | null;
  bright: number | null;
  gas_level: number | null;
  time_created: string;
}

function formatMetric(metric?: SnapshotMetric | null, suffix = '', digits = 1) {
  if (typeof metric?.value !== 'number') {
    return 'N/A';
  }

  return `${metric.value.toFixed(digits)}${suffix}`;
}

function formatTimeLabel(value: string) {
  const date = new Date(value);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  const [snapshot, setSnapshot] = useState<EnvironmentSnapshot | null>(null);
  const [history, setHistory] = useState<EnvironmentReading[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [snapshotResponse, historyResponse] = await Promise.all([
          api.getEnvironmentSnapshot(),
          api.getEnvironmentHistory({ limit: 20 }),
        ]);

        setSnapshot(snapshotResponse.data?.data || null);
        setHistory((historyResponse.data?.data || []).slice().reverse());
      } catch (error) {
        console.error('Failed to fetch environment data:', error);
      }
    };

    fetchData();
  }, []);

  const quickStats = [
    {
      label: 'Temperature',
      value: formatMetric(snapshot?.temperature, '°C'),
      icon: Thermometer,
      color: 'text-[#0033CC]',
    },
    {
      label: 'Humidity',
      value: formatMetric(snapshot?.humidity, '%'),
      icon: Shield,
      color: 'text-[#0033CC]',
    },
    {
      label: 'Light',
      value: formatMetric(snapshot?.light, ' lux', 0),
      icon: Lightbulb,
      color: 'text-[#0033CC]',
    },
    {
      label: 'Gas',
      value: formatMetric(snapshot?.gas, ' ppm', 0),
      icon: Zap,
      color: 'text-[#0033CC]',
    },
  ];

  const climateTrendData = history.map((item) => ({
    time: formatTimeLabel(item.time_created),
    temperature: item.temp,
    humidity: item.humidity,
    gas: item.gas_level,
    light: item.bright,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-semibold text-slate-900">Overview</h1>
          <p className="text-sm text-slate-500">Quickly monitor your home status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-slate-100 text-slate-700">
            {history.length > 0 ? 'Live data from DB' : 'Waiting for sensor data'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="cursor-pointer border-2 border-slate-300 transition-colors hover:bg-slate-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle>Temperature Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Latest readings stored in the database.</p>
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

        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle>Humidity Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Indoor humidity levels from recent telemetry.</p>
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

        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle>Gas Levels Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Indoor air quality monitoring from the latest samples.</p>
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
        </Card>

        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle>Light Intensity Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Indoor light levels stored in the environment history.</p>
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
                  <Tooltip formatter={(value: number) => [`${value} lux`, 'Light Intensity']} />
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
