import React from 'react';
import {
  Home,
  Lightbulb,
  Shield,
  AlertTriangle,
  Settings,
  User,
} from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { cn } from './ui/utils';

interface NavigationSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Overview', icon: Home },
  { id: 'environment', label: 'Device Control', icon: Lightbulb },
  { id: 'access', label: 'Security', icon: Shield },
  // { id: 'safety', label: 'Safety', icon: AlertTriangle },
  // { id: 'settings', label: 'Settings', icon: Settings },
];

export function NavigationSidebar({ activeSection, onSectionChange }: NavigationSidebarProps) {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-semibold text-[#0033CC]">YOLO HOME</h1>
        <p className="text-sm text-slate-500 mb-4">Smart home management</p>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Hello, Khang</p>
            <p className="text-xs text-slate-400">Admin</p>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Navigation Items */}
      <nav className="flex-1 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition',
                isActive
                  ? 'border-l-4 border-[#0033CC] bg-[#0033CC] text-white font-semibold'
                  : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive ? 'text-white' : 'text-slate-400')} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6">
        <div className="text-xs text-muted-foreground">
          <p>System Status: Online</p>
          <p>Last updated: 2 min ago</p>
        </div>
      </div>
    </div>
  );
}