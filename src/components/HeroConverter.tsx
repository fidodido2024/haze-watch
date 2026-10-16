import React, { useState } from 'react';
import { ArrowRightLeft, Check, Copy, TrendingUp, Info, ChevronDown, Sparkles } from 'lucide-react';
import { Currency } from '../types/currency';
import { SINGAPORE_MONEY_CHANGER_BENCHMARKS } from '../data/currencies';

interface HeroConverterProps {
  currencies: Currency[];
  selectedCode: string;
  onSelectCurrency: (code: string) => void;
  lastUpdated: string;
}

export const HeroConverter: React.FC<HeroConverterProps> = ({
  currencies,
  selectedCode,
  onSelectCurrency,
  lastUpdated,
}) => {
  const [amount, setAmount] = useState<number>(1000);
  const [isSgdBase, setIsSgdBase] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');

  const targetCurrency = currencies.find(c => c.code === selectedCode) || currencies[0];

  // Calculation
  // If isSgdBase is true: Input is SGD, Output is target currency
  // Output = amount * targetCurrency.sgdToCurrency
  // If isSgdBase is false: Input is target currency, Output is SGD
  // Output = amount * targetCurrency.rateToSgd
  const convertedAmount = isSgdBase
    ? amount * targetCurrency.sgdToCurrency
    : amount * targetCurrency.rateToSgd;

  const quickPresets = [100, 500, 1000, 2500, 5000];

  const handleCopy = () => {
    const text = isSgdBase
      ? `S$ ${amount.toLocaleString()} SGD = ${convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${targetCurrency.code}`
      : `${amount.toLocaleString()} ${targetCurrency.code} = S$ ${convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} SGD`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredCurrencies = currencies.filter(
    c => c.code.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
         c.name.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
         c.country.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  return (
    <section className="bg-white border-b border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Editorial Subtitle & Context */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-700">Monetary Authority of Singapore (MAS)</span>
            <span aria-hidden="true">·</span>
            <span>Official Daily Reference & Indicative Spot</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">Updated: {lastUpdated}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Singapore Dollar Real-Time FX Converter
          </h1>
          <p className="mt-2 text-base text-slate-600 max-w-2xl">
            Live institutional & retail conversion rates for SGD against world currencies, calibrated to MAS standard quotation units.
          </p>
        </div>

        {/* Converter Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 lg:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
            {/* Input Box */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-4 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-medium">You Pay</span>
                <span>{isSgdBase ? 'Singapore Dollar' : targetCurrency.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-md font-semibold text-sm text-slate-800 shrink-0">
                  <span className="text-base">{isSgdBase ? '🇸🇬' : targetCurrency.flag}</span>
                  <span>{isSgdBase ? 'SGD' : targetCurrency.code}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount === 0 ? '' : amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums focus:outline-none bg-transparent"
                />
              </div>
              {/* Presets */}
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 overflow-x-auto">
                <span className="text-[11px] text-slate-400 mr-1 shrink-0">Quick:</span>
                {quickPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`px-2 py-0.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                      amount === preset
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isSgdBase ? `S$${preset.toLocaleString()}` : `${preset.toLocaleString()}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Invert Button */}
            <div className="lg:col-span-1 flex justify-center">
              <button
                type="button"
                onClick={() => setIsSgdBase(!isSgdBase)}
                title="Swap source and target currencies"
                className="p-3 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-red-600 hover:border-red-300 hover:shadow-sm active:scale-95 transition-all"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Output Box */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-4 relative">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-medium">You Receive (Estimated Mid-Market)</span>
                <span>{isSgdBase ? targetCurrency.name : 'Singapore Dollar'}</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Target Currency Selector */}
                {isSgdBase ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md font-semibold text-sm text-slate-800 transition-colors shrink-0"
                    >
                      <span className="text-base">{targetCurrency.flag}</span>
                      <span>{targetCurrency.code}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    </button>

                    {/* Dropdown Popover */}
                    {isDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-2 max-h-72 overflow-y-auto">
                        <input
                          type="text"
                          placeholder="Search currency..."
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded mb-2 focus:outline-none focus:border-red-500"
                          autoFocus
                        />
                        <div className="space-y-0.5">
                          {filteredCurrencies.map(c => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                onSelectCurrency(c.code);
                                setIsDropdownOpen(false);
                                setDropdownSearch('');
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded text-left transition-colors ${
                                c.code === targetCurrency.code ? 'bg-red-50 text-red-700 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              <span className="flex items-center gap-2 truncate">
                                <span>{c.flag}</span>
                                <span className="font-semibold">{c.code}</span>
                                <span className="text-slate-500 truncate">{c.name}</span>
                              </span>
                              {c.code === targetCurrency.code && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-md font-semibold text-sm text-slate-800 shrink-0">
                    <span className="text-base">🇸🇬</span>
                    <span>SGD</span>
                  </div>
                )}

                <div className="w-full text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums truncate">
                  {isSgdBase && (targetCurrency.code === 'IDR' || targetCurrency.code === 'VND')
                    ? convertedAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })
                    : convertedAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy calculation"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Conversion Subtext */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span className="tabular-nums">
                  1 SGD = {targetCurrency.sgdToCurrency.toLocaleString()} {targetCurrency.code}
                </span>
                <span className="tabular-nums">
                  1 {targetCurrency.code} = S$ {targetCurrency.rateToSgd.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* MAS Official Quotation Badge & Spread Info */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">MAS Quotation Standard:</span>
              {targetCurrency.unitMultiplier === 100 ? (
                <span className="font-mono text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded tabular-nums">
                  S$ {(targetCurrency.rateToSgd * 100).toFixed(4)} per 100 {targetCurrency.code}
                </span>
              ) : (
                <span className="font-mono text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded tabular-nums">
                  S$ {targetCurrency.rateToSgd.toFixed(4)} per 1 {targetCurrency.code}
                </span>
              )}
              <span className="text-slate-500 hidden sm:inline">({targetCurrency.masDatasetCode})</span>
            </div>

            <div className="flex items-center gap-3 text-slate-600">
              <span className="text-slate-400">Singapore Retail Cash Benchmark:</span>
              <span className="font-medium text-slate-800">Arcade/Mustafa ~ S$ {(isSgdBase ? amount * (1 - 0.0035) * targetCurrency.sgdToCurrency : convertedAmount * 0.9965).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
