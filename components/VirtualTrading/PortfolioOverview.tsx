"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Activity, Coins } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import VirtualCoin from "@/components/VirtualCoin";

interface CurrencyStats {
    invested: number;
    currentValue: number;
    profitLoss: number;
    profitLossPercent: number;
}

interface PortfolioStats {
    balance: number;
    totalInvested: number;
    totalCurrentValue: number;
    totalValue: number;
    totalProfitLoss: number;
    totalProfitLossPercent: number;
    statsUSD: CurrencyStats;
    statsINR: CurrencyStats;
}

interface PortfolioOverviewProps {
    stats: PortfolioStats;
    loading?: boolean;
}

export default function PortfolioOverview({ stats, loading }: PortfolioOverviewProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="glass-card border border-white/[0.08] bg-[#121319]/90 text-foreground relative overflow-hidden h-36 rounded-2xl">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-28 bg-white/[0.06]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-36 mb-2 bg-white/[0.06]" />
                            <Skeleton className="h-3 w-20 bg-white/[0.06]" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const isUSDProfit = stats.statsUSD.profitLoss >= 0;
    const isINRProfit = stats.statsINR.profitLoss >= 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Buying Power */}
            <Card className="glass-card border border-white/[0.08] bg-[#121319]/90 hover:border-[#7033F6]/50 text-foreground relative overflow-hidden group rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(112,51,246,0.15)]">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#7033F6]/15 rounded-full blur-2xl pointer-events-none group-hover:bg-[#7033F6]/25 transition-all" />
                <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-25 transition-opacity">
                    <Wallet className="h-16 w-16 text-[#8749FA]" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#7033F6]/15 text-[#8749FA] flex items-center justify-center">
                            <VirtualCoin className="h-3.5 w-3.5" />
                        </div>
                        Buying Power
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black tracking-tight text-white">{formatPrice(stats.balance)}</div>
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5 font-medium">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Available in Wallet
                    </p>
                </CardContent>
            </Card>

            {/* Total Net Worth */}
            <Card className="glass-card border border-white/[0.08] bg-[#121319]/90 hover:border-cyan-500/50 text-foreground relative overflow-hidden group rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(6,182,212,0.15)]">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
                <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-25 transition-opacity">
                    <Activity className="h-16 w-16 text-cyan-400" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400">
                            <Activity className="h-3.5 w-3.5" />
                        </div>
                        Total Net Worth
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black tracking-tight text-white">{formatPrice(stats.totalValue)}</div>
                    <p className="text-xs text-muted-foreground mt-1.5 font-medium">Global Valuation (Coins)</p>
                </CardContent>
            </Card>

            {/* Coins P&L */}
            <Card className={`glass-card border border-white/[0.08] bg-[#121319]/90 text-foreground relative overflow-hidden group rounded-2xl transition-all duration-300 hover:-translate-y-1 ${isUSDProfit ? 'hover:border-emerald-500/50 hover:shadow-[0_15px_30px_rgba(16,185,129,0.15)]' : 'hover:border-rose-500/50 hover:shadow-[0_15px_30px_rgba(244,63,94,0.15)]'}`}>
                <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-all ${isUSDProfit ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20' : 'bg-rose-500/10 group-hover:bg-rose-500/20'}`} />
                <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-25 transition-opacity">
                    {isUSDProfit ? (
                        <TrendingUp className="h-16 w-16 text-emerald-400" />
                    ) : (
                        <TrendingDown className="h-16 w-16 text-rose-400" />
                    )}
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${isUSDProfit ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                            {isUSDProfit ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        </div>
                        Coins P&L
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-3xl font-black tracking-tight ${isUSDProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isUSDProfit ? '+' : ''}{formatPrice(stats.statsUSD.profitLoss, 'USD')}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isUSDProfit ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'}`}>
                            {isUSDProfit ? '+' : ''}{stats.statsUSD.profitLossPercent.toFixed(2)}%
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium">All Time (Coins)</span>
                    </div>
                </CardContent>
            </Card>

            {/* INR P&L */}
            <Card className={`glass-card border border-white/[0.08] bg-[#121319]/90 text-foreground relative overflow-hidden group rounded-2xl transition-all duration-300 hover:-translate-y-1 ${isINRProfit ? 'hover:border-purple-500/50 hover:shadow-[0_15px_30px_rgba(139,92,246,0.15)]' : 'hover:border-rose-500/50 hover:shadow-[0_15px_30px_rgba(244,63,94,0.15)]'}`}>
                <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-all ${isINRProfit ? 'bg-purple-500/10 group-hover:bg-purple-500/20' : 'bg-rose-500/10 group-hover:bg-rose-500/20'}`} />
                <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-25 transition-opacity">
                    <Coins className={`h-16 w-16 ${isINRProfit ? 'text-purple-400' : 'text-rose-400'}`} />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${isINRProfit ? 'bg-[#7033F6]/15 text-[#A78BFA]' : 'bg-rose-500/15 text-rose-400'}`}>
                            <Coins className="h-3.5 w-3.5" />
                        </div>
                        INR P&L
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-3xl font-black tracking-tight ${isINRProfit ? 'text-purple-400' : 'text-rose-400'}`}>
                        {isINRProfit ? '+' : ''}{formatPrice(stats.statsINR.profitLoss, 'INR')}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isINRProfit ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'}`}>
                            {isINRProfit ? '+' : ''}{stats.statsINR.profitLossPercent.toFixed(2)}%
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium">Indian Equities</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
