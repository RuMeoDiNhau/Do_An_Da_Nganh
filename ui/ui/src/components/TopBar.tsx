import React from 'react';
import { Button } from './ui/button';
import { Mic, LogOut } from 'lucide-react';

interface TopBarProps {
  name: string;
  role: 'Admin' | 'Member';
  listening: boolean;
  onToggleListening: () => void;
  onLogout: () => void;
}

export function TopBar({ name, role, listening, onToggleListening, onLogout }: TopBarProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <p className="text-sm text-slate-500">Hello {name} ({role})</p>
        <h1 className="text-2xl font-semibold text-slate-900">YOLO HOME Dashboard</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          className="inline-flex items-center gap-2 bg-[#0033CC] text-white hover:bg-[#0027a3]"
          onClick={onToggleListening}
        >
          <Mic className="h-4 w-4" />
          {listening ? 'Listening...' : 'Voice control'}
        </Button>
        <Button variant="outline" className="text-slate-700 hover:bg-slate-100" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
