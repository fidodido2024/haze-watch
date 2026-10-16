import { Currency, MasApiConfig } from '../types/currency';
import { INITIAL_CURRENCIES } from '../data/currencies';

const STORAGE_KEY = 'singarate_mas_config_v1';

export const DEFAULT_MAS_CONFIG: MasApiConfig = {
  apiKey: '',
  endpointUrl: '/api/exchangerates',
  mode: 'simulated',
  lastUpdated: new Date().toISOString(),
  autoRefreshInterval: 60, // seconds
};

export const MAS_GATEWAY_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily';

export function getStoredMasConfig(): MasApiConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_MAS_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_MAS_CONFIG;
}

export function saveStoredMasConfig(config: MasApiConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save MAS API configuration:', e);
  }
}

/**
 * Generates backend integration documentation
 */
export function getBackendIntegrationCodeSample(apiKey: string = 'YOUR_MAS_KEY_ID'): string {
  return `// Serverless / Express MAS Exchange Rate Gateway
// Endpoint: ${MAS_GATEWAY_ENDPOINT}?end_of_day=2026-10-14
// Header: KeyId: <MAS_KEY_ID>

import fetch from 'node-fetch';

export async function fetchLiveMasRates(date: string = '2026-10-14') {
  const masKeyId = process.env.MAS_KEY_ID || '${apiKey || 'YOUR_MAS_KEY_ID'}';
  const url = new URL('${MAS_GATEWAY_ENDPOINT}');
  url.searchParams.set('end_of_day', date);

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'KeyId': masKeyId,
      'User-Agent': 'MoneyXhange-MAS-Gateway/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(\`MAS Gateway error: \${response.statusText}\`);
  }

  return await response.json();
}
`;
}

/**
 * Fetch rates from custom backend or return calibrated real-time data
 */
export async function fetchExchangeRates(config: MasApiConfig): Promise<{
  currencies: Currency[];
  lastUpdated: string;
  source: 'mas_live' | 'backend_proxy' | 'simulated_fixing';
  rawRecord?: Record<string, any>;
}> {
  // If user configured a custom proxy endpoint or local /api/exchangerates
  if (config.mode === 'live' || config.endpointUrl === '/api/exchangerates') {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (config.apiKey) {
        headers['KeyId'] = config.apiKey;
        headers['x-api-key'] = config.apiKey;
      }

      const res = await fetch(config.endpointUrl, { headers });
      if (res.ok) {
        const data = await res.json();
        const rawRates = data?.rates || data?.result?.records?.[0] || data?.records?.[0] || data?.rawMasData;
        if (rawRates) {
          const mapped = mapMasRecordToCurrencies(rawRates, INITIAL_CURRENCIES);
          return {
            currencies: mapped,
            lastUpdated: rawRates.end_of_day || new Date().toISOString(),
            source: data.mode === 'live_mas_gateway' ? 'mas_live' : 'backend_proxy',
            rawRecord: rawRates,
          };
        }
      }
    } catch (err) {
      console.warn('Could not reach backend /api/exchangerates endpoint, falling back to simulated benchmark rates:', err);
    }
  }

  // Simulated live market updates (with realistic micro-ticks for FX market vitality)
  const updated = INITIAL_CURRENCIES.map(curr => {
    // gentle jitter (+/- 0.04%) to simulate live interbank ticks
    const jitterFactor = 1 + (Math.sin(Date.now() / 10000 + curr.code.charCodeAt(0)) * 0.0004);
    const newRate = +(curr.rateToSgd * jitterFactor).toFixed(curr.unitMultiplier === 1 ? 4 : 6);
    const newSgdToCurr = +(1 / newRate).toFixed(curr.code === 'IDR' || curr.code === 'VND' ? 1 : 4);
    
    return {
      ...curr,
      rateToSgd: newRate,
      sgdToCurrency: newSgdToCurr,
    };
  });

  return {
    currencies: updated,
    lastUpdated: new Date().toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' SGT',
    source: 'simulated_fixing'
  };
}

/**
 * Maps MAS dataset columns (e.g. usd_sgd, myr_sgd_100, jpy_sgd_100) to our internal Currency models
 */
function mapMasRecordToCurrencies(record: Record<string, any>, baseList: Currency[]): Currency[] {
  return baseList.map(curr => {
    const rawVal = record[curr.masDatasetCode] || record[curr.code.toLowerCase() + '_sgd'];
    if (rawVal !== undefined && rawVal !== null) {
      const numVal = parseFloat(rawVal);
      if (!isNaN(numVal) && numVal > 0) {
        // If it's a "Per 100 Units" quote (like 100 JPY = 0.8945 SGD), rate per single unit is numVal / 100
        const ratePerUnit = curr.unitMultiplier === 100 ? numVal / 100 : numVal;
        const sgdToForeign = +(1 / ratePerUnit).toFixed(curr.code === 'IDR' || curr.code === 'VND' ? 1 : 4);
        return {
          ...curr,
          rateToSgd: ratePerUnit,
          sgdToCurrency: sgdToForeign,
          change24h: +(curr.change24h).toFixed(2),
        };
      }
    }
    return curr;
  });
}
