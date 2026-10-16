/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TopNav } from './components/TopNav';
import { HeroConverter } from './components/HeroConverter';
import { RatesTable } from './components/RatesTable';
import { CurrencyDetailModal } from './components/CurrencyDetailModal';
import { MasApiModal } from './components/MasApiModal';
import { SingaporeTravelPresets } from './components/SingaporeTravelPresets';
import { MasStandardsGuide } from './components/MasStandardsGuide';
import { Footer } from './components/Footer';
import { Currency, MasApiConfig } from './types/currency';
import { INITIAL_CURRENCIES } from './data/currencies';
import { 
  getStoredMasConfig, 
  saveStoredMasConfig, 
  fetchExchangeRates 
} from './services/masExchangeApi';

const FAVORITES_STORAGE_KEY = 'singarate_fav_currencies_v1';

export default function App() {
  const [currencies, setCurrencies] = useState<Currency[]>(INITIAL_CURRENCIES);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('USD');
  const [selectedDetailCurrency, setSelectedDetailCurrency] = useState<Currency | null>(null);
  const [apiConfig, setApiConfig] = useState<MasApiConfig>(getStoredMasConfig());
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(
    new Date().toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit' }) + ' SGT'
  );
  const [activeSection, setActiveSection] = useState<string>('converter');

  // Load favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return ['USD', 'MYR', 'JPY', 'THB', 'EUR'];
  });

  const toggleFavorite = (code: string) => {
    setFavorites(prev => {
      const next = prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Failed to store favorites:', err);
      }
      return next;
    });
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchExchangeRates(apiConfig);
      setCurrencies(result.currencies);
      setLastUpdated(result.lastUpdated);
    } catch (err) {
      console.error('Error refreshing rates:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  }, [apiConfig]);

  // Periodic simulated live ticks
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 45000); // refresh every 45s
    return () => clearInterval(interval);
  }, [handleRefresh]);

  const handleSaveApiConfig = (newConfig: MasApiConfig) => {
    setApiConfig(newConfig);
    saveStoredMasConfig(newConfig);
    handleRefresh();
  };

  const handleSelectCurrency = (code: string) => {
    setSelectedCurrencyCode(code);
    // Smooth scroll to top converter if user clicked from below
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Bar Contract (3 zones) */}
      <TopNav
        apiConfig={apiConfig}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Banner indicating MAS API readiness */}
        <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                <strong>Singapore Central Bank (MAS) Standard Rates</strong> · Currency conversion active with search
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-mono text-[11px]">
                {apiConfig.mode === 'live' ? 'Mode: Live MAS Proxy' : 'Mode: MAS Calibrated Sandbox'}
              </span>
              <button
                onClick={() => setIsApiModalOpen(true)}
                className="text-red-400 hover:text-red-300 font-semibold underline text-[11px]"
              >
                Configure Backend / API Key →
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section: Fast Interactive Currency Converter */}
        <div id="converter-section">
          <HeroConverter
            currencies={currencies}
            selectedCode={selectedCurrencyCode}
            onSelectCurrency={setSelectedCurrencyCode}
            lastUpdated={lastUpdated}
          />
        </div>

        {/* Global Rates Table with Instant Search & Filtering */}
        <div id="rates-section">
          <RatesTable
            currencies={currencies}
            onSelectCurrency={handleSelectCurrency}
            onOpenDetailModal={setSelectedDetailCurrency}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            lastUpdated={lastUpdated}
          />
        </div>

        {/* Popular Singapore Travel Corridors */}
        <div id="travel-section">
          <SingaporeTravelPresets
            currencies={currencies}
            onSelectCurrency={handleSelectCurrency}
          />
        </div>

        {/* Monetary Authority of Singapore Quotation Standards Guide */}
        <div id="mas-standards-section">
          <MasStandardsGuide />
        </div>
      </main>

      {/* Currency Deep Dive Modal */}
      <CurrencyDetailModal
        currency={selectedDetailCurrency}
        onClose={() => setSelectedDetailCurrency(null)}
        onSelectForMainConverter={(code) => {
          setSelectedCurrencyCode(code);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* MAS API & Backend Integration Modal */}
      <MasApiModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        config={apiConfig}
        onSaveConfig={handleSaveApiConfig}
      />

      {/* Clean Footer */}
      <Footer />
    </div>
  );
}
