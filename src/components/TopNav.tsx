import React from 'react';
import { SlidersHorizontal, RefreshCw, KeyRound, ArrowRightLeft } from 'lucide-react';
import { MasApiConfig } from '../types/currency';

interface TopNavProps {
  apiConfig: MasApiConfig;
  onOpenApiModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  apiConfig,
  onOpenApiModal,
  onRefresh,
  isRefreshing,
  activeSection,
  setActiveSection,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setActiveSection('converter'); }}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-red-700 transition-colors">
                S$
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                MoneyXhange
              </span>
            </a>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveSection('converter')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeSection === 'converter' ? 'border-red-600 text-slate-900 font-semibold' : 'border-transparent'
              }`}
            >
              Converter
            </button>
            <button
              onClick={() => setActiveSection('rates')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeSection === 'rates' ? 'border-red-600 text-slate-900 font-semibold' : 'border-transparent'
              }`}
            >
              All Rates
            </button>
            <button
              onClick={() => setActiveSection('travel')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeSection === 'travel' ? 'border-red-600 text-slate-900 font-semibold' : 'border-transparent'
              }`}
            >
              Travel Corridors
            </button>
            <button
              onClick={() => setActiveSection('mas-standards')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeSection === 'mas-standards' ? 'border-red-600 text-slate-900 font-semibold' : 'border-transparent'
              }`}
            >
              MAS Standards
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh rates"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
            </button>

            <button
              onClick={onOpenApiModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-600" />
              <span>MAS API Config</span>
              {apiConfig.apiKey ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="API Key Configured" />
              ) : null}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
