import React from 'react';
import { Landmark, Clock, ArrowRightLeft, Building2 } from 'lucide-react';

export const MasStandardsGuide: React.FC = () => {
  return (
    <section id="mas-standards-section" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span>Singapore Financial Framework</span>
          <span aria-hidden="true">·</span>
          <span>Regulatory Conventions</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Monetary Authority of Singapore (MAS) Quotation Standards
        </h2>
        <p className="mt-1 text-sm text-slate-600 max-w-3xl">
          Exchange rates published in Singapore follow specific conventions established by the Monetary Authority of Singapore (MAS), the nation's central bank and financial regulatory authority.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Fixing Time */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base mb-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <h3>16:30 SGT Daily Fixing</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The Monetary Authority of Singapore publishes official daily exchange rates around <strong>16:30 Singapore Time (SGT)</strong> on every Singapore business day. These rates represent end-of-day interbank mid-market reference levels between banks.
          </p>
        </div>

        {/* Card 2: 100-Unit Convention */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base mb-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <h3>The 100-Unit Convention</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unlike Western conventions that quote 1 unit, MAS standard datasets quote several Asian currencies per <strong>100 units</strong> to avoid unwieldy decimals:
          </p>
          <div className="mt-2.5 text-[11px] font-mono text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 space-y-0.5">
            <div>• Japanese Yen: S$ per 100 JPY</div>
            <div>• Malaysian Ringgit: S$ per 100 MYR</div>
            <div>• Indonesian Rupiah: S$ per 100 IDR</div>
            <div>• Thai Baht: S$ per 100 THB</div>
            <div>• Korean Won: S$ per 100 KRW</div>
          </div>
        </div>

        {/* Card 3: Retail vs Interbank */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base mb-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
            <h3>Singapore Retail Benchmarks</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Physical cash changers in Singapore (such as <strong>The Arcade at Raffles Place</strong> and <strong>Mustafa Centre</strong>) operate on spreads typically within 0.25% to 0.50% of the MAS interbank rate, compared to bank credit card fees averaging 3.25%.
          </p>
        </div>
      </div>
    </section>
  );
};
