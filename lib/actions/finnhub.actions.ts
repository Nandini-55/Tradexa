'use server';

import { getDateRange, validateArticle, formatArticle } from '@/lib/utils';
import { POPULAR_STOCK_SYMBOLS } from '@/lib/constants';
import { cache } from 'react';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? '';

async function fetchJSON<T>(url: string, revalidateSeconds?: number): Promise<T> {
  const options: RequestInit & { next?: { revalidate?: number } } = revalidateSeconds
    ? { cache: 'force-cache', next: { revalidate: revalidateSeconds } }
    : { cache: 'no-store' };

  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Fetch failed ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export { fetchJSON };

async function fetchYahooMarketNews(): Promise<MarketNewsArticle[]> {
  try {
    const res = await fetch('https://finance.yahoo.com/news/rssindex', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    return items.slice(0, 6).map((item, idx) => {
      const rawTitle = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1] || 'Market News';
      const link = item.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/)?.[1] || '#';
      const pubDateStr = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1];
      const datetime = pubDateStr ? Math.floor(new Date(pubDateStr).getTime() / 1000) : Math.floor(Date.now() / 1000);
      const headline = rawTitle
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
      return {
        id: Date.now() + idx,
        headline,
        url: link.trim(),
        datetime,
        source: 'Yahoo Finance',
        summary: '',
        category: 'general',
        related: '',
        image: '',
      };
    });
  } catch (err) {
    console.error('Yahoo market news fallback error:', err);
    return [];
  }
}

export async function getNews(symbols?: string[]): Promise<MarketNewsArticle[]> {
  try {
    const range = getDateRange(5);
    const token =
      process.env.FINNHUB_API_KEY ||
      process.env.NEXT_PUBLIC_FINNHUB_API_KEY ||
      process.env.NEXT_PUBLIC_NEXT_PUBLIC_FINNHUB_API_KEY ||
      NEXT_PUBLIC_FINNHUB_API_KEY;

    if (!token) {
      return await fetchYahooMarketNews();
    }
    const cleanSymbols = (symbols || [])
      .map((s) => s?.trim().toUpperCase())
      .filter((s): s is string => Boolean(s));

    const maxArticles = 6;

    // If we have symbols, try to fetch company news per symbol and round-robin select
    if (cleanSymbols.length > 0) {
      const perSymbolArticles: Record<string, RawNewsArticle[]> = {};

      await Promise.all(
        cleanSymbols.map(async (sym) => {
          try {
            const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(sym)}&from=${range.from}&to=${range.to}&token=${token}`;
            const articles = await fetchJSON<RawNewsArticle[]>(url, 300);
            perSymbolArticles[sym] = (articles || []).filter(validateArticle);
          } catch (e) {
            console.error('Error fetching company news for', sym, e);
            perSymbolArticles[sym] = [];
          }
        })
      );

      const collected: MarketNewsArticle[] = [];
      // Round-robin up to 6 picks
      for (let round = 0; round < maxArticles; round++) {
        for (let i = 0; i < cleanSymbols.length; i++) {
          const sym = cleanSymbols[i];
          const list = perSymbolArticles[sym] || [];
          if (list.length === 0) continue;
          const article = list.shift();
          if (!article || !validateArticle(article)) continue;
          collected.push(formatArticle(article, true, sym, round));
          if (collected.length >= maxArticles) break;
        }
        if (collected.length >= maxArticles) break;
      }

      if (collected.length > 0) {
        // Sort by datetime desc
        collected.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
        return collected.slice(0, maxArticles);
      }
      // If none collected, fall through to general news
    }

    // General market news fallback or when no symbols provided
    const generalUrl = `${FINNHUB_BASE_URL}/news?category=general&token=${token}`;
    const general = await fetchJSON<RawNewsArticle[]>(generalUrl, 300);

    const seen = new Set<string>();
    const unique: RawNewsArticle[] = [];
    for (const art of general || []) {
      if (!validateArticle(art)) continue;
      const key = `${art.id}-${art.url}-${art.headline}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(art);
      if (unique.length >= 20) break; // cap early before final slicing
    }

    const formatted = unique.slice(0, maxArticles).map((a, idx) => formatArticle(a, false, undefined, idx));
    if (formatted.length > 0) {
      return formatted;
    }
    return await fetchYahooMarketNews();
  } catch (err) {
    console.error('getNews error, using Yahoo Finance fallback:', err);
    return await fetchYahooMarketNews();
  }
}

const DEFAULT_STOCK_CATALOG: StockWithWatchlistStatus[] = [
  // US Top Tech & Market Leaders
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Google)', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'META', name: 'Meta Platforms Inc. (Facebook)', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'AMD', name: 'Advanced Micro Devices', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'ORCL', name: 'Oracle Corporation', exchange: 'NYSE', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'CRM', name: 'Salesforce Inc.', exchange: 'NYSE', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', exchange: 'NYSE', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'COIN', name: 'Coinbase Global Inc.', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'PLTR', name: 'Palantir Technologies', exchange: 'NYSE', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'DIS', name: 'Walt Disney Company', exchange: 'NYSE', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', exchange: 'NASDAQ', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'BABA', name: 'Alibaba Group Holding', exchange: 'NYSE', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'BA', name: 'Boeing Company', exchange: 'NYSE', type: 'Common Stock', isInWatchlist: false },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', exchange: 'NYSE Arca', type: 'ETF', isInWatchlist: false },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq 100)', exchange: 'NASDAQ', type: 'ETF', isInWatchlist: false },

  // Indian Giants (NSE Nifty 50 & Market Favorites)
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'INFY.NS', name: 'Infosys Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'SBIN.NS', name: 'State Bank of India (SBI)', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'ITC.NS', name: 'ITC Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'LT.NS', name: 'Larsen & Toubro Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'TATASTEEL.NS', name: 'Tata Steel Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'AXISBANK.NS', name: 'Axis Bank Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'MARUTI.NS', name: 'Maruti Suzuki India Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'WIPRO.NS', name: 'Wipro Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'ADANIENT.NS', name: 'Adani Enterprises Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'ADANIPORTS.NS', name: 'Adani Ports & SEZ', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical Industries', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'TITAN.NS', name: 'Titan Company Ltd (Tata)', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'ZOMATO.NS', name: 'Zomato Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'PAYTM.NS', name: 'One97 Communications (Paytm)', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'JIOFIN.NS', name: 'Jio Financial Services', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'HAL.NS', name: 'Hindustan Aeronautics Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'BEL.NS', name: 'Bharat Electronics Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'TRENT.NS', name: 'Trent Ltd (Tata)', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'POWERGRID.NS', name: 'Power Grid Corporation of India', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'NTPC.NS', name: 'NTPC Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'ONGC.NS', name: 'Oil & Natural Gas Corporation', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
  { symbol: 'M&M.NS', name: 'Mahindra & Mahindra Ltd', exchange: 'NSE', type: 'Equity', isInWatchlist: false },
];

