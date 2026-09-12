"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import VirtualCoin from "@/components/VirtualCoin";
import { formatPrice, getCurrencyForSymbol } from "@/lib/utils";
import { executeTrade, getPortfolio } from "@/lib/actions/portfolio.actions";
import { toast } from "sonner";

interface TradeDialogProps {
    symbol: string;
    currentPrice: number;
    userId: string;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onTradeComplete?: () => void;
    hideTrigger?: boolean;
}

export default function TradeDialog({
    symbol,
    currentPrice,
    userId,
    isOpen,
    onOpenChange,
    onTradeComplete,
    hideTrigger = false
}: TradeDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [quantity, setQuantity] = useState<string>("1");
    const [loading, setLoading] = useState(false);
    const [portfolio, setPortfolio] = useState<IPortfolio | null>(null);
    const [livePrice, setLivePrice] = useState<number>(currentPrice);
    const [priceLoading, setPriceLoading] = useState(false);

    const isControlled = isOpen !== undefined;
    const dialogOpen = isControlled ? isOpen : internalOpen;

    const handleOpenChange = (val: boolean) => {
        setInternalOpen(val);
        onOpenChange?.(val);
    };

    useEffect(() => {
        if (dialogOpen) {
            loadPortfolio();
            refreshPrice();

            // Refresh price every 2 seconds while dialog is open
            const interval = setInterval(refreshPrice, 2000);
            return () => clearInterval(interval);
        }
    }, [dialogOpen, symbol]);

    const loadPortfolio = async () => {
        try {
            const p = await getPortfolio(userId);
            setPortfolio(p);
        } catch (err) {
            console.error("Error loading portfolio:", err);
        }
    };

    const refreshPrice = async () => {
        setPriceLoading(true);
        try {
            const response = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
            const data = await response.json();
            if (data.c && data.c > 0) {
                setLivePrice(data.c);
            }
        } catch (error) {
            console.error("Failed to refresh price:", error);
        } finally {
            setPriceLoading(false);
        }
    };

    const getHolding = () => {
        return portfolio?.holdings?.find(h => h.symbol === symbol)?.quantity || 0;
    };

    const handleTrade = async (type: 'BUY' | 'SELL') => {
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            toast.error("Please enter a valid quantity");
            return;
        }

        setLoading(true);
        try {
            // Always use the latest live price
            const result = await executeTrade(userId, symbol, type, qty, livePrice);

            if (result.success) {
                const currency = getCurrencyForSymbol(symbol);
                toast.success(`Successfully ${type === 'BUY' ? 'bought' : 'sold'} ${qty} share${qty > 1 ? 's' : ''} of ${symbol} at ${formatPrice(livePrice, currency)}`);
                handleOpenChange(false);
                onTradeComplete?.();
            } else {
                toast.error(result.error || "Trade failed");
            }
        } catch (error: any) {
            toast.error(error?.message || "An error occurred executing the trade");
        } finally {
            setLoading(false);
        }
    };

    const { isIndianStock } = require("@/lib/utils");
    const isIndian = isIndianStock(symbol);
    const INR_TO_USD = 1 / 83.5;
    const totalCost = (parseInt(quantity) || 0) * livePrice;
    const totalCostUSD = isIndian ? totalCost * INR_TO_USD : totalCost;
    const holdingQty = getHolding();

    return (
        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
            {!hideTrigger && !isControlled && (
                <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-[#6231F5] via-[#753DF7] to-[#8749FA] hover:from-[#5424E3] hover:to-[#7737EB] text-white font-bold py-6 text-base rounded-2xl shadow-[0_10px_25px_-5px_rgba(110,45,245,0.5)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
                        <TrendingUp className="mr-2 h-5 w-5" />
                        Trade {symbol}
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-md bg-[#121319] border border-white/[0.08] text-foreground rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-black text-white">
                        Trade <span className="text-[#A78BFA]">{symbol}</span>
                        <span className="text-xs font-semibold text-white ml-auto bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.08] flex items-center gap-2">
                            {formatPrice(livePrice, getCurrencyForSymbol(symbol))}
                            {priceLoading && <span className="inline-block h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></span>}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="buy" className="w-full mt-2">
                    <TabsList className="grid w-full grid-cols-2 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06]">
                        <TabsTrigger value="buy" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-bold rounded-lg cursor-pointer">
                            Buy
                        </TabsTrigger>
                        <TabsTrigger value="sell" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white font-bold rounded-lg cursor-pointer">
                            Sell {holdingQty > 0 ? `(${holdingQty})` : ''}
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-5 space-y-4">
                        {/* Balance Info */}
                        <div className="flex justify-between items-center text-xs px-1">
                            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                                <Wallet className="h-3.5 w-3.5 text-[#A78BFA]" /> Buying Power
                            </span>
                            <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                                <VirtualCoin className="h-3.5 w-3.5" />
                                {portfolio?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs px-1">
                            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                                <TrendingUp className="h-3.5 w-3.5 text-[#A78BFA]" /> Your Position
                            </span>
                            <span className="font-mono font-bold text-white">{holdingQty} shares</span>
                        </div>

                        {/* Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quantity</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="bg-white/[0.03] border-white/[0.08] focus-visible:ring-[#7033F6]/50 text-white text-lg h-12 pl-4 pr-12 font-mono font-bold rounded-xl"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold pointer-events-none uppercase tracking-wider">
                                    qty
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-white/[0.03] rounded-xl p-4 space-y-2 border border-white/[0.06]">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground font-medium uppercase tracking-wider">Estimated Total</span>
                                <div className="text-right">
                                    <span className="text-white font-black font-mono text-lg block">
                                        {formatPrice(totalCost, getCurrencyForSymbol(symbol))}
                                    </span>
                                    {isIndian && (
                                        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1 justify-end">
                                            ≈ <VirtualCoin className="h-3 w-3" /> {totalCostUSD.toFixed(2)} Coins
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <TabsContent value="buy" className="space-y-2">
                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 text-base font-bold rounded-xl shadow-[0_4px_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                                onClick={() => handleTrade('BUY')}
                                disabled={loading || totalCostUSD > (portfolio?.balance || 0) || livePrice === 0}
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Buy ${quantity || 1} ${symbol}`}
                            </Button>
                            {totalCostUSD > (portfolio?.balance || 0) && (
                                <p className="text-xs text-rose-400 text-center mt-2 font-medium flex items-center justify-center gap-1">
                                    Insufficient coins (Need <VirtualCoin className="h-3 w-3 inline" /> {totalCostUSD.toFixed(2)}, Available: <VirtualCoin className="h-3 w-3 inline" /> {(portfolio?.balance || 0).toFixed(2)})
                                </p>
                            )}
                        </TabsContent>

                        <TabsContent value="sell" className="space-y-2">
                            {holdingQty > 0 && (
                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(holdingQty.toString())}
                                        className="text-xs text-[#A78BFA] hover:text-white hover:underline font-bold cursor-pointer"
                                    >
                                        Sell Max ({holdingQty})
                                    </button>
                                </div>
                            )}
                            <Button
                                className="w-full bg-rose-600 hover:bg-rose-500 text-white py-6 text-base font-bold rounded-xl shadow-[0_4px_15px_rgba(244,63,94,0.3)] transition-all cursor-pointer"
                                onClick={() => handleTrade('SELL')}
                                disabled={loading || (parseInt(quantity) || 0) > holdingQty || holdingQty <= 0 || livePrice === 0}
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Sell ${quantity || 1} ${symbol}`}
                            </Button>
                            {holdingQty <= 0 ? (
                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    You do not currently own any shares of {symbol}
                                </p>
                            ) : (parseInt(quantity) || 0) > holdingQty ? (
                                <p className="text-xs text-rose-400 text-center mt-2 font-medium">
                                    You only own {holdingQty} share{holdingQty > 1 ? 's' : ''}
                                </p>
                            ) : null}
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
