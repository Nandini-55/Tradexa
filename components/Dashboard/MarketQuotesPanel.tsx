import { getStockQuote } from "@/lib/actions/finnhub.actions";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const MARKET_SYMBOLS = [
    { symbol: 'RELIANCE.NS', name: 'Reliance', exchange: 'NSE' },
    { symbol: 'TCS.NS', name: 'TCS', exchange: 'NSE' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', exchange: 'NSE' },
    { symbol: 'INFY.NS', name: 'Infosys', exchange: 'NSE' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', exchange: 'NSE' },
    { symbol: 'AAPL', name: 'Apple', exchange: 'US' },
    { symbol: 'MSFT', name: 'Microsoft', exchange: 'US' },
    { symbol: 'TSLA', name: 'Tesla', exchange: 'US' },
];

interface QuoteResult {
    symbol: string;
    name: string;
    exchange: string;
    price: number;
    changePercent: number;
}

export default async function MarketQuotesPanel() {
    let quotes: QuoteResult[] = [];
    try {
        const results = await Promise.allSettled(
            MARKET_SYMBOLS.map(async (s) => {
                const q = await getStockQuote(s.symbol);
                return {
                    symbol: s.symbol,
                    name: s.name,
                    exchange: s.exchange,
                    price: q.c || 0,
                    changePercent: q.dp || 0,
                };
            })
        );
        quotes = results
            .filter((r): r is PromiseFulfilledResult<QuoteResult> => r.status === 'fulfilled' && r.value.price > 0)
            .map((r) => r.value);
    } catch (e) {
        console.error('MarketQuotesPanel error:', e);
    }

    if (!quotes.length) {
        return (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                Market data unavailable
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto custom-scrollbar">
            {quotes.map((q) => {
                const isPositive = q.changePercent >= 0;
                return (
                    <div
                        key={q.symbol}
                        className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/[0.06]"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className={cn(
                                "w-1 h-8 rounded-full flex-shrink-0",
                                isPositive ? "bg-emerald-400" : "bg-rose-400"
                            )} />
                            <div>
                                <p className="text-xs font-bold text-white leading-none mb-1">{q.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-medium">{q.exchange}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-white font-mono">
                                {formatPrice(q.price, q.exchange === 'NSE' || q.exchange === 'BSE' ? 'INR' : 'USD')}
                            </span>
                            <div className={cn(
                                "flex items-center gap-0.5 text-[10px] font-semibold font-mono",
                                isPositive ? "text-emerald-400" : "text-rose-400"
                            )}>
                                {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {isPositive ? '+' : ''}{q.changePercent.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
