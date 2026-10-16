import type { Request, Response } from 'express';

const MAS_API_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily';

// In-memory cache for serverless invocation reuse
interface CacheEntry {
  data: any;
  cachedAt: number;
}
const rateCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Calculates default latest Singapore business date (YYYY-MM-DD)
 */
function getDefaultSgtDate(): string {
  // Singapore is UTC+8
  const sgtNow = new Date(Date.now() + 8 * 3600 * 1000);
  // If weekend or earlier than 16:30, fallback to recent weekday
  let target = new Date(sgtNow);
  const day = target.getUTCDay();
  if (day === 0) { // Sunday -> Friday
    target.setUTCDate(target.getUTCDate() - 2);
  } else if (day === 6) { // Saturday -> Friday
    target.setUTCDate(target.getUTCDate() - 1);
  } else if (target.getUTCHours() < 16 || (target.getUTCHours() === 16 && target.getUTCMinutes() < 30)) {
    // Current day's fixing might not be released yet, default to previous day
    target.setUTCDate(target.getUTCDate() - 1);
    if (target.getUTCDay() === 0) target.setUTCDate(target.getUTCDate() - 2);
  }
  return target.toISOString().split('T')[0];
}

/**
 * Serverless / Express handler for /api/exchangerates
 * Queries Monetary Authority of Singapore (MAS) Exchange Rates End of Period Daily endpoint
 */
export default async function handler(req: Request, res: Response) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const queryDate = (req.query.end_of_day as string) || (req.query.date as string) || getDefaultSgtDate();
  const masKeyId =
    process.env.MAS_KEY_ID ||
    (req.headers['keyid'] as string) ||
    (req.headers['x-api-key'] as string) ||
    '';

  const cacheKey = `mas_rate_${queryDate}`;
  const cached = rateCache.get(cacheKey);

  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cached.data);
  }

  // If KeyId is not configured or is placeholder, return instructive response
  if (!masKeyId || masKeyId === 'MY_MAS_KEY_ID' || masKeyId === '<MAS_KEY_ID>') {
    const instructiveResponse = {
      success: true,
      mode: 'mock_unconfigured_key',
      notice: 'MAS_KEY_ID environment variable is not yet set. Set MAS_KEY_ID to stream live MAS data.',
      endpoint: `${MAS_API_ENDPOINT}?end_of_day=${queryDate}`,
      requiredHeader: 'KeyId: <YOUR_MAS_KEY_ID>',
      dateRequested: queryDate,
      rates: getIndicativeMasRates(queryDate),
    };
    return res.status(200).json(instructiveResponse);
  }

  try {
    const masUrl = new URL(MAS_API_ENDPOINT);
    masUrl.searchParams.set('end_of_day', queryDate);

    const masResponse = await fetch(masUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'KeyId': masKeyId,
        'User-Agent': 'MoneyXhange-MAS-Connector/1.0',
      },
    });

    if (!masResponse.ok) {
      const errorBody = await masResponse.text();
      return res.status(masResponse.status).json({
        success: false,
        error: `MAS Gateway responded with HTTP ${masResponse.status}`,
        details: errorBody || masResponse.statusText,
        endpoint: masUrl.toString(),
        fallbackRates: getIndicativeMasRates(queryDate),
      });
    }

    const masData = await masResponse.json();

    const output = {
      success: true,
      mode: 'live_mas_gateway',
      end_of_day: queryDate,
      retrievedAt: new Date().toISOString(),
      rawMasData: masData,
    };

    rateCache.set(cacheKey, { data: output, cachedAt: Date.now() });
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(output);
  } catch (error: any) {
    console.error('Error fetching from MAS gateway:', error);
    return res.status(502).json({
      success: false,
      error: 'Failed to communicate with MAS gateway',
      message: error?.message || 'Upstream network timeout',
      fallbackRates: getIndicativeMasRates(queryDate),
    });
  }
}

/**
 * Indicative fallback values matching MAS datastore schema
 */
function getIndicativeMasRates(date: string) {
  return {
    end_of_day: date,
    usd_sgd: 1.3435,
    myr_sgd_100: 28.69,
    jpy_sgd_100: 0.8945,
    eur_sgd: 1.4582,
    gbp_sgd: 1.7125,
    aud_sgd: 0.8842,
    cny_sgd_100: 18.56,
    thb_sgd_100: 3.818,
    idr_sgd_100: 0.00844,
    hkd_sgd: 0.1728,
    krw_sgd_100: 0.0976,
    twd_sgd_100: 4.152,
    inr_sgd_100: 1.578,
    php_sgd_100: 2.348,
    vnd_sgd_100: 0.00533,
    chf_sgd: 1.5186,
    cad_sgd: 0.9825,
    nzd_sgd: 0.8124,
    aed_sgd: 0.3658,
    sar_sgd: 0.3582,
  };
}
