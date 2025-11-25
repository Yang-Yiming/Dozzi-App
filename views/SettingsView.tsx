
import React from 'react';
import { useApp } from '../context/AppContext';
import { TEXTS } from '../constants';
import { Globe, Moon, Sliders, Users, ToggleLeft, ToggleRight } from 'lucide-react';

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
  } = useApp();
  const t = TEXTS[language];

  return (
    <div className="h-full bg-night-900 p-6">
      <h1 className="text-2xl font-bold text-white mb-8">{t.settings}</h1>

      <div className="bg-night-800 rounded-xl p-4 border border-white/5 space-y-6">
        
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

      <div className="mt-12 text-center text-gray-600 text-xs">
        <p>Dozzi v1.0.0</p>
        <p>Built with React</p>
      </div>
    </div>
  );
};

export default SettingsView;
