import React, { useState } from 'react';
import { X, ArrowUpRight, ArrowDownRight, Calculator, Check, Copy, ExternalLink, HelpCircle } from 'lucide-react';
import { Currency } from '../types/currency';
import { SINGAPORE_MONEY_CHANGER_BENCHMARKS } from '../data/currencies';

interface CurrencyDetailModalProps {
  currency: Currency | null;
  onClose: () => void;
  onSelectForMainConverter: (code: string) => void;
}

export const CurrencyDetailModal: React.FC<CurrencyDetailModalProps> = ({
  currency,
  onClose,
  onSelectForMainConverter,
}) => {
  if (!currency) return null;

  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcDirection, setCalcDirection] = useState<'sgd_to_curr' | 'curr_to_sgd'>('sgd_to_curr');

  const history = currency.history30d || [];
  const rates = history.map(h => h.rate);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const rateRange = maxRate - minRate || 0.0001;

  // SVG Chart Dimensions
  const chartWidth = 600;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 25;

  const pathPoints = history.map((h, i) => {
    const x = paddingX + (i / (history.length - 1)) * (chartWidth - 2 * paddingX);
    const y = chartHeight - paddingY - ((h.rate - minRate) / rateRange) * (chartHeight - 2 * paddingY);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = pathPoints.length > 0 ? `M ${pathPoints.join(' L ')}` : '';
  const areaD = pathPoints.length > 0
    ? `M ${paddingX},${chartHeight - paddingY} L ${pathPoints.join(' L ')} L ${chartWidth - paddingX},${chartHeight - paddingY} Z`
    : '';

  const isPositive = currency.change24h >= 0;

  // Mini calculator result
  const calculatedResult = calcDirection === 'sgd_to_curr'
    ? calcAmount * currency.sgdToCurrency
    : calcAmount * currency.rateToSgd;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{currency.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{currency.code}</h3>
                <span className="text-xs font-mono text-slate-500">· {currency.symbol}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                  {currency.region}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{currency.name} ({currency.country})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Rates Highlight */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="text-[11px] text-slate-500">Rate in SGD</div>
              <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                S$ {currency.rateToSgd.toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">1 SGD Buys</div>
              <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {currency.sgdToCurrency.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">24h Change</div>
              <div className={`text-base font-bold font-mono tabular-nums flex items-center gap-1 ${
                isPositive ? 'text-emerald-700' : 'text-red-700'
              }`}>
                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{currency.change24h > 0 ? `+${currency.change24h}%` : `${currency.change24h}%`}</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">MAS Quote Standard</div>
              <div className="text-xs font-mono font-semibold text-slate-700 mt-1">
                {currency.masRateType}
              </div>
            </div>
          </div>

          {/* 30-Day Historical Trend Chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-700">30-Day Rate Trend against SGD</span>
              <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                Low: S$ {minRate.toFixed(4)} · High: S$ {maxRate.toFixed(4)}
              </span>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 text-white">
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-44 overflow-visible"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#334155" strokeDasharray="3 3" />
                <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#334155" strokeDasharray="3 3" />
                <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#334155" strokeDasharray="3 3" />

                {/* Area Fill */}
                <path d={areaD} fill="url(#chartGradient)" />

                {/* Line Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Coordinate Markers */}
                <text x={paddingX} y={chartHeight - 6} fill="#94a3b8" fontSize="10" className="font-mono">
                  30 Days Ago
                </text>
                <text x={chartWidth - paddingX} y={chartHeight - 6} fill="#94a3b8" fontSize="10" textAnchor="end" className="font-mono">
                  Today
                </text>
                <text x={paddingX} y={paddingY - 6} fill="#cbd5e1" fontSize="10" className="font-mono">
                  Max S$ {maxRate.toFixed(4)}
                </text>
                <text x={paddingX} y={chartHeight - paddingY + 14} fill="#cbd5e1" fontSize="10" className="font-mono">
                  Min S$ {minRate.toFixed(4)}
                </text>
              </svg>
            </div>
          </div>

          {/* Quick Calculator for this Currency */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-red-600" />
                <span>Instant {currency.code} / SGD Calculator</span>
              </span>
              <button
                type="button"
                onClick={() => setCalcDirection(calcDirection === 'sgd_to_curr' ? 'curr_to_sgd' : 'sgd_to_curr')}
                className="text-xs text-red-600 hover:text-red-700 font-semibold"
              >
                Switch: {calcDirection === 'sgd_to_curr' ? 'SGD → ' + currency.code : currency.code + ' → SGD'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-1/2 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500">
                  {calcDirection === 'sgd_to_curr' ? 'S$' : currency.symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold font-mono tabular-nums focus:outline-none focus:border-red-500"
                />
              </div>

              <span className="text-slate-400 font-bold">=</span>

              <div className="w-full sm:w-1/2 py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm font-bold font-mono text-slate-900 tabular-nums">
                {calcDirection === 'sgd_to_curr'
                  ? `${calculatedResult.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency.code}`
                  : `S$ ${calculatedResult.toFixed(2)} SGD`
                }
              </div>
            </div>
          </div>

          {/* Singapore Exchange Benchmark Comparison */}
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-700 mb-2">
              Singapore Real-World Exchange Comparison (Estimates)
            </h4>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs">
              {SINGAPORE_MONEY_CHANGER_BENCHMARKS.map((item) => {
                const effectiveAmount = calcDirection === 'sgd_to_curr'
                  ? calcAmount * (1 - item.spreadPercent / 100) * currency.sgdToCurrency
                  : (calcAmount * currency.rateToSgd) * (1 - item.spreadPercent / 100);

                return (
                  <div key={item.source} className="p-3 bg-white flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-semibold text-slate-800">{item.source}</div>
                      <div className="text-[11px] text-slate-500">{item.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900 tabular-nums">
                        {effectiveAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {calcDirection === 'sgd_to_curr' ? currency.code : 'SGD'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.spreadPercent === 0 ? 'Interbank Mid' : `-${item.spreadPercent}% spread`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            MAS identifier: <span className="text-slate-800 font-semibold">{currency.masDatasetCode}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSelectForMainConverter(currency.code);
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Set as Active in Main Converter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
