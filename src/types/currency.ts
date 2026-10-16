export type CurrencyRegion = 'All' | 'ASEAN' | 'Major' | 'Asia-Pacific' | 'Europe' | 'Americas' | 'Middle East & Africa' | 'Favorites';

export type QuoteDisplayMode = 'sgd_base' | 'foreign_base' | 'mas_standard';

export interface Currency {
  code: string;              // e.g., 'USD', 'MYR', 'JPY'
  name: string;              // e.g., 'US Dollar', 'Malaysian Ringgit'
  symbol: string;            // e.g., '$', 'RM', '¥'
  country: string;           // e.g., 'United States', 'Malaysia'
  flag: string;              // Emoji flag or code
  region: 'ASEAN' | 'Major' | 'Asia-Pacific' | 'Europe' | 'Americas' | 'Middle East & Africa';
  unitMultiplier: number;    // 1 for most, 100 for JPY, KRW, IDR, THB, INR, PHP, VND, TWD as per MAS standard
  rateToSgd: number;         // 1 Foreign Unit = X SGD (e.g. 1 USD = 1.3435 SGD)
  sgdToCurrency: number;     // 1 SGD = X Foreign Units (e.g. 1 SGD = 0.7443 USD)
  change24h: number;         // Percentage change e.g. +0.25 or -0.18
  high24h: number;           // 24h high in SGD
  low24h: number;            // 24h low in SGD
  history7d: number[];       // 7 data points in SGD
  history30d: { date: string; rate: number }[];
  masDatasetCode: string;    // MAS API datastore column identifier e.g., 'usd_sgd', 'jpy_sgd_100'
  masRateType: 'Per Unit' | 'Per 100 Units';
  popular: boolean;
}

export interface MasApiConfig {
  apiKey: string;
  endpointUrl: string;
  mode: 'simulated' | 'live';
  lastUpdated: string;
  autoRefreshInterval: number; // in seconds
}

export interface MoneyChangerBenchmark {
  source: string;
  spreadPercent: number;
  description: string;
}
