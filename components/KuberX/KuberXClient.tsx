"use client";

import { useState, useEffect } from "react";
import {
    BankingOverview,
    takeLoan,
    repayLoan,
    quickTopUpWallet
} from "@/lib/actions/banking.actions";
import VirtualCoin from "@/components/VirtualCoin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Landmark,
    ShieldCheck,
    Coins,
    TrendingUp,
    Clock,
    CheckCircle2,
    Loader2,
    Sparkles,
    Zap,
    Scale,
    Percent,
    PlusCircle,
    ArrowDownRight
} from "lucide-react";

interface KuberXClientProps {
    userId: string;
    initialOverview: BankingOverview;
}

const LOAN_TIERS = [
    {
        id: 'STARTER',
        name: 'Starter Liquidity',
        amount: 5000,
        tenureDays: 7,
        interestRate: 3,
        popular: false,
        desc: 'Ideal for quick trading opportunities and fast recovery',
    },
    {
        id: 'TRADER',
        name: 'Pro Trader Boost',
        amount: 25000,
        tenureDays: 14,
        interestRate: 5,
        popular: true,
        desc: 'Maximum leverage for swing trades and large equity positions',
    },
    {
        id: 'VAULT',
        name: 'Kuber Royal Vault',
        amount: 100000,
        tenureDays: 30,
        interestRate: 8,
        popular: false,
        desc: 'High-volume capital for serious long-term market plays',
    },
];

