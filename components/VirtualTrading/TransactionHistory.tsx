"use client";

import { formatTimeAgo, formatPrice, getCurrencyForSymbol } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Plus, Clock } from "lucide-react";

interface Transaction {
    _id?: string;
    symbol: string;
    type: 'BUY' | 'SELL' | 'DEPOSIT' | 'LOAN_DISBURSED' | 'LOAN_REPAID' | string;
    quantity: number;
    price: number;
    totalAmount: number;
    date: Date;
}

interface TransactionHistoryProps {
    transactions: Transaction[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
    if (transactions.length === 0) {
        return (
            <div className="glass-card border border-white/[0.08] bg-[#121319]/90 rounded-2xl p-12 text-center shadow-[0_15px_35px_rgba(0,0,0,0.35)]">
                <div className="w-16 h-16 rounded-2xl bg-[#7033F6]/10 flex items-center justify-center mx-auto mb-4 border border-[#7033F6]/20">
                    <Clock className="h-8 w-8 text-[#8749FA]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1.5">No Transactions Yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">Your completed trades, loans, and wallet deposits will be logged here in real-time.</p>
            </div>
        );
    }

    return (
        <div className="glass-card border border-white/[0.08] bg-[#121319]/90 rounded-2xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.35)]">
            <div className="p-6 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-[#7033F6]/15 text-[#8749FA]">
                        <Clock className="h-4 w-4" />
                    </div>
                    Transaction History
                </h2>
                <span className="text-xs text-muted-foreground bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
                    {transactions.length} Records
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/[0.08] bg-white/[0.01]">
                            <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                            <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Type</th>
                            <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Symbol</th>
                            <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Quantity</th>
                            <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Price</th>
                            <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx, idx) => {
                            const isBuy = tx.type === 'BUY';
                            const isDeposit = tx.type === 'DEPOSIT';
                            const isLoanDisbursed = tx.type === 'LOAN_DISBURSED';
                            const isLoanRepaid = tx.type === 'LOAN_REPAID';

                            let badgeStyle = 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
                            let icon = <ArrowUpRight className="h-3 w-3" />;
                            let label = tx.type;

                            if (isDeposit) {
                                badgeStyle = 'bg-[#7033F6]/15 text-[#A78BFA] border border-[#7033F6]/30';
                                icon = <Plus className="h-3 w-3" />;
                            } else if (isBuy) {
                                badgeStyle = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
                                icon = <ArrowDownRight className="h-3 w-3" />;
                            } else if (isLoanDisbursed) {
                                badgeStyle = 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
                                icon = <Plus className="h-3 w-3" />;
                                label = 'LOAN BORROW';
                            } else if (isLoanRepaid) {
                                badgeStyle = 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30';
                                icon = <ArrowUpRight className="h-3 w-3" />;
                                label = 'LOAN REPAID';
                            }

                            return (
                                <tr key={tx._id || idx} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                                    <td className="p-4 text-muted-foreground text-xs font-medium">
                                        {formatTimeAgo(new Date(tx.date).getTime() / 1000)}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${badgeStyle}`}>
                                            {icon}
                                            {label}
                                        </span>
                                    </td>
                                    <td className="p-4 text-white font-bold text-sm">{tx.symbol}</td>
                                    <td className="p-4 text-right text-white/90 font-mono font-semibold">{tx.quantity}</td>
                                    <td className="p-4 text-right text-muted-foreground font-mono text-xs">
                                        {isLoanDisbursed || isLoanRepaid 
                                            ? '🪙 1.00' 
                                            : formatPrice(tx.price, getCurrencyForSymbol(tx.symbol))}
                                    </td>
                                    <td className="p-4 text-right text-white font-mono font-bold">
                                        {isLoanDisbursed 
                                            ? `+🪙 ${tx.totalAmount.toLocaleString()}` 
                                            : isLoanRepaid 
                                            ? `-🪙 ${tx.totalAmount.toLocaleString()}`
                                            : formatPrice(tx.totalAmount, tx.type === 'DEPOSIT' ? 'USD' : getCurrencyForSymbol(tx.symbol))}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
