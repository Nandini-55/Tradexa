"use client";

import React, { useMemo, useState } from "react";
import { addToWatchlist, removeFromWatchlist } from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const WatchlistButton = ({
  symbol,
  company,
  isInWatchlist,
  showTrashIcon = false,
  type = "button",
  userId,
  onWatchlistChange,
}: WatchlistButtonProps) => {
  const [added, setAdded] = useState<boolean>(!!isInWatchlist);
  const [loading, setLoading] = useState<boolean>(false);

  const label = useMemo(() => {
    if (type === "icon") return "";
    return added ? "Remove from Watchlist" : "Add to Watchlist";
  }, [added, type]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    const next = !added;
    setAdded(next);
    onWatchlistChange?.(symbol, next);

    if (userId) {
      setLoading(true);
      try {
        if (next) {
          const res = await addToWatchlist(userId, symbol, company);
          if (res.success) {
            toast.success(`Added ${symbol} to your watchlist.`);
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent('watchlist-updated', { detail: { symbol, added: true } }));
            }
          } else {
            setAdded(!next);
            toast.error(res.error || "Failed to add to watchlist");
          }
        } else {
          const res = await removeFromWatchlist(userId, symbol);
          if (res.success) {
            toast.success(`Removed ${symbol} from your watchlist.`);
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent('watchlist-updated', { detail: { symbol, added: false } }));
            }
          } else {
            setAdded(!next);
            toast.error(res.error || "Failed to remove from watchlist");
          }
        }
      } catch (err) {
        setAdded(!next);
        toast.error("Error updating watchlist");
      } finally {
        setLoading(false);
      }
    } else {
      toast.info(next ? `Added ${symbol} to watchlist.` : `Removed ${symbol} from watchlist.`);
    }
  };

  if (type === "icon") {
    return (
      <button
        title={added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
        aria-label={added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
        disabled={loading}
        className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
          added 
            ? "bg-[#7033F6]/20 border-[#7033F6]/50 text-[#A78BFA] shadow-[0_0_15px_rgba(112,51,246,0.3)]" 
            : "bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:text-white hover:bg-white/[0.08]"
        }`}
        onClick={handleClick}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-current" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={added ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
            />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button 
      disabled={loading}
      className={`h-12 px-5 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
        added 
          ? "border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 shadow-[0_4px_15px_rgba(244,63,94,0.2)]" 
          : "border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-[#7033F6]/50 text-white shadow-sm"
      }`} 
      onClick={handleClick}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current" />
      ) : showTrashIcon && added ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 4v6m4-6v6m4-6v6" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={added ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          className={`w-4 h-4 ${added ? "text-rose-400" : "text-[#A78BFA]"}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
          />
        </svg>
      )}
      <span>{label}</span>
    </button>
  );
};

export default WatchlistButton;
