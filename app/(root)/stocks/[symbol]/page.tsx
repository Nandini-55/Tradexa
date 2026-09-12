import { TVAdvancedChart, TVTechnicalAnalysis, TVCompanyProfile, TVFundamentals, TVSymbolInfo } from "@/components/TVWidgets";
import WatchlistButton from "@/components/WatchlistButton";

import { formatTradingViewSymbol } from "@/lib/utils";
import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getStockQuote } from "@/lib/actions/finnhub.actions";
import { checkWatchlistStatus } from "@/lib/actions/watchlist.actions";
import LivePrice from "@/components/VirtualTrading/LivePrice";
import TradeDialog from "@/components/VirtualTrading/TradeDialog";
import AIRecommendation from "@/components/AIRecommendation";

export default async function StockDetails({ params }: StockDetailsPageProps) {
  const { symbol } = await params;
  const formattedSymbol = formatTradingViewSymbol(symbol?.toUpperCase() || "");

  let user = null;
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    user = session?.user;
  } catch (err) {
    console.warn("Auth error in StockDetails:", err);
  }

  // Fetch real-time price for trading
  const quote = await getStockQuote(symbol);
  const currentPrice = quote.c || 0;
  const isInWatchlist = user ? await checkWatchlistStatus(user.id, symbol.toUpperCase()) : false;

  return (
    <div className="flex min-h-screen p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Left column: Charts */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#121319]/90 shadow-[0_15px_35px_rgba(0,0,0,0.35)]">
            <TVSymbolInfo symbol={formattedSymbol} height={170} />
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#121319]/90 shadow-[0_15px_35px_rgba(0,0,0,0.35)]">
            <TVAdvancedChart symbol={formattedSymbol} height={600} style={1} />
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#121319]/90 shadow-[0_15px_35px_rgba(0,0,0,0.35)]">
            <TVAdvancedChart symbol={formattedSymbol} height={500} style={10} />
          </div>
        </div>

        {/* Right column: Actions & Analysis */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#121319]/90 p-6 rounded-2xl border border-white/[0.08] shadow-[0_15px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <LivePrice symbol={symbol.toUpperCase()} initialPrice={currentPrice} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <WatchlistButton 
              symbol={symbol.toUpperCase()} 
              company={symbol.toUpperCase()} 
              isInWatchlist={isInWatchlist}
              userId={user?.id}
            />
            {user && (
              <div className="flex-1">
                <TradeDialog symbol={symbol.toUpperCase()} currentPrice={currentPrice} userId={user.id} />
              </div>
            )}
          </div>

          <AIRecommendation symbol={symbol.toUpperCase()} />

          <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#121319]/90 shadow-[0_15px_35px_rgba(0,0,0,0.35)]">
            <TVTechnicalAnalysis symbol={formattedSymbol} height={400} />
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#121319]/90 shadow-[0_15px_35px_rgba(0,0,0,0.35)]">
            <TVCompanyProfile symbol={formattedSymbol} height={440} />
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#121319]/90 shadow-[0_15px_35px_rgba(0,0,0,0.35)]">
            <TVFundamentals symbol={formattedSymbol} height={464} />
          </div>
        </div>
      </section>
    </div>
  );
}


