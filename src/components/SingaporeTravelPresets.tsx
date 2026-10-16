import React from 'react';
import { ArrowUpRight, Plane } from 'lucide-react';
import { POPULAR_TRAVEL_PRESETS } from '../data/currencies';
import { Currency } from '../types/currency';

interface SingaporeTravelPresetsProps {
  currencies: Currency[];
  onSelectCurrency: (code: string) => void;
}

export const SingaporeTravelPresets: React.FC<SingaporeTravelPresetsProps> = ({
  currencies,
  onSelectCurrency,
}) => {
  return (
    <section id="travel-corridors-section" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span>Singapore Travel & Cross-Border Corridors</span>
          <span aria-hidden="true">·</span>
          <span>Popular Outbound Destinations</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Frequent Singapore Destination Corridors
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Quick reference for weekend getaways across the Causeway, regional holidays, and business travel from Singapore.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {POPULAR_TRAVEL_PRESETS.map((preset) => {
          const curr = currencies.find(c => c.code === preset.code);
          if (!curr) return null;

          const foreignEst = preset.defaultAmountSgd * curr.sgdToCurrency;

          return (
            <div
              key={preset.code}
              onClick={() => onSelectCurrency(preset.code)}
              className="bg-white border border-slate-200 hover:border-red-300 rounded-xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{preset.flag}</span>
                    <span className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors">
                      {preset.title}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {preset.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{preset.subtitle}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">
                    S$ {preset.defaultAmountSgd.toLocaleString()} SGD buys
                  </span>
                  <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                    {foreignEst.toLocaleString(undefined, {
                      maximumFractionDigits: preset.code === 'IDR' || preset.code === 'VND' ? 0 : 2
                    })} {curr.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
                  <span>1 SGD = {curr.sgdToCurrency.toLocaleString(undefined, { maximumFractionDigits: 2 })} {preset.code}</span>
                  <span className="text-red-600 font-semibold group-hover:underline inline-flex items-center gap-0.5">
                    Convert <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
