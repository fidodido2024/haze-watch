import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Star, 
  ArrowUpDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight, 
  SlidersHorizontal,
  X,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { Currency, CurrencyRegion, QuoteDisplayMode } from '../types/currency';

interface RatesTableProps {
  currencies: Currency[];
  onSelectCurrency: (code: string) => void;
  onOpenDetailModal: (currency: Currency) => void;
  favorites: string[];
  onToggleFavorite: (code: string) => void;
  lastUpdated: string;
}

export const RatesTable: React.FC<RatesTableProps> = ({
  currencies,
  onSelectCurrency,
  onOpenDetailModal,
  favorites,
  onToggleFavorite,
  lastUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<CurrencyRegion>('All');
  const [displayMode, setDisplayMode] = useState<QuoteDisplayMode>('sgd_base');
  const [sortField, setSortField] = useState<'code' | 'rate' | 'change' | 'popular'>('popular');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filter & Search
  const filteredCurrencies = useMemo(() => {
    return currencies.filter((c) => {
      // Region filter
      if (selectedRegion === 'Favorites') {
        if (!favorites.includes(c.code)) return false;
      } else if (selectedRegion !== 'All') {
        if (c.region !== selectedRegion) return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
      );
    });
  }, [currencies, selectedRegion, favorites, searchQuery]);

  // Sort
  const sortedCurrencies = useMemo(() => {
    return [...filteredCurrencies].sort((a, b) => {
      if (sortField === 'popular') {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return a.code.localeCompare(b.code);
      }
      if (sortField === 'code') {
        return sortAsc ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code);
      }
      if (sortField === 'rate') {
        return sortAsc ? a.rateToSgd - b.rateToSgd : b.rateToSgd - a.rateToSgd;
      }
      if (sortField === 'change') {
        return sortAsc ? a.change24h - b.change24h : b.change24h - a.change24h;
      }
      return 0;
    });
  }, [filteredCurrencies, sortField, sortAsc]);

  const handleSort = (field: 'code' | 'rate' | 'change') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Sparkline renderer
  const renderSparkline = (points: number[], isPositive: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    const coords = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const strokeColor = isPositive ? '#16a34a' : '#dc2626';

    return (
      <svg width={width} height={height} className="overflow-visible inline-block">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

  const regions: CurrencyRegion[] = ['All', 'Favorites', 'ASEAN', 'Major', 'Asia-Pacific'];

  return (
    <section id="exchange-rates-section" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Singapore Foreign Exchange Table</span>
            <span aria-hidden="true">·</span>
            <span>Interbank Reference Rates</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            SGD Live Market Rates & Quotations
          </h2>
        </div>

        {/* Display Mode Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg shrink-0 text-xs font-medium">
          <button
            onClick={() => setDisplayMode('sgd_base')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              displayMode === 'sgd_base'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1 SGD Buys
          </button>
          <button
            onClick={() => setDisplayMode('foreign_base')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              displayMode === 'foreign_base'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cost in SGD (1 Unit)
          </button>
          <button
            onClick={() => setDisplayMode('mas_standard')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              displayMode === 'mas_standard'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            MAS Standard Quote
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code (e.g. USD, MYR), country (Japan), or currency name..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedRegion === region
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {region === 'Favorites' ? `★ Favorites (${favorites.length})` : region}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rates Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 tracking-wider">
                <th className="py-3 px-4 w-10 text-center">Fav</th>
                <th className="py-3 px-4">
                  <button 
                    onClick={() => handleSort('code')}
                    className="flex items-center gap-1 hover:text-slate-900 uppercase"
                  >
                    <span>Currency</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">
                  <button 
                    onClick={() => handleSort('rate')}
                    className="flex items-center gap-1 justify-end ml-auto hover:text-slate-900 uppercase"
                  >
                    <span>
                      {displayMode === 'sgd_base' && '1 SGD Buys'}
                      {displayMode === 'foreign_base' && 'Price in SGD (1 Unit)'}
                      {displayMode === 'mas_standard' && 'MAS Quotation Rate'}
                    </span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">
                  <button 
                    onClick={() => handleSort('change')}
                    className="flex items-center gap-1 justify-end ml-auto hover:text-slate-900 uppercase"
                  >
                    <span>24h Change</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-center hidden md:table-cell uppercase">7D Trend</th>
                <th className="py-3 px-4 text-right hidden lg:table-cell uppercase">24h Range (SGD)</th>
                <th className="py-3 px-4 text-right uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {sortedCurrencies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">No currencies matched your search "{searchQuery}"</p>
                    <p className="text-xs text-slate-400 mt-1">Try searching for USD, MYR, Ringgit, or Euro.</p>
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedRegion('All'); }}
                      className="mt-3 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                    >
                      Clear Filters
                    </button>
                  </td>
                </tr>
              ) : (
                sortedCurrencies.map((c) => {
                  const isFav = favorites.includes(c.code);
                  const isPositive = c.change24h >= 0;

                  return (
                    <tr 
                      key={c.code}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => onOpenDetailModal(c)}
                    >
                      {/* Favorite Button */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onToggleFavorite(c.code)}
                          className="text-slate-300 hover:text-amber-400 transition-colors p-1"
                          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </td>

                      {/* Currency Details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl leading-none">{c.flag}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{c.code}</span>
                              <span className="text-xs text-slate-400 font-mono">{c.symbol}</span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5">
                              <span>{c.name}</span>
                              <span aria-hidden="true" className="text-slate-300">·</span>
                              <span className="text-slate-400">{c.country}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Exchange Rate Value */}
                      <td className="py-3 px-4 text-right">
                        {displayMode === 'sgd_base' && (
                          <div>
                            <div className="font-mono font-bold text-slate-900 tabular-nums">
                              {c.code === 'IDR' || c.code === 'VND'
                                ? c.sgdToCurrency.toLocaleString(undefined, {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  })
                                : c.sgdToCurrency.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 4,
                                  })
                              } {c.code}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                              1 {c.code} = S$ {c.rateToSgd.toFixed(4)}
                            </div>
                          </div>
                        )}

                        {displayMode === 'foreign_base' && (
                          <div>
                            <div className="font-mono font-bold text-slate-900 tabular-nums">
                              S$ {c.rateToSgd.toFixed(c.unitMultiplier === 100 ? 5 : 4)}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                              1 SGD = {c.sgdToCurrency.toLocaleString(undefined, { maximumFractionDigits: 2 })} {c.code}
                            </div>
                          </div>
                        )}

                        {displayMode === 'mas_standard' && (
                          <div>
                            <div className="font-mono font-bold text-slate-900 tabular-nums">
                              S$ {(c.rateToSgd * c.unitMultiplier).toFixed(4)}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              per {c.unitMultiplier} {c.code}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 24h Change */}
                      <td className="py-3 px-4 text-right">
                        <div className={`inline-flex items-center gap-1 font-mono text-xs font-semibold tabular-nums ${
                          isPositive ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          <span>{isPositive ? `+${c.change24h.toFixed(2)}%` : `${c.change24h.toFixed(2)}%`}</span>
                        </div>
                      </td>

                      {/* 7D Sparkline */}
                      <td className="py-3 px-4 text-center hidden md:table-cell">
                        {renderSparkline(c.history7d, isPositive)}
                      </td>

                      {/* 24h Range */}
                      <td className="py-3 px-4 text-right hidden lg:table-cell text-xs font-mono text-slate-500 tabular-nums">
                        <div>High: S$ {c.high24h.toFixed(4)}</div>
                        <div>Low: S$ {c.low24h.toFixed(4)}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSelectCurrency(c.code)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-red-50 hover:text-red-700 rounded transition-colors whitespace-nowrap"
                            title="Load into top converter"
                          >
                            Convert
                          </button>
                          <button
                            onClick={() => onOpenDetailModal(c)}
                            className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                            title="View trend details & MAS parameters"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>Showing {sortedCurrencies.length} currencies referenced against SGD</span>
          <span className="font-mono tabular-nums">MAS Interbank Fixing: 16:30 SGT daily</span>
        </div>
      </div>
    </section>
  );
};
