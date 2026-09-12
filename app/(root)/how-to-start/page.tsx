import Link from "next/link";
import {
    Coins,
    TrendingUp,
    Landmark,
    Sparkles,
    ShieldCheck,
    ArrowRight,
    Search,
    BarChart3,
    CheckCircle2,
    Zap,
    Scale,
    HelpCircle,
    Compass
} from "lucide-react";
import VirtualCoin from "@/components/VirtualCoin";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "How to Start | Tradexa & KuberX Guide",
    description: "Learn how to trade virtual stocks, explore AI market insights, and borrow liquidity from KuberX Bank.",
};

export default function HowToStartPage() {
    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-12">
            {/* Hero Section */}
            <div className="relative rounded-3xl p-8 sm:p-12 bg-[#121319]/90 border border-white/[0.08] backdrop-blur-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#7033F6]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-3xl space-y-5">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#7033F6]/15 text-[#A78BFA] border border-[#7033F6]/30 shadow-[0_0_15px_rgba(112,51,246,0.2)]">
                        <Compass className="h-4 w-4" />
                        Platform Starter Guide
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                        How to Master <span className="bg-gradient-to-r from-[#A78BFA] to-[#6231F5] bg-clip-text text-transparent">Tradexa</span> & <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">KuberX</span>
                    </h1>

                    <p className="text-base text-muted-foreground font-medium leading-relaxed">
                        Experience real-time stock market simulation with zero financial risk. Trade US & Indian equities with virtual coins, leverage AI predictions, and access instant liquidity loans whenever you need a capital boost.
                    </p>

                    {/* Quick Highlights Bar */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-semibold text-white">
                            <VirtualCoin className="h-4 w-4" />
                            <span>🪙 10,000 Starting Coins</span>
                        </div>
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-semibold text-emerald-400">
                            <ShieldCheck className="h-4 w-4" />
                            <span>100% Risk-Free Sim</span>
                        </div>
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-semibold text-amber-300">
                            <Landmark className="h-4 w-4" />
                            <span>KuberX Instant Credit</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4 Core Steps Workflow */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <span className="w-2.5 h-6 bg-gradient-to-b from-[#8749FA] to-[#6231F5] rounded-full"></span>
                        4 Steps to Start Trading & Borrowing
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Follow this simple roadmap to understand every layer of the Tradexa financial platform
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Step 1 */}
                    <div className="p-7 rounded-2xl bg-[#121319]/90 border border-white/[0.08] hover:border-[#7033F6]/40 transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.3)] space-y-4 group">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-black uppercase tracking-wider text-[#A78BFA] bg-[#7033F6]/15 px-3 py-1 rounded-full border border-[#7033F6]/30">
                                Step 01
                            </span>
                            <div className="p-2 rounded-xl bg-[#7033F6]/15 text-[#A78BFA]">
                                <Coins className="h-5 w-5" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white group-hover:text-[#A78BFA] transition-colors">
                            Your Free 🪙 10,000 Virtual Coins
                        </h3>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                            As soon as you sign in, your wallet is automatically credited with <strong className="text-white">🪙 10,000 Virtual Coins</strong>. This virtual capital is used to execute trades without risking any real personal money.
                        </p>

                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2 text-white font-semibold">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Dual Currency Valuation</span>
                            </div>
                            <p>Global US equities are priced in Virtual Coins (🪙), while Indian equities (NSE/BSE) are priced in Rupees (₹) and automatically converted at live rates.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="p-7 rounded-2xl bg-[#121319]/90 border border-white/[0.08] hover:border-cyan-500/40 transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.3)] space-y-4 group">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/15 px-3 py-1 rounded-full border border-cyan-500/30">
                                Step 02
                            </span>
                            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                                <Search className="h-5 w-5" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                            Research Stocks & AI Signals
                        </h3>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Use the global search bar (<kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono text-xs">⌘K</kbd>) to look up any stock like <strong className="text-white">AAPL</strong>, <strong className="text-white">TSLA</strong>, or <strong className="text-white">RELIANCE.NS</strong>.
                        </p>

                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs text-muted-foreground">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white font-semibold">
                                    <Sparkles className="h-3.5 w-3.5 text-[#A78BFA]" />
                                    <span>Tradexa DeepQuant AI (v4.5)</span>
                                </div>
                                <Link href="/ai-model" className="text-[10px] text-[#A78BFA] hover:underline font-bold">
                                    Model Proofs &rarr;
                                </Link>
                            </div>
                            <p>Our custom-trained multimodal model synthesizes breaking financial news, FinTwit/X expert sentiment, and multi-timeframe candlestick chart patterns into high-conviction Buy/Hold/Sell signals.</p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="p-7 rounded-2xl bg-[#121319]/90 border border-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.3)] space-y-4 group">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
                                Step 03
                            </span>
                            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                            Execute Virtual Trades (Buy & Sell)
                        </h3>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Head over to the <strong className="text-white">Trading Terminal</strong> to execute instant simulated trades. The permanent Quick Trade panel lets you search and trade continuously.
                        </p>

                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2 text-white font-semibold">
                                <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Real-Time Portfolio Tracking</span>
                            </div>
                            <p>Track your average buy price, holdings quantity, net asset value, and unrealized profit/loss updated dynamically with live market prices.</p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="p-7 rounded-2xl bg-[#121319]/90 border border-amber-500/20 hover:border-amber-500/50 transition-all duration-300 shadow-[0_15px_35px_rgba(245,158,11,0.08)] space-y-4 group">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-400 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
                                Step 04
                            </span>
                            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                                <Landmark className="h-5 w-5" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                            KuberX Bank: Instant Coin Loans
                        </h3>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Ran out of coins after a big trade? <strong className="text-amber-400">KuberX Bank</strong> is your virtual credit vault where you can borrow up to <strong className="text-white">🪙 250,000</strong> instantly with transparent micro-interest.
                        </p>

                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2 text-white font-semibold">
                                <Scale className="h-3.5 w-3.5 text-amber-400" />
                                <span>1-Click Repay & Kuber Credit Score</span>
                            </div>
                            <p>Repay when your trades turn a profit. Timely repayments boost your Kuber Credit Score (500–850) and unlock higher credit tiers like AAA Prime Kuber.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* KuberX Loan Packages Comparison */}
            <div className="p-8 rounded-3xl bg-[#121319]/90 border border-amber-500/20 shadow-[0_20px_50px_rgba(245,158,11,0.06)] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-2xl font-black text-white flex items-center gap-2.5">
                            <Landmark className="h-6 w-6 text-amber-400" />
                            <span>KuberX Loan Tiers Explained</span>
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Choose between fast liquidity, swing trader boost, or deep treasury credit
                        </p>
                    </div>
                    <Link
                        href="/kuberx"
                        className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                        <span>Open KuberX Vault</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Starter Tier</span>
                        <h4 className="text-lg font-bold text-white">Starter Liquidity</h4>
                        <div className="text-2xl font-black text-white font-mono">🪙 5,000</div>
                        <div className="text-xs text-muted-foreground space-y-1">
                            <div>• <strong>3%</strong> Micro-Interest</div>
                            <div>• <strong>7 Days</strong> Repayment Window</div>
                            <div>• Ideal for small recovery bets</div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/40 space-y-3 relative">
                        <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-black px-2 py-0.5 rounded-full">
                            Popular
                        </span>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Pro Tier</span>
                        <h4 className="text-lg font-bold text-white">Pro Trader Boost</h4>
                        <div className="text-2xl font-black text-amber-300 font-mono">🪙 25,000</div>
                        <div className="text-xs text-muted-foreground space-y-1">
                            <div>• <strong>5%</strong> Micro-Interest</div>
                            <div>• <strong>14 Days</strong> Repayment Window</div>
                            <div>• High leverage for swing trades</div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Vault Tier</span>
                        <h4 className="text-lg font-bold text-white">Royal Vault Credit</h4>
                        <div className="text-2xl font-black text-white font-mono">🪙 100,000</div>
                        <div className="text-xs text-muted-foreground space-y-1">
                            <div>• <strong>8%</strong> Micro-Interest</div>
                            <div>• <strong>30 Days</strong> Repayment Window</div>
                            <div>• Serious capital for portfolio scaling</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-2.5">
                        <HelpCircle className="h-6 w-6 text-[#A78BFA]" />
                        <span>Frequently Asked Questions</span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Clear answers to common questions about trading, loans, and credit scoring
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="p-5 rounded-2xl bg-[#121319]/90 border border-white/[0.08] space-y-2">
                        <h4 className="text-sm font-bold text-white">Do I ever lose real money on Tradexa?</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            No. Tradexa is a 100% simulated paper trading platform. All balances, orders, and loans use Virtual Coins (🪙) so you can test real-world trading strategies without financial risk.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#121319]/90 border border-white/[0.08] space-y-2">
                        <h4 className="text-sm font-bold text-white">How does KuberX loan interest work?</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Interest is fixed and calculated upfront (e.g. 3% for 7 days or 5% for 14 days). Nothing is charged when borrowing; the interest is only settled when you click "Repay" after closing trades.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#121319]/90 border border-white/[0.08] space-y-2">
                        <h4 className="text-sm font-bold text-white">Can I trade Indian stocks (NSE / BSE)?</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Yes! Tickers ending in <code className="text-[#A78BFA]">.NS</code> (like RELIANCE.NS, TCS.NS, INFY.NS) track live Indian market prices in Rupees (₹) with real-time conversion into your wallet.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#121319]/90 border border-white/[0.08] space-y-2">
                        <h4 className="text-sm font-bold text-white">How do I increase my Kuber Credit Limit?</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Each settled loan adds +25 points to your Kuber Trust Score. As your score climbs towards 850 (AAA Prime rating), your credit limit expands up to 🪙 500,000 coins.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#121319]/90 border border-white/[0.08] space-y-2">
                        <h4 className="text-sm font-bold text-white">What if I don't want to take a loan?</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            KuberX features an emergency <strong className="text-emerald-400">+🪙 10,000 Quick Grant</strong> button in the top banner that credits your wallet instantly with 1-click and zero repayment obligation.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#121319]/90 border border-white/[0.08] space-y-2">
                        <h4 className="text-sm font-bold text-white">How do Watchlists work?</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Click "Add to Watchlist" on any stock page to monitor live price movements directly from your dashboard. Click the trash icon to remove any ticker anytime.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#6231F5]/20 via-[#121319] to-amber-500/15 border border-white/[0.12] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                <div className="space-y-1.5">
                    <h3 className="text-2xl font-black text-white">Ready to Put Your Strategy to Work?</h3>
                    <p className="text-xs text-muted-foreground max-w-md">
                        Start trading real-world equities now with your 🪙 10,000 starting coins, or explore KuberX credit.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/trading"
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#6231F5] to-[#8749FA] hover:from-[#5424E3] hover:to-[#7737EB] text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(112,51,246,0.4)] transition-all flex items-center gap-2"
                    >
                        <span>Launch Trading Terminal</span>
                        <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                        href="/kuberx"
                        className="px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-bold transition-all"
                    >
                        <span>Explore KuberX Bank</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
