import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import BrainView from './views/BrainView';
import FocusView from './views/FocusView';
import ForumView from './views/ForumView';
import SettingsView from './views/SettingsView';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  const renderView = () => {
    switch (activeTab) {
      case 'brain':
        return <BrainView />;
      case 'focus':
        return <FocusView />;
      case 'forum':
        return <ForumView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <BrainView />;
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-night-900 text-white font-sans">
      <div className="flex-1 overflow-hidden relative">
        {renderView()}
      </div>
      <BottomNav />
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;