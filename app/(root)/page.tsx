import MarketStatus from "@/components/Dashboard/MarketStatus";
import IndexCard from "@/components/Dashboard/IndexCard";
import SectorPerformance from "@/components/SectorPerformance";
import StockListCard from "@/components/Dashboard/StockListCard";
import MarketBreadth from "@/components/Dashboard/MarketBreadth";
import Watchlist from "@/components/Dashboard/Watchlist";
import MarketQuotesPanel from "@/components/Dashboard/MarketQuotesPanel";
import LatestNewsPanel from "@/components/Dashboard/LatestNewsPanel";
import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getUserWatchlist } from "@/lib/actions/watchlist.actions";

const GAINERS_MOCK = [
    { symbol: "TATAELXSI", name: "Tata Elxsi Ltd", price: 7850.40, changePercent: 5.42 },
    { symbol: "INFY", name: "Infosys Ltd", price: 1680.15, changePercent: 3.12 },
    { symbol: "TCS", name: "Tata Consultancy", price: 3950.00, changePercent: 2.85 },
    { symbol: "WIPRO", name: "Wipro Ltd", price: 485.60, changePercent: 2.15 },
    { symbol: "HCLTECH", name: "HCL Technologies", price: 1420.30, changePercent: 1.68 },
];

const LOSERS_MOCK = [
    { symbol: "ADANIENT", name: "Adani Enterprises", price: 2850.40, changePercent: -4.42 },
    { symbol: "ONGC", name: "Oil & Natural Gas", price: 240.15, changePercent: -3.12 },
    { symbol: "COALINDIA", name: "Coal India Ltd", price: 420.00, changePercent: -2.85 },
    { symbol: "SBIN", name: "State Bank of India", price: 745.60, changePercent: -2.15 },
    { symbol: "BPCL", name: "Bharat Petroleum", price: 580.30, changePercent: -1.68 },
];

const Home = async () => {
    let user = null;
    try {
        const auth = await getAuth();
        const session = await auth.api.getSession({ headers: await headers() });
        user = session?.user;
    } catch (err) {
        console.warn("Auth check on home page:", err);
    }

    const initialWatchlist = await getUserWatchlist(user?.id);

    return (
        <div className="home-wrapper max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-8" suppressHydrationWarning>
            {/* Top Section: Status & Indices */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        <span className="w-2.5 h-8 bg-gradient-to-b from-[#8749FA] to-[#6231F5] rounded-full shadow-[0_0_15px_rgba(112,51,246,0.5)]"></span>
                        Market Overview
                    </h1>
                    <MarketStatus />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <IndexCard name="NIFTY 50" value={22040.70} change={125.40} changePercent={0.57} />
                    <IndexCard name="SENSEX" value={72623.18} change={412.30} changePercent={0.57} />
                    <IndexCard name="BANKNIFTY" value={46580.40} change={-210.15} changePercent={-0.45} />
                    <IndexCard name="INDIA VIX" value={15.42} change={0.85} changePercent={5.84} />
                </div>
            </div>

            {/* Middle Section: 3-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SectorPerformance />
                <StockListCard title="Top Gainers" stocks={GAINERS_MOCK} type="gainers" />
                <StockListCard title="Top Losers" stocks={LOSERS_MOCK} type="losers" />
            </div>

            {/* Bottom Section: Watchlist & Breadth + Sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left Side: Watchlist & Breadth */}
                <div className="xl:col-span-9 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Watchlist initialItems={initialWatchlist} userId={user?.id} />
                        <MarketBreadth advances={342} declines={148} unchanged={10} />
                    </div>
                </div>

                {/* Right Sidebar: Quotes & News */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="bg-[#121319]/90 border border-white/[0.08] rounded-2xl p-5 shadow-[0_15px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#7033F6]"></span>
                                Market Quotes
                            </h3>
                        </div>
                        <MarketQuotesPanel />
                    </div>

                    <div className="bg-[#121319]/90 border border-white/[0.08] rounded-2xl p-5 shadow-[0_15px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#7033F6]"></span>
                                Latest Market News
                            </h3>
                        </div>
                        <LatestNewsPanel />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;

