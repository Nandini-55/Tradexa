"use client";

import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StockItem {
    symbol: string;
    name: string;
    price: number;
    changePercent: number;
    logo?: string;
}

interface StockListCardProps {
    title: string;
    stocks: StockItem[];
    type: 'gainers' | 'losers';
}

export default function StockListCard({ title, stocks, type }: StockListCardProps) {
    const isGainers = type === 'gainers';

    return (
        <div className="bg-[#121319]/90 border border-white/[0.08] rounded-2xl p-5 shadow-[0_15px_35px_rgba(0,0,0,0.35)] overflow-hidden h-full flex flex-col backdrop-blur-xl">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isGainers ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                    {title}
                </h3>
                <div className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    isGainers ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                )}>
                    {isGainers ? "Bullish" : "Bearish"}
                </div>
            </div>

            <div className="space-y-2 flex-grow">
                {stocks.map((stock) => (
                    <div key={stock.symbol} className="group cursor-pointer flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.03] transition-all duration-200 border border-transparent hover:border-white/[0.04]">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-[#7033F6]/15 border border-[#7033F6]/25 flex items-center justify-center font-bold text-xs text-[#A78BFA] group-hover:scale-105 transition-transform">
                                {stock.symbol.slice(0, 2)}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white tracking-tight leading-none mb-1 group-hover:text-[#A78BFA] transition-colors">{stock.symbol}</div>
                                <div className="text-[11px] text-muted-foreground font-medium truncate max-w-[110px]">{stock.name}</div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-sm font-bold tracking-tight text-white leading-none mb-1 font-mono">
                                <AnimatedNumber
                                    value={stock.price}
                                    format={(v) => `₹${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                />
                            </div>
                            <div className={cn(
                                "text-[11px] font-semibold flex items-center justify-end gap-1 font-mono",
                                isGainers ? "text-emerald-400" : "text-rose-400"
                            )}>
                                {isGainers ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {isGainers ? "+" : ""}<AnimatedNumber value={stock.changePercent} format={(v) => v.toFixed(2)} />%
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="mt-5 w-full py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white hover:bg-[#7033F6]/10 rounded-xl transition-all border border-white/[0.04] hover:border-[#7033F6]/30 cursor-pointer">
                View All {title}
            </button>
        </div>
    );
}
