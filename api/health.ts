import type { Request, Response } from 'express';

export interface HealthCheckResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  sgtTime: string;
  uptimeSeconds: number;
  environment: string;
  masIntegration: {
    targetEndpoint: string;
    keyIdConfigured: boolean;
    headerName: string;
    documentation: string;
  };
}

/**
 * Serverless / Express handler for /api/health
 */
export default async function handler(req: Request, res: Response) {
  const masKeyId = process.env.MAS_KEY_ID || process.env.MAS_API_KEY || '';
  const now = new Date();

  const responseData: HealthCheckResponse = {
    status: 'ok',
    timestamp: now.toISOString(),
    sgtTime: now.toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }) + ' SGT',
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    masIntegration: {
      targetEndpoint: 'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily',
      keyIdConfigured: Boolean(masKeyId && masKeyId !== 'MY_MAS_KEY_ID'),
      headerName: 'KeyId',
      documentation: 'https://eservices.mas.gov.sg/api/action/datastore/search.json',
    },
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.status(200).json(responseData);
}
