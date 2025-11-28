import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TEXTS } from '../constants';
import { Globe, Moon, Sliders, Users, ToggleLeft, ToggleRight, LogIn, LogOut, User, Code, ShieldAlert } from 'lucide-react';

const SettingsView: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    creatureScale, 
    setCreatureScale,
    familyThreshold,
    setFamilyThreshold,
    mergeFamily,
    setMergeFamily,
    antiSlackingMode,
    setAntiSlackingMode,
    user,
    isDevMode,
    login,
    logout,
  } = useApp();
  const t = TEXTS[language];

  // Login form state
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [avatarInput, setAvatarInput] = useState('');

  const handleLogin = () => {
    if (usernameInput.trim()) {
      login(usernameInput.trim(), avatarInput.trim() || undefined);
      setShowLoginForm(false);
      setUsernameInput('');
      setAvatarInput('');
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="h-full bg-night-900 p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold text-white mb-8">{t.settings}</h1>

      {/* User Login Section */}
      <div className="bg-night-800 rounded-xl p-4 border border-white/5 mb-6">
        {user ? (
          // Logged in state
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {user.avatar ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dream-100 to-dream-300 flex items-center justify-center text-xl">
                    {user.avatar}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-400">{t.loggedInAs}</div>
                  <div className="text-white font-medium">{user.username}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>{t.logout}</span>
              </button>
            </div>
            
            {/* Dev Mode Indicator */}
            {isDevMode && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-500/30">
                <Code size={18} className="text-green-400" />
                <span className="text-green-400 text-sm font-medium">{t.devModeEnabled}</span>
              </div>
            )}
          </div>
        ) : showLoginForm ? (
          // Login form
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-300 mb-4">
              <User size={20} />
              <span className="font-medium">{t.login}</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{t.username}</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder={t.enterUsername}
                  className="w-full bg-night-900 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-dream-200"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{t.avatarOptional}</label>
                <input
                  type="text"
                  value={avatarInput}
                  onChange={(e) => setAvatarInput(e.target.value)}
                  placeholder="🐱 or URL"
                  className="w-full bg-night-900 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-dream-200"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginForm(false)}
                className="flex-1 py-2 rounded-lg text-gray-400 hover:bg-white/5 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleLogin}
                disabled={!usernameInput.trim()}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  usernameInput.trim()
                    ? 'bg-dream-200 text-night-900 hover:bg-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {t.login}
              </button>
            </div>
          </div>
        ) : (
          // Not logged in - show login button
          <button
            onClick={() => setShowLoginForm(true)}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-dream-200/20 hover:bg-dream-200/30 text-dream-200 rounded-lg transition-colors"
          >
            <LogIn size={20} />
            <span className="font-medium">{t.login}</span>
          </button>
        )}
      </div>

      <div className="bg-night-800 rounded-xl p-4 border border-white/5 space-y-6 mb-6">
        
        {/* Language Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-gray-300">
            <Globe size={20} />
            <span>{t.language}</span>
          </div>
          <div className="flex bg-night-900 rounded-lg p-1 border border-white/10">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                language === 'en' ? 'bg-dream-200 text-night-900' : 'text-gray-500 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('zh')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                language === 'zh' ? 'bg-dream-200 text-night-900' : 'text-gray-500 hover:text-white'
              }`}
            >
              中文
            </button>
          </div>
        </div>

        {/* Creature Size Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-gray-300">
            <div className="flex items-center space-x-3">
              <Sliders size={20} />
              <span>{t.creatureSize}</span>
            </div>
            <span className="text-sm font-mono text-dream-200">{creatureScale.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={creatureScale}
            onChange={(e) => setCreatureScale(parseFloat(e.target.value))}
            className="w-full h-2 bg-night-900 rounded-lg appearance-none cursor-pointer accent-dream-200"
          />
          <div className="flex justify-between text-xs text-gray-500 px-1">
            <span>0.5x</span>
            <span>1.0x</span>
            <span>2.0x</span>
          </div>
        </div>

        {/* Theme (Static for now as App is dark only) */}
        <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
           <div className="flex items-center space-x-3 text-gray-300">
            <Moon size={20} />
            <span>Theme</span>
          </div>
          <span className="text-xs text-gray-500">Dark Mode Only</span>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-2"></div>

        {/* Family Threshold Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-gray-300">
            <div className="flex items-center space-x-3">
              <Users size={20} />
              <span>{t.familyThreshold}</span>
            </div>
            <span className="text-sm font-mono text-dream-200">{familyThreshold.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={familyThreshold}
            onChange={(e) => setFamilyThreshold(parseFloat(e.target.value))}
            className="w-full h-2 bg-night-900 rounded-lg appearance-none cursor-pointer accent-dream-200"
          />
          <div className="flex justify-between text-xs text-gray-500 px-1">
            <span>0.1 ({language === 'zh' ? '严格' : 'Strict'})</span>
            <span>0.5</span>
            <span>1.0 ({language === 'zh' ? '宽松' : 'Loose'})</span>
          </div>
        </div>

        {/* Merge Family Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center space-x-3 text-gray-300">
              <Users size={20} />
              <span>{t.mergeFamily}</span>
            </div>
            <span className="text-xs text-gray-500 ml-8 mt-1">{t.mergeFamilyDesc}</span>
          </div>
          <button
            onClick={() => setMergeFamily(!mergeFamily)}
            className="text-dream-200 hover:text-dream-100 transition-colors"
          >
            {mergeFamily ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-gray-500" />}
          </button>
        </div>

      </div>

      {/* Focus Settings */}
      <div className="bg-night-800 rounded-xl p-4 border border-white/5 mb-6">
        <div className="flex items-center space-x-3 text-gray-300 mb-4">
          <ShieldAlert size={20} />
          <span className="font-medium">{t.focus}</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <div className="text-white font-medium mb-1">{t.antiSlackingMode}</div>
              <div className="text-xs text-gray-400">{t.antiSlackingDesc}</div>
            </div>
            <button 
              onClick={() => setAntiSlackingMode(!antiSlackingMode)}
              className={`transition-colors ${antiSlackingMode ? 'text-dream-300' : 'text-gray-600'}`}
            >
              {antiSlackingMode ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-gray-600 text-xs">
        <p>Dozzi v1.0.0</p>
        <p>Built with React</p>
      </div>
    </div>
  );
};

export default SettingsView;
