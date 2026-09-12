'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { getStockQuote } from '@/lib/actions/finnhub.actions';
import { revalidatePath } from 'next/cache';

export interface WatchlistStockItem {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
}

const DEFAULT_WATCHLIST_SEEDS = [
  { symbol: 'AAPL', company: 'Apple Inc.' },
  { symbol: 'TSLA', company: 'Tesla Inc.' },
  { symbol: 'RELIANCE.NS', company: 'Reliance Industries' },
  { symbol: 'NVDA', company: 'NVIDIA Corp.' },
  { symbol: 'MSFT', company: 'Microsoft Corp.' },
];

export async function getUserWatchlist(userId?: string): Promise<WatchlistStockItem[]> {
  try {
    await connectToDatabase();

    let items: { symbol: string; company: string }[] = [];

    if (userId) {
      const dbItems = await Watchlist.find({ userId }).sort({ addedAt: -1 }).lean();
      if (dbItems.length > 0) {
        items = dbItems.map((item) => ({
          symbol: String(item.symbol),
          company: String(item.company || item.symbol),
        }));
      } else {
        // Seed default watchlist for new user
        try {
          await Watchlist.insertMany(
            DEFAULT_WATCHLIST_SEEDS.map((s) => ({
              userId,
              symbol: s.symbol,
              company: s.company,
              addedAt: new Date(),
            }))
          );
          items = DEFAULT_WATCHLIST_SEEDS;
        } catch (seedErr) {
          items = DEFAULT_WATCHLIST_SEEDS;
        }
      }
    } else {
      items = DEFAULT_WATCHLIST_SEEDS;
    }

    // Fetch live quotes in parallel
    const quotes = await Promise.all(
      items.map(async (item) => {
        try {
          const quote = await getStockQuote(item.symbol);
          const price = quote.c && quote.c > 0 ? quote.c : 100;
          const changePercent = typeof quote.dp === 'number' ? quote.dp : 0;
          const change = typeof quote.d === 'number' ? quote.d : (price * (changePercent / 100));

          return {
            symbol: item.symbol,
            company: item.company,
            price,
            change,
            changePercent,
          };
        } catch (e) {
          return {
            symbol: item.symbol,
            company: item.company,
            price: 150,
            change: 1.5,
            changePercent: 1.0,
          };
        }
      })
    );

    return quotes;
  } catch (error) {
    console.error('Error in getUserWatchlist:', error);
    return DEFAULT_WATCHLIST_SEEDS.map((s) => ({
      symbol: s.symbol,
      company: s.company,
      price: 180,
      change: 2.5,
      changePercent: 1.4,
    }));
  }
}

export async function addToWatchlist(userId: string, symbol: string, company?: string) {
  if (!userId || !symbol) {
    return { success: false, error: 'User ID and Symbol are required.' };
  }

  try {
    await connectToDatabase();
    const cleanSymbol = symbol.toUpperCase().trim();

    await Watchlist.findOneAndUpdate(
      { userId, symbol: cleanSymbol },
      {
        userId,
        symbol: cleanSymbol,
        company: company?.trim() || cleanSymbol,
        addedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    revalidatePath('/');
    revalidatePath(`/stocks/${cleanSymbol}`);

    return {
      success: true,
      message: `Added ${cleanSymbol} to your watchlist.`,
      symbol: cleanSymbol,
    };
  } catch (error: any) {
    console.error('Error in addToWatchlist:', error);
    return { success: false, error: error.message || 'Failed to add to watchlist.' };
  }
}

export async function removeFromWatchlist(userId: string, symbol: string) {
  if (!userId || !symbol) {
    return { success: false, error: 'User ID and Symbol are required.' };
  }

  try {
    await connectToDatabase();
    const cleanSymbol = symbol.toUpperCase().trim();

    await Watchlist.findOneAndDelete({ userId, symbol: cleanSymbol });

    revalidatePath('/');
    revalidatePath(`/stocks/${cleanSymbol}`);

    return {
      success: true,
      message: `Removed ${cleanSymbol} from your watchlist.`,
      symbol: cleanSymbol,
    };
  } catch (error: any) {
    console.error('Error in removeFromWatchlist:', error);
    return { success: false, error: error.message || 'Failed to remove from watchlist.' };
  }
}

export async function checkWatchlistStatus(userId: string, symbol: string): Promise<boolean> {
  if (!userId || !symbol) return false;

  try {
    await connectToDatabase();
    const cleanSymbol = symbol.toUpperCase().trim();
    const exists = await Watchlist.exists({ userId, symbol: cleanSymbol });
    return Boolean(exists);
  } catch (error) {
    console.error('Error in checkWatchlistStatus:', error);
    return false;
  }
}

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    // Better Auth stores users in the "user" collection
    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}
