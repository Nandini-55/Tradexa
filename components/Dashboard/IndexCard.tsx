"use client";

import { AnimatedNumber } from "@/components/ui/animated-number";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface IndexCardProps {
    name: string;
    value: number;
    change: number;
    changePercent: number;
    sparklineData?: number[];
}

export default function IndexCard({ name, value, change, changePercent, sparklineData = [30, 40, 35, 50, 49, 60, 70, 91, 125] }: IndexCardProps) {
    const isPositive = change >= 0;

    return (
        <div className="bg-[#121319]/90 hover:bg-[#161722] transition-all duration-300 border border-white/[0.08] hover:border-[#7033F6]/50 rounded-2xl p-5 shadow-[0_10px_25px_rgba(0,0,0,0.3)] group hover:shadow-[0_15px_30px_rgba(112,51,246,0.15)] hover:-translate-y-1 relative overflow-hidden backdrop-blur-xl">
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{name}</span>
                <div className={cn(
                    "flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border",
                    isPositive ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                )}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
                </div>
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <div className="text-2xl font-black tracking-tight text-white mb-0.5">
                        <AnimatedNumber
                            value={value}
                            format={(v) => v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        />
                    </div>
                    <div className={cn(
                        "text-xs font-bold font-mono",
                        isPositive ? "text-emerald-400" : "text-rose-400"
                    )}>
                        {isPositive ? "+" : ""}{change.toFixed(2)}
                    </div>
                </div>

                {/* Simple SVG Sparkline */}
                <div className="w-20 h-10 opacity-60 group-hover:opacity-100 transition-opacity">
                    <svg viewBox="0 0 100 40" className="w-full h-full rotate-0">
                        <path
                            d={`M ${sparklineData.map((d, i) => `${(i / (sparklineData.length - 1)) * 100} ${40 - (d / Math.max(...sparklineData)) * 35}`).join(' L ')}`}
                            fill="none"
                            stroke={isPositive ? "#10B981" : "#F43F5E"}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}
