"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Landmark, ArrowRight, Zap } from "lucide-react";
import { getPortfolioWithLivePrices, getTransactionHistory } from "@/lib/actions/portfolio.actions";
import PortfolioOverview from "@/components/VirtualTrading/PortfolioOverview";
import HoldingsTable from "@/components/VirtualTrading/HoldingsTable";
import TransactionHistory from "@/components/VirtualTrading/TransactionHistory";
import QuickTradePanel from "@/components/VirtualTrading/QuickTradePanel";
import VirtualCoin from "@/components/VirtualCoin";

interface TradingClientProps {
    userId: string;
    initialPortfolio: any;
    initialTransactions: any[];
}

export default function TradingClient({ userId, initialPortfolio, initialTransactions }: TradingClientProps) {
    const [portfolio, setPortfolio] = useState(initialPortfolio);
    const [transactions, setTransactions] = useState(initialTransactions);
    const [refreshing, setRefreshing] = useState(false);

    const refreshData = async () => {
        setRefreshing(true);
        try {
            // Refresh portfolio and transactions after trade
            const newPortfolio = await getPortfolioWithLivePrices(userId);
            const newTransactions = await getTransactionHistory(userId, 20);
            setPortfolio(newPortfolio);
            setTransactions(newTransactions);
        } finally {
            setRefreshing(false);
        }
    };

    // Auto-refresh when coins update or when user returns to the tab
    useEffect(() => {
        const handleCoinsUpdated = () => {
            refreshData();
        };

        window.addEventListener('coins-updated', handleCoinsUpdated);
        window.addEventListener('focus', handleCoinsUpdated);

        return () => {
            window.removeEventListener('coins-updated', handleCoinsUpdated);
            window.removeEventListener('focus', handleCoinsUpdated);
        };
    }, [userId]);

    const stats = {
        balance: portfolio.balance,
        totalInvested: portfolio.totalInvested || 0,
        totalCurrentValue: portfolio.totalCurrentValue || 0,
        totalValue: portfolio.totalValue || portfolio.balance,
        totalProfitLoss: portfolio.totalProfitLoss || 0,
        totalProfitLossPercent: portfolio.totalProfitLossPercent || 0,
        statsUSD: portfolio.statsUSD,
        statsINR: portfolio.statsINR,
    };

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#121319]/80 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-1/4 w-96 h-32 bg-[#7033F6]/10 rounded-full blur-3xl pointer-events-none" />
                    <div>
                        <div className="flex items-center gap-3 mb-1.5">
                            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Virtual Trading</h1>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#7033F6]/20 text-[#A78BFA] border border-[#7033F6]/40">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Live Sim
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">Real-time simulation with instant trade execution and automated portfolio tracking</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
                        <Link
                            href="/kuberx"
                            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/30 hover:border-amber-500/60 text-amber-300 hover:text-amber-200 transition-all text-xs font-bold shadow-[0_0_20px_rgba(245,158,11,0.15)] group cursor-pointer"
                        >
                            <Landmark className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
                            <span>KuberX Bank · Need Coins?</span>
                            <ArrowRight className="h-3.5 w-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <div className="flex items-center gap-2 bg-white/[0.04] px-4 py-2 rounded-2xl border border-white/[0.06]">
                            <span className="text-xs text-muted-foreground font-medium">Starting:</span>
                            <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1">
                                <VirtualCoin className="h-3.5 w-3.5" /> 10,000 Coins
                            </span>
                        </div>
                    </div>
                </div>

                {/* Low Coins Warning Banner */}
                {portfolio.balance < 2500 && (
                    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#121319] to-[#121319] border border-amber-500/30 shadow-[0_10px_30px_rgba(245,158,11,0.1)]">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                                <Zap className="h-4 w-4 animate-bounce" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white">Running Low on Virtual Coins?</h4>
                                <p className="text-xs text-muted-foreground">
                                    Your wallet has under 🪙 2,500.00 left. Borrow up to 🪙 100,000 instantly with micro-interest from KuberX Bank.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/kuberx"
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-md flex-shrink-0 transition-all cursor-pointer"
                        >
                            <span>Borrow from KuberX</span>
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                )}

                {/* Portfolio Stats */}
                <PortfolioOverview stats={stats} loading={refreshing} />

                {/* Quick Trade + Holdings Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Quick Trade Panel */}
                    <div className="lg:col-span-1">
                        <QuickTradePanel userId={userId} onTradeComplete={refreshData} />
                    </div>

                    {/* Holdings */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-5 bg-[#7033F6] rounded-full"></span>
                                Your Active Holdings
                            </h2>
                            <span className="text-xs text-muted-foreground bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
                                {portfolio.holdings?.length || 0} Positions
                            </span>
                        </div>
                        <HoldingsTable holdings={portfolio.holdings} userId={userId} onTradeComplete={refreshData} loading={refreshing} />
                    </div>
                </div>

                {/* Transaction History */}
                <TransactionHistory transactions={transactions} />
            </div>
        </div>
    );
}
