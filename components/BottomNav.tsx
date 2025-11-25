import React from 'react';
import { Brain, Timer, Users, Settings, Archive } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TEXTS } from '../constants';

const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, language } = useApp();
  const t = TEXTS[language];

  const navItems = [
    { id: 'archive', icon: Archive, label: t.archive },
    { id: 'brain', icon: Brain, label: t.brain },
    { id: 'focus', icon: Timer, label: t.focus },
    { id: 'forum', icon: Users, label: t.forum },
    { id: 'settings', icon: Settings, label: t.settings },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-night-900/90 backdrop-blur-md border-t border-white/10 p-4 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center space-y-1 transition-colors duration-200 ${
              activeTab === item.id ? 'text-dream-300' : 'text-gray-400 hover:text-white'
            }`}
          >
            <item.icon size={24} />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;