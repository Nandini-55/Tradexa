"use client";

import { useState, useEffect } from "react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface SectorData {
    name: string;
    performance: number;
    marketCap: string;
    volume: string;
}

const SECTOR_DATA: SectorData[] = [
    { name: "Technology", performance: 2.45, marketCap: "🪙 12.4T", volume: "4.2B" },
    { name: "Financial Services", performance: 1.12, marketCap: "🪙 8.2T", volume: "2.8B" },
    { name: "Healthcare", performance: 0.85, marketCap: "🪙 6.5T", volume: "1.5B" },
    { name: "Consumer Cyclical", performance: -0.42, marketCap: "🪙 5.8T", volume: "1.9B" },
    { name: "Communication Services", performance: 1.68, marketCap: "🪙 5.2T", volume: "2.1B" },
    { name: "Industrials", performance: -0.15, marketCap: "🪙 4.9T", volume: "1.2B" },
    { name: "Consumer Defensive", performance: 0.32, marketCap: "🪙 4.5T", volume: "0.9B" },
    { name: "Energy", performance: 3.21, marketCap: "🪙 3.8T", volume: "3.5B" },
    { name: "Real Estate", performance: -1.24, marketCap: "🪙 1.8T", volume: "0.6B" },
    { name: "Utilities", performance: -0.56, marketCap: "🪙 1.5T", volume: "0.4B" },
];

export default function SectorPerformance() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <div className="bg-[#121319]/90 border border-white/[0.08] rounded-2xl p-5 shadow-[0_15px_35px_rgba(0,0,0,0.35)] h-full flex flex-col backdrop-blur-xl">
            <div className="flex flex-row items-center justify-between pb-5 border-b border-white/[0.06] mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7033F6]"></span>
                    Sector Performance
                    <Info className="h-3.5 w-3.5 opacity-40 cursor-help hover:opacity-100 transition-opacity text-muted-foreground" />
                </h3>
                <div className="text-[10px] font-bold font-mono text-muted-foreground bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06] uppercase tracking-wider">
                    Change
                </div>
            </div>

            <div className="space-y-4 flex-grow overflow-y-auto pr-1 custom-scrollbar">
                {SECTOR_DATA.sort((a, b) => b.performance - a.performance).map((sector) => {
                    const isPositive = sector.performance >= 0;
                    const absPerf = Math.abs(sector.performance);
                    const width = (absPerf / 4) * 100; // Normalized max width around 4%

                    return (
                        <div key={sector.name} className="group relative">
                            <div className="flex items-center justify-between mb-1.5 text-xs font-semibold leading-none">
                                <span className="text-white/90 tracking-tight">{sector.name}</span>
                                <div className={cn(
                                    "flex items-center gap-0.5 font-mono font-bold text-xs",
                                    isPositive ? "text-emerald-400" : "text-rose-400"
                                    )}>
                                    {isPositive ? "+" : ""}
                                    <AnimatedNumber
                                        value={sector.performance}
                                        format={(v) => v.toFixed(2)}
                                    />
                                    %
                                </div>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden relative">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-1000 ease-out absolute top-0 rounded-full",
                                        isPositive
                                            ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                            : "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                                    )}
                                    style={{
                                        width: isMounted ? `${Math.min(width, 100)}%` : '0%',
                                        left: isPositive ? '0' : 'auto',
                                        right: isPositive ? 'auto' : '0'
                                    }}
                                />
                            </div>

                            {/* Custom Tooltip on Hover */}
                            <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 bg-[#171822] border border-white/[0.1] px-3.5 py-2.5 rounded-xl shadow-2xl z-20 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 min-w-[160px] backdrop-blur-xl">
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{sector.name}</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                    <div className="text-[10px] font-medium text-muted-foreground uppercase">Market Cap</div>
                                    <div className="text-xs font-bold font-mono text-white text-right">{sector.marketCap}</div>
                                    <div className="text-[10px] font-medium text-muted-foreground uppercase">Volume</div>
                                    <div className="text-xs font-bold font-mono text-white text-right">{sector.volume}</div>
                                </div>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#171822] border-b border-r border-white/[0.1] rotate-45" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
