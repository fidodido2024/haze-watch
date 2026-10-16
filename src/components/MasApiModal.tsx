import React, { useState } from 'react';
import { X, KeyRound, Check, Copy, ExternalLink, RefreshCw, Terminal, ShieldCheck, Database } from 'lucide-react';
import { MasApiConfig } from '../types/currency';
import { getBackendIntegrationCodeSample, MAS_DATASTORE_RESOURCE_ID } from '../services/masExchangeApi';

interface MasApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MasApiConfig;
  onSaveConfig: (newConfig: MasApiConfig) => void;
}

export const MasApiModal: React.FC<MasApiModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  if (!isOpen) return null;

  const [apiKey, setApiKey] = useState(config.apiKey);
  const [endpointUrl, setEndpointUrl] = useState(config.endpointUrl || '/api/mas-exchange-rates');
  const [mode, setMode] = useState<'simulated' | 'live'>(config.mode);
  const [copiedCode, setCopiedCode] = useState(false);
  const [testingStatus, setTestingStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'settings' | 'backend-snippet' | 'schema'>('settings');

  const handleSave = () => {
    onSaveConfig({
      ...config,
      apiKey: apiKey.trim(),
      endpointUrl: endpointUrl.trim(),
      mode,
    });
    onClose();
  };

  const handleTestConnection = async () => {
    setTestingStatus('testing');
    setTestMessage('Verifying endpoint accessibility...');

    if (mode === 'simulated') {
      setTimeout(() => {
        setTestingStatus('success');
        setTestMessage('Simulated Singapore MAS FX pipeline active with live micro-ticks.');
      }, 500);
      return;
    }

    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (apiKey) headers['x-api-key'] = apiKey;

      const res = await fetch(endpointUrl, { headers });
      if (res.ok) {
        setTestingStatus('success');
        setTestMessage('Connection successful! Backend responded with HTTP 200 OK.');
      } else {
        setTestingStatus('failed');
        setTestMessage(`Received HTTP ${res.status} (${res.statusText}). Once your backend proxy is running, it will connect seamlessly.`);
      }
    } catch (err: any) {
      setTestingStatus('failed');
      setTestMessage('Backend route not yet mounted (normal if running frontend-only mode). Simulated engine will handle data until your backend is added.');
    }
  };

  const backendCode = getBackendIntegrationCodeSample(apiKey);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(backendCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">MAS API & Backend Integration</h3>
              <p className="text-xs text-slate-500">
                Monetary Authority of Singapore eServices & Datastore Config
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-3 border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-red-600 text-red-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Connection & Key
          </button>
          <button
            onClick={() => setActiveTab('backend-snippet')}
            className={`pb-3 px-3 border-b-2 transition-colors ${
              activeTab === 'backend-snippet'
                ? 'border-red-600 text-red-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Backend Proxy Code
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-3 px-3 border-b-2 transition-colors ${
              activeTab === 'schema'
                ? 'border-red-600 text-red-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            MAS Schema Specification
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-sm">
          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* Architecture Notice */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <Database className="w-4 h-4 text-red-600" />
                  <span>Frontend-Ready Architecture</span>
                </div>
                <p>
                  As requested, this app operates with clean simulated SGD rates calibrated to MAS quotation rules. When you are ready to integrate your backend with MAS API keys, enter your key or proxy endpoint below.
                </p>
              </div>

              {/* Mode Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Exchange Rate Source Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('simulated')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      mode === 'simulated'
                        ? 'border-red-600 bg-red-50/50 text-slate-900 ring-1 ring-red-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Simulated MAS Fixing</span>
                      {mode === 'simulated' && <Check className="w-3.5 h-3.5 text-red-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Calibrated Singapore benchmark rates with realistic live micro-ticks. Ideal for frontend testing.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('live')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      mode === 'live'
                        ? 'border-red-600 bg-red-50/50 text-slate-900 ring-1 ring-red-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Live MAS Backend Proxy</span>
                      {mode === 'live' && <Check className="w-3.5 h-3.5 text-red-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Fetches directly from your backend proxy endpoint or MAS API eServices.
                    </p>
                  </button>
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    MAS Developer API Key
                  </label>
                  <span className="text-[11px] text-slate-400">Optional for simulated mode</span>
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="e.g. mas_live_9b48c17e..."
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-red-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Obtain your key from the official MAS Developer Portal (eservices.mas.gov.sg). Stored securely in your browser.
                </p>
              </div>

              {/* Endpoint URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Backend Proxy Endpoint URL
                </label>
                <input
                  type="text"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  placeholder="/api/mas-exchange-rates"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-red-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Default: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">/api/mas-exchange-rates</code> or external MAS datastore URL.
                </p>
              </div>

              {/* Connection Test */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingStatus === 'testing'}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingStatus === 'testing' ? 'animate-spin' : ''}`} />
                  <span>Test Endpoint Status</span>
                </button>

                {testingStatus !== 'idle' && (
                  <div className={`mt-2 p-2.5 rounded-lg text-xs font-medium ${
                    testingStatus === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    testingStatus === 'failed' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {testMessage}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'backend-snippet' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  Ready-to-Paste Express / Node.js Backend Route
                </span>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied to clipboard' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
                <code>{backendCode}</code>
              </pre>

              <div className="text-xs text-slate-500 space-y-1">
                <p><strong>Resource ID:</strong> <code className="bg-slate-100 px-1 rounded">{MAS_DATASTORE_RESOURCE_ID}</code></p>
                <p>This queries the official MAS End of Day Exchange Rates datastore search API.</p>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase">
                Official MAS Datastore Columns & Fields
              </span>
              <p className="text-xs text-slate-600">
                MAS publishes exchange rates with specific key naming conventions. Singular currencies are quoted per 1 unit, while several Asian/global currencies are quoted per 100 units.
              </p>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="p-2.5 font-semibold">Field Name</th>
                      <th className="p-2.5 font-semibold">Currency</th>
                      <th className="p-2.5 font-semibold">Standard Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr>
                      <td className="p-2.5 text-red-600 font-semibold">usd_sgd</td>
                      <td className="p-2.5 font-sans">US Dollar</td>
                      <td className="p-2.5">1 USD</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-red-600 font-semibold">myr_sgd_100</td>
                      <td className="p-2.5 font-sans">Malaysian Ringgit</td>
                      <td className="p-2.5">100 MYR</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-red-600 font-semibold">jpy_sgd_100</td>
                      <td className="p-2.5 font-sans">Japanese Yen</td>
                      <td className="p-2.5">100 JPY</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-red-600 font-semibold">thb_sgd_100</td>
                      <td className="p-2.5 font-sans">Thai Baht</td>
                      <td className="p-2.5">100 THB</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-red-600 font-semibold">idr_sgd_100</td>
                      <td className="p-2.5 font-sans">Indonesian Rupiah</td>
                      <td className="p-2.5">100 IDR</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-red-600 font-semibold">eur_sgd</td>
                      <td className="p-2.5 font-sans">Euro</td>
                      <td className="p-2.5">1 EUR</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-red-600 font-semibold">gbp_sgd</td>
                      <td className="p-2.5 font-sans">British Pound</td>
                      <td className="p-2.5">1 GBP</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