export default function KuberXClient({ userId, initialOverview }: KuberXClientProps) {
    const [overview, setOverview] = useState<BankingOverview>(initialOverview);
    const [loadingLoan, setLoadingLoan] = useState<string | null>(null);
    const [repayingId, setRepayingId] = useState<string | null>(null);
    const [toppingUp, setToppingUp] = useState<boolean>(false);
    const [balanceHighlight, setBalanceHighlight] = useState<boolean>(false);

    // Custom loan calculator state
    const [customAmount, setCustomAmount] = useState<number>(15000);
    const [customDays, setCustomDays] = useState<number>(14);

    const customInterestRate = customDays <= 7 ? 3 : customDays <= 14 ? 5 : 8;
    const customInterest = Math.round((customAmount * (customInterestRate / 100)) * 100) / 100;
    const customTotal = customAmount + customInterest;

    // Trigger balance flash helper
    const triggerBalanceFlash = () => {
        setBalanceHighlight(true);
        setTimeout(() => setBalanceHighlight(false), 2500);
    };

    // 1. Borrow Preset Tier
    const handleBorrowPreset = async (tier: typeof LOAN_TIERS[0]) => {
        if (loadingLoan) return;

        if (tier.amount > overview.availableCredit) {
            toast.error("Exceeds Credit Limit", {
                description: `This tier requires 🪙 ${tier.amount.toLocaleString()}, but your available credit is 🪙 ${overview.availableCredit.toLocaleString()}.`,
            });
            return;
        }

        if (overview.activeLoansCount >= 8) {
            toast.error("Active Loans Limit Reached", {
                description: "Please settle an active loan before taking a new one.",
            });
            return;
        }

        setLoadingLoan(tier.id);
        try {
            const res = await takeLoan(userId, {
                principalAmount: tier.amount,
                durationDays: tier.tenureDays,
                loanTier: tier.id,
            });

            if (res.success && res.overview) {
                setOverview(res.overview);
                triggerBalanceFlash();

                toast.success("🪙 Loan Approved & Disbursed!", {
                    description: `+🪙 ${tier.amount.toLocaleString()} has been added to your wallet in real-time.`,
                });

                if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent('coins-updated', { detail: { balance: res.newBalance } }));
                }
            } else {
                toast.error("Loan Request Failed", {
                    description: res.error || "Unable to disburse loan.",
                });
            }
        } catch (err: any) {
            console.error("Borrow error:", err);
            toast.error("Unexpected error occurred while requesting loan.");
        } finally {
            setLoadingLoan(null);
        }
    };

    // 2. Borrow Custom Amount
    const handleBorrowCustom = async () => {
        if (loadingLoan) return;

        if (!customAmount || customAmount < 100) {
            toast.error("Minimum loan amount is 100 Coins.");
            return;
        }
        if (customAmount > overview.availableCredit) {
            toast.error("Exceeds Available Credit", {
                description: `Requested 🪙 ${customAmount.toLocaleString()} exceeds your available limit of 🪙 ${overview.availableCredit.toLocaleString()}.`,
            });
            return;
        }

        setLoadingLoan('CUSTOM');
        try {
            const res = await takeLoan(userId, {
                principalAmount: customAmount,
                durationDays: customDays,
                loanTier: 'CUSTOM',
            });

            if (res.success && res.overview) {
                setOverview(res.overview);
                triggerBalanceFlash();

                toast.success("🪙 Loan Approved & Disbursed!", {
                    description: `+🪙 ${customAmount.toLocaleString()} has been added to your wallet in real-time.`,
                });

                if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent('coins-updated', { detail: { balance: res.newBalance } }));
                }
            } else {
                toast.error("Loan Request Failed", {
                    description: res.error || "Unable to disburse loan.",
                });
            }
        } catch (err: any) {
            console.error("Custom loan error:", err);
            toast.error("Unexpected error occurred while requesting loan.");
        } finally {
            setLoadingLoan(null);
        }
    };

    // 3. Settle / Repay Active Loan
    const handleRepay = async (loanId: string, neededAmount: number) => {
        if (repayingId) return;

        if (overview.walletBalance < neededAmount) {
            toast.error("Insufficient Coins in Wallet", {
                description: `You need 🪙 ${neededAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}, but only have 🪙 ${overview.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`,
            });
            return;
        }

        setRepayingId(loanId);
        try {
            const res = await repayLoan(userId, loanId);
            if (res.success && res.overview) {
                setOverview(res.overview);
                triggerBalanceFlash();

                toast.success("🎉 Loan Fully Settled!", {
                    description: res.message,
                });

                if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent('coins-updated', { detail: { balance: res.newBalance } }));
                }
            } else {
                toast.error("Repayment Failed", {
                    description: res.error,
                });
            }
        } catch (err: any) {
            console.error("Repay error:", err);
            toast.error("Repayment error occurred.");
        } finally {
            setRepayingId(null);
        }
    };

    // 4. Quick Direct Emergency Top-Up
    const handleQuickTopUp = async (amount: number = 10000) => {
        if (toppingUp) return;
        setToppingUp(true);
        try {
            const res = await quickTopUpWallet(userId, amount);
            if (res.success && res.overview) {
                setOverview(res.overview);
                triggerBalanceFlash();

                toast.success("⚡ Coins Credited!", {
                    description: `+🪙 ${amount.toLocaleString()} Virtual Coins have been instantly added to your wallet.`,
                });

                if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent('coins-updated', { detail: { balance: res.newBalance } }));
                }
            } else {
                toast.error("Top-up Failed", { description: res.error });
            }
        } catch (err) {
            toast.error("Failed to process top-up.");
        } finally {
            setToppingUp(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Hero Banner with Kuber Gold Ambient Glow */}
                <div className="relative rounded-3xl p-6 sm:p-8 bg-[#121319]/90 border border-amber-500/20 backdrop-blur-2xl overflow-hidden shadow-[0_20px_50px_rgba(245,158,11,0.08)]">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#7033F6]/15 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-black shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                                    <Landmark className="h-6 w-6 text-[#1A120B]" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">KuberX Bank</h1>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                            Virtual Credit Vault
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                        Instant Virtual Coin liquidity & loans with transparent micro-interest rates
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
                            {/* Instant Emergency Top-Up Button */}
                            <Button
                                onClick={() => handleQuickTopUp(10000)}
                                disabled={toppingUp}
                                className="h-11 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center gap-2"
                            >
                                {toppingUp ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                                ) : (
                                    <>
                                        <Zap className="h-4 w-4 fill-current" />
                                        <span>+🪙 10,000 Quick Grant</span>
                                    </>
                                )}
                            </Button>

                            <div className="bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 rounded-2xl flex items-center gap-2.5">
                                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Trust Tier</span>
                                    <span className="text-xs font-bold text-white">{overview.tierRating}</span>
                                </div>
                            </div>
                            <div className="bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 rounded-2xl flex items-center gap-2.5">
                                <Clock className="h-5 w-5 text-amber-400" />
                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Disbursement</span>
                                    <span className="text-xs font-bold text-emerald-400">Instant (0s)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4 Core Financial Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Wallet Liquid Balance */}
                    <Card className={`glass-card border bg-[#121319]/90 relative overflow-hidden group rounded-2xl transition-all duration-300 ${
                        balanceHighlight
                            ? 'border-emerald-400 ring-2 ring-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.4)] scale-[1.02]'
                            : 'border-white/[0.08] hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-[0_15px_30px_rgba(16,185,129,0.15)]'
                    }`}>
                        <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                                <span>Wallet Coins</span>
                                <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                                    <VirtualCoin className="h-4 w-4" />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2 font-mono">
                                <VirtualCoin className="h-6 w-6" />
                                {overview.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Available to Trade & Repay
                            </p>
                        </CardContent>
                    </Card>

                    {/* Active Outstanding Debt */}
                    <Card className={`glass-card border border-white/[0.08] bg-[#121319]/90 relative overflow-hidden group rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
                        overview.totalActiveDebt > 0
                            ? 'hover:border-rose-500/50 hover:shadow-[0_15px_30px_rgba(244,63,94,0.15)]'
                            : 'hover:border-white/20'
                    }`}>
                        <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl transition-all pointer-events-none ${
                            overview.totalActiveDebt > 0 ? 'bg-rose-500/10 group-hover:bg-rose-500/20' : 'bg-white/5'
                        }`} />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                                <span>Outstanding Debt</span>
                                <div className={`p-1.5 rounded-lg ${overview.totalActiveDebt > 0 ? 'bg-rose-500/15 text-rose-400' : 'bg-white/10 text-muted-foreground'}`}>
                                    <Scale className="h-4 w-4" />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${
                                overview.totalActiveDebt > 0 ? 'text-rose-400' : 'text-white'
                            }`}>
                                🪙 {overview.totalActiveDebt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">
                                {overview.activeLoansCount} Active Loan{overview.activeLoansCount === 1 ? '' : 's'} (Principal + Interest)
                            </p>
                        </CardContent>
                    </Card>

                    {/* Credit Limit Available */}
                    <Card className="glass-card border border-white/[0.08] bg-[#121319]/90 relative overflow-hidden group rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-[0_15px_30px_rgba(245,158,11,0.15)]">
                        <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                                <span>Credit Available</span>
                                <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                                    <Coins className="h-4 w-4" />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
                                🪙 {overview.availableCredit.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">
                                Out of 🪙 {overview.maxCreditLimit.toLocaleString()} Max Limit
                            </p>
                        </CardContent>
                    </Card>

                    {/* Kuber Trust Score */}
                    <Card className="glass-card border border-white/[0.08] bg-[#121319]/90 relative overflow-hidden group rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[#7033F6]/50 hover:shadow-[0_15px_30px_rgba(112,51,246,0.15)]">
                        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#7033F6]/10 rounded-full blur-2xl group-hover:bg-[#7033F6]/20 transition-all pointer-events-none" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                                <span>Kuber Credit Score</span>
                                <div className="p-1.5 rounded-lg bg-[#7033F6]/15 text-[#A78BFA]">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-baseline gap-2 font-mono">
                                <span className="text-[#A78BFA]">{overview.creditScore}</span>
                                <span className="text-xs text-muted-foreground font-normal">/ 850</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                {overview.repaidLoansCount} Loans Repaid on Time (+25 pts each)
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Instant Borrowing Tier Packages */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-5 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></span>
                                Choose a Loan Package
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Select a pre-approved liquidity package or customize your loan below
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {LOAN_TIERS.map((tier) => {
                            const interest = Math.round((tier.amount * (tier.interestRate / 100)) * 100) / 100;
                            const totalRepay = tier.amount + interest;
                            const isAvailable = tier.amount <= overview.availableCredit;
                            const isLoading = loadingLoan === tier.id;

                            return (
                                <Card
                                    key={tier.id}
                                    className={`relative rounded-2xl bg-[#121319]/90 border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                                        tier.popular
                                            ? 'border-amber-500/50 shadow-[0_10px_35px_rgba(245,158,11,0.12)]'
                                            : 'border-white/[0.08] hover:border-white/[0.18]'
                                    }`}
                                >
                                    {tier.popular && (
                                        <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-500 text-black text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-bl-xl shadow-sm">
                                            Most Popular
                                        </div>
                                    )}

                                    <CardHeader className="pb-3 pt-5">
                                        <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                                            {tier.name}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">{tier.desc}</p>
                                    </CardHeader>

                                    <CardContent className="space-y-4 pt-0">
                                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">Borrow Amount</span>
                                                <span className="text-lg font-black text-white font-mono flex items-center gap-1">
                                                    <VirtualCoin className="h-4 w-4" />
                                                    {tier.amount.toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Percent className="h-3 w-3 text-amber-400" /> Interest Rate
                                                </span>
                                                <span className="font-mono font-bold text-amber-400">
                                                    {tier.interestRate}% (🪙 {interest.toLocaleString()})
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3 text-[#A78BFA]" /> Tenure
                                                </span>
                                                <span className="font-mono font-bold text-white">
                                                    {tier.tenureDays} Days
                                                </span>
                                            </div>

                                            <div className="border-t border-white/[0.06] pt-2 flex items-center justify-between">
                                                <span className="text-xs font-semibold text-muted-foreground">Total to Repay</span>
                                                <span className="text-sm font-black text-amber-300 font-mono">
                                                    🪙 {totalRepay.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            className={`w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                                                tier.popular
                                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-[0_4px_15px_rgba(245,158,11,0.3)]'
                                                    : 'bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.08]'
                                            }`}
                                            disabled={Boolean(loadingLoan)}
                                            onClick={() => handleBorrowPreset(tier)}
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin text-current" />
                                                    <span>Disbursing Coins...</span>
                                                </div>
                                            ) : !isAvailable ? (
                                                `Limit Exceeded (🪙 ${overview.availableCredit.toLocaleString()})`
                                            ) : (
                                                `Borrow 🪙 ${tier.amount.toLocaleString()}`
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Custom Loan Calculator */}
                <div className="p-6 rounded-3xl bg-[#121319]/90 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden space-y-6">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-400" />
                        <h3 className="text-lg font-bold text-white">Custom Loan Calculator</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        <div className="lg:col-span-7 space-y-5">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <label className="font-bold text-muted-foreground uppercase tracking-wider">Loan Amount (Coins)</label>
                                    <span className="text-xs font-mono text-amber-400">
                                        Max Available: 🪙 {overview.availableCredit.toLocaleString()}
                                    </span>
                                </div>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        min={100}
                                        max={overview.availableCredit}
                                        step={500}
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(Math.max(0, Number(e.target.value)))}
                                        className="h-12 pl-4 pr-16 bg-white/[0.03] border-white/[0.08] text-white font-mono font-bold text-lg rounded-xl focus-visible:ring-amber-500/50"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground uppercase">
                                        Coins
                                    </div>
                                </div>

                                {/* Quick Increment Chips */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {[1000, 5000, 10000, 25000, 50000].map((amt) => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => setCustomAmount(amt)}
                                            className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-white/[0.03] hover:bg-amber-500/15 text-muted-foreground hover:text-amber-300 border border-white/[0.06] hover:border-amber-500/30 transition-all cursor-pointer"
                                        >
                                            🪙 {amt.toLocaleString()}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setCustomAmount(overview.availableCredit)}
                                        className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer"
                                    >
                                        Max (🪙 {overview.availableCredit.toLocaleString()})
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Repayment Tenure</label>
                                <div className="grid grid-cols-4 gap-2.5">
                                    {[7, 14, 30, 60].map((days) => (
                                        <button
                                            key={days}
                                            type="button"
                                            onClick={() => setCustomDays(days)}
                                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                                customDays === days
                                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                                    : 'bg-white/[0.03] border-white/[0.06] text-muted-foreground hover:text-white'
                                            }`}
                                        >
                                            {days} Days
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
                            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                Repayment Breakdown
                            </div>

                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Principal Capital</span>
                                <span className="font-mono font-bold text-white">🪙 {customAmount.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Interest ({customInterestRate}%)</span>
                                <span className="font-mono font-bold text-amber-400">+ 🪙 {customInterest.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Due Date</span>
                                <span className="font-mono text-white/90">
                                    {new Date(Date.now() + customDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="border-t border-white/[0.06] pt-3 flex justify-between items-center">
                                <span className="text-xs font-bold text-white">Total to Repay</span>
                                <span className="text-lg font-black text-amber-400 font-mono">
                                    🪙 {customTotal.toLocaleString()}
                                </span>
                            </div>

                            <Button
                                className="w-full h-11 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-[0_4px_15px_rgba(245,158,11,0.3)] transition-all"
                                disabled={Boolean(loadingLoan)}
                                onClick={handleBorrowCustom}
                            >
                                {loadingLoan === 'CUSTOM' ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-black" />
                                        <span>Processing Disbursement...</span>
                                    </div>
                                ) : (
                                    `Disburse 🪙 ${customAmount.toLocaleString()} Now`
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Active Loans & Repayment Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-5 bg-[#7033F6] rounded-full"></span>
                                Your Active Loans ({overview.activeLoans.length})
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Repay your loans to restore your wallet credit line and elevate your Kuber score
                            </p>
                        </div>
                    </div>

                    {overview.activeLoans.length === 0 ? (
                        <Card className="glass-card border border-white/[0.08] bg-[#121319]/90 p-8 rounded-2xl text-center space-y-2">
                            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                            <h3 className="text-sm font-bold text-white">Zero Active Debt!</h3>
                            <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                You have no outstanding loans with KuberX Bank. Your borrowing slate is completely clean.
                            </p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {overview.activeLoans.map((loan: any) => {
                                const remaining = loan.totalRepaymentAmount - (loan.amountPaid || 0);
                                const isRepaying = repayingId === loan._id;
                                const canAfford = overview.walletBalance >= remaining;

                                return (
                                    <Card
                                        key={loan._id}
                                        className="glass-card border border-amber-500/20 bg-[#121319]/90 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between space-y-4"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
                                                    {loan.loanTier} Loan
                                                </span>
                                                <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                                                    <Clock className="h-3 w-3 text-amber-400" />
                                                    Due: {new Date(loan.dueDate).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-3">
                                                <div>
                                                    <span className="text-[10px] text-muted-foreground block font-medium">Principal Borrowed</span>
                                                    <span className="font-mono font-bold text-white text-sm">
                                                        🪙 {loan.principalAmount.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] text-muted-foreground block font-medium">Interest ({loan.interestRate}%)</span>
                                                    <span className="font-mono font-bold text-amber-400 text-sm">
                                                        + 🪙 {loan.interestAmount.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between px-1">
                                                <span className="text-xs font-bold text-muted-foreground uppercase">Repayment Amount</span>
                                                <span className="text-lg font-black text-white font-mono">
                                                    🪙 {remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Button
                                                className={`w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                                                    canAfford
                                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)]'
                                                        : 'bg-white/[0.04] text-rose-400 border border-rose-500/20'
                                                }`}
                                                disabled={isRepaying}
                                                onClick={() => handleRepay(loan._id, remaining)}
                                            >
                                                {isRepaying ? (
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin text-current" />
                                                        <span>Processing Settlement...</span>
                                                    </div>
                                                ) : canAfford ? (
                                                    `Repay 🪙 ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Full`
                                                ) : (
                                                    `Need 🪙 ${(remaining - overview.walletBalance).toFixed(2)} More in Wallet`
                                                )}
                                            </Button>

                                            {!canAfford && (
                                                <p className="text-[10px] text-rose-400 text-center font-medium">
                                                    Use Quick Grant or trade stocks to acquire enough coins for repayment.
                                                </p>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Repaid History / Settlement Ledger */}
                {overview.repaidLoans.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Settlement Ledger (Completed Repayments)
                        </h3>

                        <div className="rounded-2xl border border-white/[0.08] bg-[#121319]/90 overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-white/[0.02] border-b border-white/[0.06] text-muted-foreground font-bold uppercase">
                                    <tr>
                                        <th className="p-3.5">Tier</th>
                                        <th className="p-3.5 text-right">Principal</th>
                                        <th className="p-3.5 text-right">Interest Paid</th>
                                        <th className="p-3.5 text-right">Total Settled</th>
                                        <th className="p-3.5 text-right">Repaid At</th>
                                        <th className="p-3.5 text-center">Trust Impact</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overview.repaidLoans.map((loan: any) => (
                                        <tr key={loan._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                            <td className="p-3.5 font-bold text-white">{loan.loanTier}</td>
                                            <td className="p-3.5 text-right font-mono text-muted-foreground">🪙 {loan.principalAmount.toLocaleString()}</td>
                                            <td className="p-3.5 text-right font-mono text-amber-400">+ 🪙 {loan.interestAmount.toFixed(2)}</td>
                                            <td className="p-3.5 text-right font-mono font-bold text-white">🪙 {loan.totalRepaymentAmount.toLocaleString()}</td>
                                            <td className="p-3.5 text-right text-muted-foreground font-mono">
                                                {loan.repaidAt ? new Date(loan.repaidAt).toLocaleDateString() : 'Settled'}
                                            </td>
                                            <td className="p-3.5 text-center">
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                    +25 Kuber Pts
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
