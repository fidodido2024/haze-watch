import { Currency, MasApiConfig } from '../types/currency';
import { INITIAL_CURRENCIES } from '../data/currencies';

const STORAGE_KEY = 'singarate_mas_config_v1';

export const DEFAULT_MAS_CONFIG: MasApiConfig = {
  apiKey: '',
  endpointUrl: 'https://eservices.mas.gov.sg/api/action/datastore/search.json',
  mode: 'simulated',
  lastUpdated: new Date().toISOString(),
  autoRefreshInterval: 60, // seconds
};

export const MAS_DATASTORE_RESOURCE_ID = '95932927-c4bc-4753-accc-99e9d3ac96bb';

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
 * Generates an example backend integration template code snippet
 * so the user can easily copy and paste into their backend proxy (Express, Cloud Function, etc.)
 */
export function getBackendIntegrationCodeSample(apiKey: string = 'YOUR_MAS_API_KEY'): string {
  return `// Backend proxy example (e.g. server.ts or /api/exchange-rates.ts)
// The Monetary Authority of Singapore (MAS) Exchange Rates API:
import express from 'express';

const app = express();
const MAS_API_KEY = process.env.MAS_API_KEY || '${apiKey || 'YOUR_MAS_API_KEY'}';
const MAS_RESOURCE_ID = '95932927-c4bc-4753-accc-99e9d3ac96bb';

app.get('/api/mas-exchange-rates', async (req, res) => {
  try {
    const url = new URL('https://eservices.mas.gov.sg/api/action/datastore/search.json');
    url.searchParams.set('resource_id', MAS_RESOURCE_ID);
    url.searchParams.set('limit', '1');
    url.searchParams.set('sort', 'end_of_day desc');

    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    if (MAS_API_KEY) {
      headers['x-api-key'] = MAS_API_KEY;
    }

    const response = await fetch(url.toString(), { headers });
    if (!response.ok) {
      throw new Error(\`MAS API error: \${response.statusText}\`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
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
  // If user configured a custom proxy endpoint and mode is 'live'
  if (config.mode === 'live' && config.endpointUrl) {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (config.apiKey) {
        headers['x-api-key'] = config.apiKey;
      }

      const res = await fetch(config.endpointUrl, { headers });
      if (res.ok) {
        const data = await res.json();
        const records = data?.result?.records || data?.records;
        if (records && records.length > 0) {
          const latestRecord = records[0];
          const mapped = mapMasRecordToCurrencies(latestRecord, INITIAL_CURRENCIES);
          return {
            currencies: mapped,
            lastUpdated: latestRecord.end_of_day || new Date().toISOString(),
            source: 'mas_live',
            rawRecord: latestRecord
          };
        }
      }
    } catch (err) {
      console.warn('Could not reach custom MAS backend endpoint, falling back to simulated benchmark rates:', err);
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
