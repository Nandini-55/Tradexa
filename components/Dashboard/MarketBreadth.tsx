"use client";

import { AnimatedNumber } from "@/components/ui/animated-number";
import { cn } from "@/lib/utils";

interface MarketBreadthProps {
    advances: number;
    declines: number;
    unchanged: number;
}

export default function MarketBreadth({ advances, declines, unchanged }: MarketBreadthProps) {
    const total = advances + declines + unchanged;
    const advancePercent = (advances / total) * 100;
    const declinePercent = (declines / total) * 100;
    const unchangedPercent = (unchanged / total) * 100;

    return (
        <div className="bg-[#121319]/90 border border-white/[0.08] rounded-2xl p-5 shadow-[0_15px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7033F6]"></span>
                        Market Breadth
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground bg-white/[0.04] px-2.5 py-0.5 rounded-md border border-white/[0.06] uppercase tracking-wider">
                        NIFTY 500
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center group p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Advances</div>
                        <div className="text-2xl font-black tracking-tight text-emerald-400 font-mono">
                            <AnimatedNumber value={advances} />
                        </div>
                    </div>
                    <div className="text-center group p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Unchanged</div>
                        <div className="text-2xl font-black tracking-tight text-white/80 font-mono">
                            <AnimatedNumber value={unchanged} />
                        </div>
                    </div>
                    <div className="text-center group p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1">Declines</div>
                        <div className="text-2xl font-black tracking-tight text-rose-400 font-mono">
                            <AnimatedNumber value={declines} />
                        </div>
                    </div>
                </div>

                <div className="relative h-2.5 w-full bg-white/[0.04] rounded-full overflow-hidden flex shadow-inner">
                    <div
                        className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out"
                        style={{ width: `${advancePercent}%` }}
                    />
                    <div
                        className="h-full bg-white/20 transition-all duration-1000 ease-out"
                        style={{ width: `${unchangedPercent}%` }}
                    />
                    <div
                        className="h-full bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)] transition-all duration-1000 ease-out"
                        style={{ width: `${declinePercent}%` }}
                    />
                </div>
            </div>

            <div className="mt-5 flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span className="text-emerald-400 font-mono">{advancePercent.toFixed(1)}% Advancing</span>
                <span className="text-rose-400 font-mono">{declinePercent.toFixed(1)}% Declining</span>
            </div>
        </div>
    );
}
