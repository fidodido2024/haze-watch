import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <span className="w-5 h-5 rounded bg-red-600 text-white flex items-center justify-center text-[10px]">S$</span>
            <span>MoneyXhange</span>
          </div>
          <p className="mt-1 text-slate-500 max-w-md">
            Singapore Dollar (SGD) real-time exchange rates and foreign currency conversion reference tool.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-slate-500">
          <span>Data schema: Monetary Authority of Singapore (MAS)</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span>Interbank Indicative Rates</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span>SGT Business Days</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
        <div>
          © {new Date().getFullYear()} MoneyXhange. Currency exchange rates provided for reference and indicative planning purposes only.
        </div>
        <div className="flex items-center gap-4">
          <span>Singapore Exchange Standards</span>
          <span>ISO 4217 Currency Codes</span>
        </div>
      </div>
    </footer>
  );
};