export const searchStocks = cache(async (query?: string): Promise<StockWithWatchlistStatus[]> => {
  try {
    const rawQuery = typeof query === 'string' ? query.trim() : '';
    const trimmed = rawQuery.toUpperCase();

    let localMatches: StockWithWatchlistStatus[] = [];
    if (!trimmed) {
      localMatches = DEFAULT_STOCK_CATALOG.slice(0, 15);
    } else {
      localMatches = DEFAULT_STOCK_CATALOG.filter(s => {
        const sym = s.symbol.toUpperCase();
        const baseSym = sym.replace(/\.(NS|BO)$/, '');
        const name = s.name.toUpperCase();
        return sym.includes(trimmed) || baseSym.includes(trimmed) || name.includes(trimmed);
      });
    }

    // 1. If Finnhub token configured, try Finnhub search
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    if (token && trimmed) {
      try {
        const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(rawQuery)}&token=${token}`;
        const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
        const finnhubResults = Array.isArray(data?.result) ? data.result : [];

        const mappedFinnhub: StockWithWatchlistStatus[] = finnhubResults
          .filter(r => r.symbol && !r.symbol.includes('.'))
          .map((r) => ({
            symbol: r.symbol.toUpperCase(),
            name: r.description || r.symbol,
            exchange: r.displaySymbol || 'US',
            type: r.type || 'Stock',
            isInWatchlist: false,
          }))
          .slice(0, 10);

        const seen = new Set(localMatches.map(s => s.symbol));
        for (const item of mappedFinnhub) {
          if (!seen.has(item.symbol)) {
            seen.add(item.symbol);
            localMatches.push(item);
          }
        }
      } catch (e) {
        console.warn('Finnhub search failed:', e);
      }
    }

    // 2. Query Yahoo Finance Search API for international & US symbols without requiring API key
    if (trimmed && localMatches.length < 10) {
      try {
        const yahooSearchUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(rawQuery)}`;
        const yahooRes = await fetch(yahooSearchUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          next: { revalidate: 3600 }
        });

        if (yahooRes.ok) {
          const yahooData = await yahooRes.json();
          const quotes = Array.isArray(yahooData?.quotes) ? yahooData.quotes : [];

          const seen = new Set(localMatches.map(s => s.symbol));
          for (const q of quotes) {
            if (!q.symbol) continue;
            const sym = q.symbol.toUpperCase();
            if (!seen.has(sym)) {
              seen.add(sym);
              localMatches.push({
                symbol: sym,
                name: q.shortname || q.longname || sym,
                exchange: q.exchDisp || q.exchange || 'US',
                type: q.typeDisp || 'Stock',
                isInWatchlist: false,
              });
            }
            if (localMatches.length >= 20) break;
          }
        }
      } catch (e) {
        console.warn('Yahoo search query failed:', e);
      }
    }

    // 3. If still no matches and query looks like a valid stock symbol (e.g. 1-10 uppercase chars)
    if (localMatches.length === 0 && /^[A-Z0-9.\-_]{1,12}$/i.test(trimmed)) {
      localMatches.push({
        symbol: trimmed,
        name: trimmed,
        exchange: trimmed.endsWith('.NS') ? 'NSE' : 'US',
        type: 'Common Stock',
        isInWatchlist: false,
      });
    }

    return localMatches.slice(0, 25);
  } catch (err) {
    console.error('Error in stock search:', err);
    return DEFAULT_STOCK_CATALOG.slice(0, 15);
  }
});

export async function getStockQuote(symbol: string): Promise<QuoteData> {
  try {
    // Check if this is an Indian stock (NSE/BSE)
    const { isIndianStock } = await import('@/lib/utils');
    const { getIndianStockQuote } = await import('./indian-stock-api.actions');

    if (isIndianStock(symbol)) {
      return await getIndianStockQuote(symbol);
    }

    // Try Finnhub for US stocks if token is available
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    if (token) {
      try {
        const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
        const data = await fetchJSON<QuoteData>(url, 0);
        if (data && data.c && data.c > 0) {
          return data;
        }
      } catch (err) {
        console.warn(`Finnhub quote failed for ${symbol}, falling back to Yahoo Finance`);
      }
    }

    // Fallback to Yahoo Finance for live real-time price (works for US stocks like AAPL, TSLA without API key)
    return await getIndianStockQuote(symbol);
  } catch (error) {
    console.error("Error fetching quote:", error);
    return { c: 0, dp: 0 };
  }
}



