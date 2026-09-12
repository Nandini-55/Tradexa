"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Loader2, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { getStockRecommendation } from "@/lib/actions/ai.actions";
import { cn } from "@/lib/utils";

interface AIRecommendationProps {
    symbol: string;
}

export default function AIRecommendation({ symbol }: AIRecommendationProps) {
    const [loading, setLoading] = useState(true);
    const [recommendation, setRecommendation] = useState<{
        verdict: 'Buy' | 'Sell' | 'Hold';
        reason: string;
        newsReferences: string[];
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecommendation = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await getStockRecommendation(symbol);
                if (result.success && result.data) {
                    setRecommendation(result.data);
                } else {
                    setError("DeepQuant Neural Engine is synchronizing market telemetry. Retrying...");
                }
            } catch (err) {
                setError("DeepQuant Neural Engine is synchronizing market telemetry. Retrying...");
            } finally {
                setLoading(false);
            }
        };

        if (symbol) {
            fetchRecommendation();
        }
    }, [symbol]);

    if (loading) {
        return (
            <Card className="glass-card border border-white/[0.08] bg-[#121319]/90 text-foreground overflow-hidden rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.35)]">
                <CardContent className="flex flex-col items-center justify-center py-10 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-[#8749FA]" />
                    <p className="text-xs text-muted-foreground animate-pulse font-medium text-center max-w-xs">
                        Tradexa DeepQuant v4.5 is synthesizing live financial news, FinTwit/X expert sentiment, and candlestick patterns for {symbol}...
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="glass-card border border-white/[0.08] bg-[#121319]/90 text-foreground rounded-2xl">
                <CardContent className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                    <Info className="h-7 w-7 text-[#8749FA]" />
                    <p className="text-xs text-muted-foreground">{error}</p>
                </CardContent>
            </Card>
        );
    }

    if (!recommendation) return null;

    const { verdict, reason, newsReferences } = recommendation;

    const getVerdictStyle = () => {
        switch (verdict.toLowerCase()) {
            case 'buy':
                return {
                    color: "text-emerald-400",
                    bgColor: "bg-emerald-500/10",
                    borderColor: "border-emerald-500/25",
                    icon: <TrendingUp className="h-5 w-5 text-emerald-400" />
                };
            case 'sell':
                return {
                    color: "text-rose-400",
                    bgColor: "bg-rose-500/10",
                    borderColor: "border-rose-500/25",
                    icon: <TrendingDown className="h-5 w-5 text-rose-400" />
                };
            default:
                return {
                    color: "text-amber-400",
                    bgColor: "bg-amber-500/10",
                    borderColor: "border-amber-500/25",
                    icon: <Minus className="h-5 w-5 text-amber-400" />
                };
        }
    };

    const style = getVerdictStyle();

    return (
        <Card className="glass-card border border-white/[0.08] bg-[#121319]/90 text-foreground overflow-hidden rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <CardHeader className="pb-3 border-b border-white/[0.06] bg-white/[0.02]">
                <CardTitle className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#7033F6]/15 text-[#8749FA]">
                            <Brain className="h-4 w-4" />
                        </div>
                        <span>DeepQuant AI Analysis</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7033F6]/20 text-[#A78BFA] font-mono lowercase border border-[#7033F6]/30">
                        v4.5 quant-engine
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className={cn(
                    "flex items-center gap-3.5 p-3.5 rounded-xl border",
                    style.bgColor,
                    style.borderColor
                )}>
                    <div className="p-2.5 rounded-xl bg-[#121319] border border-white/[0.08]">
                        {style.icon}
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 text-muted-foreground">Neural Conviction Signal</div>
                        <div className={cn("text-2xl font-black tracking-tight uppercase", style.color)}>
                            {verdict}
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Synthesized Alpha Thesis</h4>
                    <p className="text-xs leading-relaxed text-white/90 font-medium">
                        {reason}
                    </p>
                </div>

                {newsReferences && newsReferences.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-white/[0.06]">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Synthesized Catalysts & Market Radar</h4>
                        <ul className="space-y-1.5">
                            {newsReferences.map((ref, idx) => (
                                <li key={idx} className="flex gap-2 text-[11px] leading-tight text-muted-foreground">
                                    <span className="text-[#A78BFA] mt-0.5">•</span>
                                    {ref}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
