"use client";

import { useEffect, useState } from "react";
import { formatPrice, getCurrencyForSymbol } from "@/lib/utils";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TradeDialog from "./TradeDialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Holding {
    symbol: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    totalValue: number;
    profitLoss: number;
    profitLossPercent: number;
}

interface HoldingsTableProps {
    holdings: Holding[];
    userId: string;
    onTradeComplete?: () => void;
    loading?: boolean;
}

export default function HoldingsTable({ holdings, userId, onTradeComplete, loading }: HoldingsTableProps) {
    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
    const [selectedPrice, setSelectedPrice] = useState<number>(0);
    const [livePrices, setLivePrices] = useState<Record<string, number>>({});

    // Poll for live prices every 10 seconds
    useEffect(() => {
        if (holdings.length === 0 || loading) return;

        const fetchPrices = async () => {
            const prices: Record<string, number> = {};

            await Promise.all(
                holdings.map(async (holding) => {
                    try {
                        const response = await fetch(`/api/quote?symbol=${encodeURIComponent(holding.symbol)}`);
                        const data = await response.json();
                        if (data.c && data.c > 0) {
                            prices[holding.symbol] = data.c;
                        } else {
                            prices[holding.symbol] = holding.currentPrice;
                        }
                    } catch (error) {
                        prices[holding.symbol] = holding.currentPrice;
                    }
                })
            );

            setLivePrices(prices);
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 1000); // Update every 1 second

        return () => clearInterval(interval);
    }, [holdings, loading]);

    if (loading) {
        return (
            <div className="glass-card border border-white/[0.08] bg-[#121319]/90 rounded-2xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.35)]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Symbol</th>
                                <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Qty</th>
                                <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg Price</th>
                                <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">LTP</th>
                                <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Value</th>
                                <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">P&L</th>
                                <th className="text-center p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Chart</th>
                                <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="border-b border-white/[0.04]">
                                    <td className="p-4"><Skeleton className="h-6 w-24 bg-white/[0.06]" /></td>
                                    <td className="p-4"><Skeleton className="h-6 w-12 ml-auto bg-white/[0.06]" /></td>
                                    <td className="p-4"><Skeleton className="h-6 w-24 ml-auto bg-white/[0.06]" /></td>
                                    <td className="p-4"><Skeleton className="h-6 w-24 ml-auto bg-white/[0.06]" /></td>
                                    <td className="p-4"><Skeleton className="h-6 w-24 ml-auto bg-white/[0.06]" /></td>
                                    <td className="p-4"><Skeleton className="h-6 w-24 ml-auto bg-white/[0.06]" /></td>
                                    <td className="p-4"><Skeleton className="h-6 w-12 mx-auto bg-white/[0.06]" /></td>
                                    <td className="p-4"><Skeleton className="h-8 w-16 ml-auto bg-white/[0.06] rounded-xl" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (holdings.length === 0) {
        return (
            <div className="glass-card border border-white/[0.08] bg-[#121319]/90 rounded-2xl p-12 text-center shadow-[0_15px_35px_rgba(0,0,0,0.35)]">
                <div className="w-16 h-16 rounded-2xl bg-[#7033F6]/10 flex items-center justify-center mx-auto mb-4 border border-[#7033F6]/20">
                    <TrendingUp className="h-8 w-8 text-[#8749FA]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1.5">No Active Holdings Yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">Select a stock using the Quick Trade panel to start building your simulated portfolio.</p>
            </div>
        );
    }

    return (
        <>
            <div className="glass-card border border-white/[0.08] bg-[#121319]/90 rounded-2xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.35)]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Symbol</th>
                                <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Qty</th>
                                <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg Price</th>
                                <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">LTP</th>
                                <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Value</th>
                                <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">P&L</th>
                                <th className="text-center p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Chart</th>
                                <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {holdings.map((holding) => {
                                const livePrice = livePrices[holding.symbol] || holding.currentPrice;
                                const currentValue = livePrice * holding.quantity;
                                const costBasis = holding.averagePrice * holding.quantity;
                                const profitLoss = currentValue - costBasis;
                                const profitLossPercent = (profitLoss / costBasis) * 100;
                                const isProfit = profitLoss >= 0;

                                return (
                                    <tr key={holding.symbol} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-[#7033F6]/15 border border-[#7033F6]/25 flex items-center justify-center">
                                                    <span className="font-bold text-xs text-[#A78BFA]">{holding.symbol.slice(0, 3)}</span>
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white block text-sm">{holding.symbol}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase font-medium">{holding.symbol.endsWith('.NS') ? 'NSE India' : 'US Market'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right text-white/90 font-mono font-semibold">{holding.quantity}</td>
                                        <td className="p-4 text-right text-muted-foreground font-mono text-sm">{formatPrice(holding.averagePrice, getCurrencyForSymbol(holding.symbol))}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-white font-mono font-bold">{formatPrice(livePrice, getCurrencyForSymbol(holding.symbol))}</span>
                                                <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                    Live
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right text-white font-mono font-bold">{formatPrice(currentValue, getCurrencyForSymbol(holding.symbol))}</td>
                                        <td className="p-4 text-right">
                                            <div className={`flex flex-col items-end ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                <span className="font-bold font-mono text-sm flex items-center gap-1">
                                                    {isProfit ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                                                    {isProfit ? '+' : ''}{formatPrice(profitLoss, getCurrencyForSymbol(holding.symbol))}
                                                </span>
                                                <span className="text-xs font-semibold">
                                                    {isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <a
                                                href={`/stocks/${holding.symbol}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs font-medium text-[#A78BFA] hover:text-white bg-[#7033F6]/10 hover:bg-[#7033F6]/20 px-2.5 py-1 rounded-lg border border-[#7033F6]/30 transition-all"
                                            >
                                                <BarChart3 className="h-3.5 w-3.5" />
                                                View
                                            </a>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedSymbol(holding.symbol);
                                                    setSelectedPrice(livePrice);
                                                }}
                                                className="bg-gradient-to-r from-[#6231F5] to-[#8749FA] hover:from-[#5424E3] hover:to-[#7737EB] text-white text-xs font-bold rounded-xl shadow-[0_4px_15px_rgba(112,51,246,0.35)] cursor-pointer h-8 px-3.5"
                                            >
                                                Trade
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedSymbol && (
                <TradeDialog
                    symbol={selectedSymbol}
                    currentPrice={selectedPrice}
                    userId={userId}
                    isOpen={!!selectedSymbol}
                    onOpenChange={(open) => {
                        if (!open) setSelectedSymbol(null);
                    }}
                    onTradeComplete={() => {
                        setSelectedSymbol(null);
                        onTradeComplete?.();
                    }}
                    hideTrigger={true}
                />
            )}
        </>
    );
}
