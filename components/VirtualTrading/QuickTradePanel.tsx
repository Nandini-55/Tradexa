"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, Loader2, Sparkles } from "lucide-react";
import VirtualCoin from "@/components/VirtualCoin";
import { formatPrice, getCurrencyForSymbol, isIndianStock } from "@/lib/utils";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { executeTrade, getPortfolio } from "@/lib/actions/portfolio.actions";
import { toast } from "sonner";

interface QuickTradePanelProps {
    userId: string;
    onTradeComplete?: () => void;
}

const POPULAR_PICKS = [
    { symbol: 'AAPL', name: 'Apple' },
    { symbol: 'TSLA', name: 'Tesla' },
    { symbol: 'NVDA', name: 'NVIDIA' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'RELIANCE.NS', name: 'Reliance' },
    { symbol: 'TCS.NS', name: 'TCS' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
];

export default function QuickTradePanel({ userId, onTradeComplete }: QuickTradePanelProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<StockWithWatchlistStatus[]>([]);
    const [searching, setSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedStock, setSelectedStock] = useState<StockWithWatchlistStatus | null>(null);
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [quantity, setQuantity] = useState<string>("1");
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState<number>(0);
    const [loadingPrice, setLoadingPrice] = useState(false);
    const [ownedQuantity, setOwnedQuantity] = useState<number>(0);

    useEffect(() => {
        loadBalance();
        loadInitialStocks();
    }, []);

    const loadBalance = async () => {
        try {
            const portfolio = await getPortfolio(userId);
            setBalance(portfolio.balance);
            return portfolio;
        } catch (e) {
            console.error("Error loading balance:", e);
            return null;
        }
    };

    const loadInitialStocks = async () => {
        try {
            const results = await searchStocks("");
            setSearchResults(results.slice(0, 8));
        } catch (e) {
            console.error("Error loading initial stocks:", e);
        }
    };

    const handleSearch = async (overrideQuery?: string) => {
        const queryToSearch = overrideQuery !== undefined ? overrideQuery : searchQuery;
        setSearching(true);
        setHasSearched(true);
        try {
            const results = await searchStocks(queryToSearch);
            setSearchResults(results);
        } catch (error) {
            toast.error("Failed to search stocks");
        } finally {
            setSearching(false);
        }
    };

    const selectStock = async (stock: StockWithWatchlistStatus) => {
        setSelectedStock(stock);
        setSearchResults([]);
        setSearchQuery("");
        setHasSearched(false);

        // Load owned quantity for this stock
        try {
            const portfolio = await getPortfolio(userId);
            if (portfolio) {
                setBalance(portfolio.balance);
                const holding = portfolio.holdings?.find((h: any) => h.symbol === stock.symbol);
                setOwnedQuantity(holding ? holding.quantity : 0);
            }
        } catch (err) {
            console.error("Error checking holdings:", err);
        }

        // Fetch current live price
        setLoadingPrice(true);
        try {
            const response = await fetch(`/api/quote?symbol=${encodeURIComponent(stock.symbol)}`);

            if (response.ok) {
                const data = await response.json();
                if (data.c && data.c > 0) {
                    setCurrentPrice(data.c);
                    return;
                }
            }

            // Fallback: try to get from server action
            const { getStockQuote } = await import("@/lib/actions/finnhub.actions");
            const quote = await getStockQuote(stock.symbol);
            if (quote.c && quote.c > 0) {
                setCurrentPrice(quote.c);
            } else {
                setCurrentPrice(100);
            }
        } catch (error) {
            console.error("Error fetching price:", error);
            toast.error("Using fallback price estimate");
            setCurrentPrice(100);
        } finally {
            setLoadingPrice(false);
        }
    };

    const handleTrade = async (type: 'BUY' | 'SELL') => {
        if (!selectedStock) return;

        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            toast.error("Please enter a valid quantity");
            return;
        }

        if (currentPrice <= 0) {
            toast.error("Waiting for live price to load");
            return;
        }

        setLoading(true);
        try {
            const result = await executeTrade(userId, selectedStock.symbol, type, qty, currentPrice);

            if (result.success) {
                const currency = getCurrencyForSymbol(selectedStock.symbol);
                toast.success(
                    `Trade Executed: ${type === 'BUY' ? 'Bought' : 'Sold'} ${qty} share${qty > 1 ? 's' : ''} of ${selectedStock.symbol} at ${formatPrice(currentPrice, currency)}`
                );
                setQuantity("1");
                const portfolio = await loadBalance();
                if (portfolio) {
                    const holding = portfolio.holdings?.find((h: any) => h.symbol === selectedStock.symbol);
                    setOwnedQuantity(holding ? holding.quantity : 0);
                }
                onTradeComplete?.();
            } else {
                toast.error(result.error || "Trade failed");
            }
        } catch (error: any) {
            toast.error(error?.message || "An error occurred during trade");
        } finally {
            setLoading(false);
        }
    };

    const isIndian = selectedStock ? isIndianStock(selectedStock.symbol) : false;
    const INR_TO_USD = 1 / 83.5;
    const totalCost = (parseInt(quantity) || 0) * currentPrice;
    const totalCostUSD = isIndian ? totalCost * INR_TO_USD : totalCost;
    const currency = selectedStock ? getCurrencyForSymbol(selectedStock.symbol) : 'USD';

    return (
        <Card className="glass-card border border-white/[0.08] bg-[#121319]/90 text-foreground shadow-[0_15px_35px_rgba(0,0,0,0.35)] rounded-2xl">
            <CardHeader className="pb-3 border-b border-white/[0.08] bg-white/[0.02]">
                <CardTitle className="flex items-center gap-2.5 text-base font-bold text-white">
                    <div className="p-1.5 rounded-lg bg-[#7033F6]/15 text-[#8749FA]">
                        <TrendingUp className="h-4 w-4" />
                    </div>
                    Quick Trade
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {/* Permanent Search Bar & Popular Picks */}
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search ticker (e.g., AAPL, RELIANCE, TSLA)..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (e.target.value.trim().length >= 2) {
                                        handleSearch(e.target.value);
                                    } else if (!e.target.value.trim()) {
                                        if (!selectedStock) {
                                            loadInitialStocks();
                                        } else {
                                            setSearchResults([]);
                                        }
                                        setHasSearched(false);
                                    }
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-10 pr-8 h-11 bg-white/[0.03] border-white/[0.08] focus-visible:ring-[#7033F6]/50 focus-visible:border-[#7033F6]/50 text-white rounded-xl text-sm placeholder:text-muted-foreground/60"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        if (selectedStock) {
                                            setSearchResults([]);
                                        } else {
                                            loadInitialStocks();
                                        }
                                        setHasSearched(false);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/10"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <Button 
                            onClick={() => handleSearch()} 
                            disabled={searching} 
                            className="h-11 px-4 bg-gradient-to-r from-[#6231F5] to-[#8749FA] hover:from-[#5424E3] hover:to-[#7737EB] text-white font-bold text-xs rounded-xl shadow-[0_4px_15px_rgba(112,51,246,0.3)] cursor-pointer"
                        >
                            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                        </Button>
                    </div>

                    {/* Popular Stock Pills */}
                    <div className="space-y-1.5 pt-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                            <Sparkles className="h-3 w-3 text-[#A78BFA]" />
                            <span>Popular Picks:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {POPULAR_PICKS.map((pick) => {
                                const isCurrent = selectedStock?.symbol === pick.symbol;
                                return (
                                    <button
                                        key={pick.symbol}
                                        type="button"
                                        onClick={() => selectStock({
                                            symbol: pick.symbol,
                                            name: pick.name,
                                            exchange: pick.symbol.endsWith('.NS') ? 'NSE' : 'NASDAQ',
                                            type: 'Common Stock',
                                            isInWatchlist: false
                                        })}
                                        className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all cursor-pointer ${
                                            isCurrent 
                                                ? 'bg-[#7033F6]/25 border-[#7033F6] text-white shadow-[0_0_10px_rgba(112,51,246,0.25)]' 
                                                : 'border-white/[0.06] bg-white/[0.03] hover:bg-[#7033F6]/15 hover:border-[#7033F6]/40 text-muted-foreground hover:text-white'
                                        }`}
                                    >
                                        {pick.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Search Results Dropdown/List */}
                    {searchResults.length > 0 ? (
                        <div className="space-y-1.5 mt-2">
                            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                                <span>{hasSearched ? `Search Results (${searchResults.length})` : 'Suggested Stocks'}</span>
                                {selectedStock && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchResults([]);
                                            setSearchQuery("");
                                        }}
                                        className="text-[#A78BFA] hover:underline cursor-pointer lowercase font-normal"
                                    >
                                        dismiss
                                    </button>
                                )}
                            </div>
                            <div className="bg-white/[0.02] rounded-xl border border-white/[0.08] max-h-56 overflow-y-auto divide-y divide-white/[0.04]">
                                {searchResults.map((stock) => (
                                    <button
                                        key={stock.symbol}
                                        type="button"
                                        onClick={() => selectStock(stock)}
                                        className="w-full p-3 hover:bg-white/[0.04] transition-colors text-left flex items-center justify-between cursor-pointer group"
                                    >
                                        <div>
                                            <div className="font-bold text-white flex items-center gap-2 text-sm">
                                                <span>{stock.symbol}</span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-muted-foreground uppercase font-medium">
                                                    {stock.exchange || 'US'}
                                                </span>
                                                {selectedStock?.symbol === stock.symbol && (
                                                    <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-500/10 rounded">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground line-clamp-1">{stock.name}</div>
                                        </div>
                                        <div className="text-xs font-bold text-[#A78BFA] group-hover:text-white flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                                            Select &rarr;
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : hasSearched && !searching ? (
                        <div className="p-3 text-center text-xs text-muted-foreground bg-white/[0.02] rounded-xl border border-white/[0.06]">
                            No stocks found matching "{searchQuery}". Try picking from the popular list above.
                        </div>
                    ) : null}
                </div>

                {/* Selected Stock Trading Interface */}
                {selectedStock ? (
                    <div className="space-y-4 pt-3 border-t border-white/[0.08]">
                        <div className="flex items-center justify-between p-3.5 bg-[#7033F6]/10 rounded-xl border border-[#7033F6]/25">
                            <div>
                                <div className="font-bold text-lg text-white flex items-center gap-2">
                                    <span>{selectedStock.symbol}</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7033F6]/25 text-[#A78BFA] uppercase font-bold">
                                        {selectedStock.exchange || 'US'}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground font-medium">{selectedStock.name}</div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSelectedStock(null);
                                    setCurrentPrice(0);
                                    loadInitialStocks();
                                }}
                                className="text-xs h-8 border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-muted-foreground hover:text-white rounded-lg cursor-pointer"
                            >
                                Deselect
                            </Button>
                        </div>

                        {loadingPrice ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-[#8749FA]" />
                                <span className="text-xs text-muted-foreground">Fetching real-time market quote...</span>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-3 p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                                    <div>
                                        <span className="text-[11px] text-muted-foreground block mb-0.5 font-medium">Live Price</span>
                                        <span className="font-mono font-bold text-white text-lg">
                                            {formatPrice(currentPrice, currency)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[11px] text-muted-foreground block mb-0.5 font-medium">Buying Power</span>
                                        <span className="font-mono font-bold text-emerald-400 text-base flex items-center gap-1.5 justify-end">
                                            <VirtualCoin className="h-4 w-4" />
                                            {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quantity</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="h-12 bg-white/[0.03] border-white/[0.08] focus-visible:ring-[#7033F6]/50 text-white text-lg font-mono font-bold rounded-xl"
                                    />
                                </div>

                                <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.06] flex justify-between items-center">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estimated Total</span>
                                    <div className="text-right">
                                        <span className="text-white font-mono font-black text-lg block">
                                            {formatPrice(totalCost, currency)}
                                        </span>
                                        {isIndian && (
                                            <span className="text-xs text-muted-foreground font-mono flex items-center gap-1 justify-end">
                                                ≈ <VirtualCoin className="h-3 w-3" /> {totalCostUSD.toFixed(2)} Coins
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <Tabs defaultValue="buy" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06]">
                                        <TabsTrigger value="buy" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-bold rounded-lg cursor-pointer">
                                            Buy
                                        </TabsTrigger>
                                        <TabsTrigger value="sell" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white font-bold rounded-lg cursor-pointer">
                                            Sell {ownedQuantity > 0 ? `(${ownedQuantity})` : ''}
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="buy" className="mt-3 space-y-2">
                                        <Button
                                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 text-base rounded-xl cursor-pointer shadow-[0_4px_15px_rgba(16,185,129,0.3)] transition-all"
                                            onClick={() => handleTrade('BUY')}
                                            disabled={loading || totalCostUSD > balance || currentPrice === 0}
                                        >
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Buy ${quantity || 1} ${selectedStock.symbol}`}
                                        </Button>
                                        {totalCostUSD > balance && (
                                            <p className="text-xs text-rose-400 text-center mt-2 font-medium flex items-center justify-center gap-1">
                                                Insufficient coins (Need <VirtualCoin className="h-3 w-3 inline" /> {totalCostUSD.toFixed(2)}, Available <VirtualCoin className="h-3 w-3 inline" /> {balance.toFixed(2)})
                                            </p>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="sell" className="mt-3 space-y-2">
                                        <div className="flex items-center justify-between text-xs px-1 text-muted-foreground font-medium">
                                            <span>Shares Owned: <strong className="text-white">{ownedQuantity}</strong></span>
                                            {ownedQuantity > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(ownedQuantity.toString())}
                                                    className="text-[#A78BFA] hover:text-white hover:underline font-bold cursor-pointer"
                                                >
                                                    Sell Max ({ownedQuantity})
                                                </button>
                                            )}
                                        </div>
                                        <Button
                                            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold h-12 text-base rounded-xl cursor-pointer shadow-[0_4px_15px_rgba(244,63,94,0.3)] transition-all"
                                            onClick={() => handleTrade('SELL')}
                                            disabled={loading || currentPrice === 0 || ownedQuantity <= 0 || (parseInt(quantity) || 0) > ownedQuantity}
                                        >
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Sell ${quantity || 1} ${selectedStock.symbol}`}
                                        </Button>
                                        {ownedQuantity <= 0 ? (
                                            <p className="text-xs text-muted-foreground text-center mt-2">
                                                You do not currently own any shares of {selectedStock.symbol}.
                                            </p>
                                        ) : (parseInt(quantity) || 0) > ownedQuantity ? (
                                            <p className="text-xs text-rose-400 text-center mt-2 font-medium">
                                                You only own {ownedQuantity} share{ownedQuantity > 1 ? 's' : ''}.
                                            </p>
                                        ) : null}
                                    </TabsContent>
                                </Tabs>
                            </>
                        )}
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="p-5 text-center bg-white/[0.015] rounded-xl border border-white/[0.05] space-y-1">
                        <p className="text-xs font-semibold text-white">Select a stock to trade</p>
                        <p className="text-[11px] text-muted-foreground">
                            Use the search box or pick a ticker from the popular picks above to view real-time prices and execute virtual trades.
                        </p>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
