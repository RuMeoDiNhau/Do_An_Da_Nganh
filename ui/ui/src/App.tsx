import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { DashboardOverview } from './components/DashboardOverview';
import { EnvironmentDevices } from './components/ControlDevices';
import { AccessSecurity } from './components/AccessSecurity';
import { SafetyOverview } from './components/SafetyOverview';
import { SettingsPanel } from './components/SettingsPanel';
import { NavigationSidebar } from './components/NavigationSidebar';
import { LoginPage } from './components/LoginPage';
import { TopBar } from './components/TopBar';

type RoleType = 'Admin' | 'Member';

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: 'Khang', role: 'Admin' as RoleType });
  const [listening, setListening] = useState(false);

  const handleLogin = (username: string) => {
    const normalized = username.trim().toLowerCase();
    const role = normalized === 'khang' || normalized.includes('admin') ? 'Admin' : 'Member';
    setUser({ name: username || 'Khang', role });
    setIsLoggedIn(true);
  };

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
      <main className="flex-1 min-h-screen p-6 ml-64">
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

        <button
          type="button"
          aria-label="Voice control"
          className={`fixed bottom-6 right-6 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#0033CC] text-white transition-all ${
            listening ? 'animate-pulse' : 'hover:scale-105'
          }`}
          onClick={() => setListening((prev) => !prev)}
        >
          <Mic className="h-6 w-6" />
        </button>
      </main>
    </div>
  );
}