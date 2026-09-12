"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { Loader2, Search, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchCommandProps {
  renderAs?: 'button' | 'text';
  label?: string;
  initialStocks: StockWithWatchlistStatus[];
}

export default function SearchCommand({ renderAs = 'button', label = 'Add stock', initialStocks }: SearchCommandProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);

  const isSearchMode = !!searchTerm.trim();
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(v => !v)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const handleSearch = async () => {
    if (!isSearchMode) return setStocks(initialStocks);

    setLoading(true)
    try {
      const results = await searchStocks(searchTerm.trim());
      setStocks(results);
    } catch {
      setStocks([])
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm]);

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm("");
    setStocks(initialStocks);
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSearchTerm("");
      setStocks(initialStocks);
    }
  }

  return (
    <>
      {renderAs === 'text' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#171822] hover:bg-[#1E1F2C] border border-white/[0.08] hover:border-[#7033F6]/40 text-xs text-muted-foreground hover:text-white transition-all cursor-pointer shadow-xs"
        >
          <Search className="h-3.5 w-3.5 text-[#7033F6]" />
          <span>{label}</span>
          <kbd className="hidden sm:inline-flex text-[10px] bg-white/[0.06] text-muted-foreground px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </button>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          className="bg-gradient-to-r from-[#6231F5] to-[#753DF7] hover:from-[#5424E3] hover:to-[#6830E5] text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-900/30 cursor-pointer"
        >
          <Search className="h-4 w-4" />
          {label}
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[550px] p-0 gap-0 border border-white/[0.08] bg-[#121319] text-foreground overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.8)] rounded-3xl">
          <DialogTitle className="sr-only">Search Stocks</DialogTitle>

          {/* Header / Input Area */}
          <div className="flex items-center border-b border-white/[0.06] p-4 sticky top-0 bg-[#121319] z-10 shrink-0">
            <Search className="h-5 w-5 text-[#7033F6] mr-3" />
            <input
              className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-muted-foreground/60 text-foreground h-9 font-medium"
              placeholder="Search stocks by name or ticker (e.g. AAPL, RELIANCE)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#7033F6] ml-3" />
            ) : searchTerm ? (
              <button onClick={() => setSearchTerm('')} className="ml-3 cursor-pointer">
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            ) : null}
          </div>

          {/* Results List */}
          <div className="max-h-[420px] overflow-y-auto custom-scrollbar p-2">
            {isSearchMode && stocks.length === 0 && !loading ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No results found for "{searchTerm}"
              </div>
            ) : (
              <ul className="space-y-1">
                {!isSearchMode && (
                  <div className="px-3 py-2 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider">
                    Popular Stocks
                  </div>
                )}

                {displayStocks?.map((stock) => (
                  <li key={stock.symbol}>
                    <Link
                      href={`/stocks/${stock.symbol}`}
                      onClick={handleSelectStock}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#1E1F2C] hover:border hover:border-[#7033F6]/30 transition-all group cursor-pointer"
                    >
                      <div className="h-9 w-9 rounded-xl bg-[#7033F6]/15 flex items-center justify-center group-hover:bg-[#7033F6]/25 transition-colors shrink-0">
                        <TrendingUp className="h-4 w-4 text-[#A78BFA]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground truncate">{stock.symbol}</span>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08]">
                            {stock.exchange}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {stock.name}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {!isSearchMode && stocks.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm">
                Start typing to search...
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border bg-muted/30 text-[10px] text-muted-foreground flex justify-end px-4">
            <span>Press <kbd className="font-mono bg-muted px-1 rounded text-muted-foreground">ESC</kbd> to close</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
