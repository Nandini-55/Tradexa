"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, formatPrice, getCurrencyForSymbol } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { TrendingUp, TrendingDown, Trash2, Plus, Sparkles, Loader2 } from "lucide-react";
import { removeFromWatchlist, WatchlistStockItem } from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";

interface WatchlistProps {
    initialItems?: WatchlistStockItem[];
    userId?: string;
}

const DEFAULT_FALLBACK_WATCHLIST: WatchlistStockItem[] = [
    { symbol: "AAPL", company: "Apple Inc.", price: 182.52, change: 1.25, changePercent: 0.69 },
    { symbol: "TSLA", company: "Tesla Inc.", price: 238.45, change: -4.30, changePercent: -1.77 },
    { symbol: "RELIANCE.NS", company: "Reliance Industries", price: 2950.40, change: 15.20, changePercent: 0.52 },
    { symbol: "NVDA", company: "NVIDIA Corp.", price: 785.60, change: 12.45, changePercent: 1.61 },
    { symbol: "MSFT", company: "Microsoft Corp.", price: 405.12, change: 2.15, changePercent: 0.53 },
];

export default function Watchlist({ initialItems, userId }: WatchlistProps) {
    const router = useRouter();
    const [items, setItems] = useState<WatchlistStockItem[]>(
        initialItems && initialItems.length > 0 ? initialItems : DEFAULT_FALLBACK_WATCHLIST
    );
    const [deletingSymbol, setDeletingSymbol] = useState<string | null>(null);

    // Sync if initialItems changes
    useEffect(() => {
        if (initialItems && initialItems.length > 0) {
            setItems(initialItems);
        }
    }, [initialItems]);

    // Listen for cross-component watchlist updates
    useEffect(() => {
        const handleWatchlistChange = (e: any) => {
            if (e?.detail?.symbol) {
                if (e.detail.added === false) {
                    setItems((prev) => prev.filter((i) => i.symbol !== e.detail.symbol));
                }
            }
        };

        window.addEventListener('watchlist-updated', handleWatchlistChange);
        return () => window.removeEventListener('watchlist-updated', handleWatchlistChange);
    }, []);

    const handleRemove = async (symbol: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setDeletingSymbol(symbol);

        // Optimistic UI update
        const previousItems = items;
        setItems((prev) => prev.filter((item) => item.symbol !== symbol));
        toast.success(`Removed ${symbol} from watchlist`);

        if (userId) {
            try {
                const res = await removeFromWatchlist(userId, symbol);
                if (!res.success) {
                    setItems(previousItems);
                    toast.error(res.error || "Failed to remove from watchlist");
                }
            } catch (err) {
                setItems(previousItems);
                toast.error("Network error removing item");
            } finally {
                setDeletingSymbol(null);
            }
        } else {
            setDeletingSymbol(null);
        }
    };

    return (
        <div className="bg-[#121319]/90 border border-white/[0.08] rounded-2xl p-5 shadow-[0_15px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7033F6]"></span>
                        My Watchlist
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground bg-white/[0.04] px-2.5 py-0.5 rounded-md border border-white/[0.06] uppercase tracking-wider">
                        {items.length} Ticker{items.length === 1 ? '' : 's'}
                    </span>
                </div>

                {items.length === 0 ? (
                    <div className="py-8 text-center space-y-3 border border-dashed border-white/[0.08] rounded-xl p-4 bg-white/[0.01]">
                        <div className="w-10 h-10 rounded-xl bg-[#7033F6]/15 flex items-center justify-center mx-auto text-[#A78BFA]">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white">Your Watchlist is Empty</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Add your favorite stocks to track them live with instant price updates.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {items.map((item) => {
                            const isPositive = item.change >= 0;
                            const isDeleting = deletingSymbol === item.symbol;

                            return (
                                <div
                                    key={item.symbol}
                                    onClick={() => router.push(`/stocks/${encodeURIComponent(item.symbol)}`)}
                                    className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] transition-all duration-200 cursor-pointer border border-transparent hover:border-white/[0.06]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-1 h-6 rounded-full transition-all group-hover:h-8",
                                            isPositive ? "bg-emerald-400" : "bg-rose-400"
                                        )} />
                                        <div>
                                            <div className="text-sm font-bold text-white tracking-tight leading-none mb-1 group-hover:text-[#A78BFA] transition-colors">
                                                {item.symbol}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider line-clamp-1 max-w-[120px]">
                                                {item.company || 'Active'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-white tracking-tight leading-none mb-1 font-mono">
                                                <AnimatedNumber
                                                    value={item.price}
                                                    format={(v) => formatPrice(v, getCurrencyForSymbol(item.symbol))}
                                                />
                                            </div>
                                            <div className={cn(
                                                "text-[11px] font-semibold flex items-center justify-end gap-1 font-mono",
                                                isPositive ? "text-emerald-400" : "text-rose-400"
                                            )}>
                                                {isPositive ? "+" : ""}
                                                <AnimatedNumber value={item.changePercent} format={(v) => v.toFixed(2)} />%
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            title={`Remove ${item.symbol} from watchlist`}
                                            aria-label={`Remove ${item.symbol} from watchlist`}
                                            disabled={isDeleting}
                                            onClick={(e) => handleRemove(item.symbol, e)}
                                            className="p-2 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all text-muted-foreground hover:text-rose-400 hover:bg-rose-500/15 rounded-lg border border-transparent hover:border-rose-500/30 cursor-pointer"
                                        >
                                            {isDeleting ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-400" />
                                            ) : (
                                                <Trash2 className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Link
                href="/trading"
                className="mt-5 w-full py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white hover:bg-[#7033F6]/15 rounded-xl transition-all border border-white/[0.04] hover:border-[#7033F6]/40 cursor-pointer flex items-center justify-center gap-1.5 group"
            >
                <Plus className="h-3.5 w-3.5 text-[#A78BFA] group-hover:scale-110 transition-transform" />
                <span>Trade Watchlist Tickers</span>
            </Link>
        </div>
    );
}
