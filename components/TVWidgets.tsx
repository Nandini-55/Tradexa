'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import React from 'react';
import { cn } from '@/lib/utils';

// Dynamic imports with SSR disabled since these widgets need the DOM
const MarketData = dynamic(
    () => import('react-ts-tradingview-widgets').then(m => m.MarketData),
    { ssr: false, loading: () => <WidgetLoader height={400} /> }
);

const Timeline = dynamic(
    () => import('react-ts-tradingview-widgets').then(m => m.Timeline),
    { ssr: false, loading: () => <WidgetLoader height={350} /> }
);

const AdvancedRealTimeChart = dynamic(
    () => import('react-ts-tradingview-widgets').then(m => m.AdvancedRealTimeChart),
    { ssr: false, loading: () => <WidgetLoader height={600} /> }
);

const TechnicalAnalysis = dynamic(
    () => import('react-ts-tradingview-widgets').then(m => m.TechnicalAnalysis),
    { ssr: false, loading: () => <WidgetLoader height={400} /> }
);

const CompanyProfile = dynamic(
    () => import('react-ts-tradingview-widgets').then(m => m.CompanyProfile),
    { ssr: false, loading: () => <WidgetLoader height={440} /> }
);

const FundamentalData = dynamic(
    () => import('react-ts-tradingview-widgets').then(m => m.FundamentalData),
    { ssr: false, loading: () => <WidgetLoader height={464} /> }
);

const SymbolInfo = dynamic(
    () => import('react-ts-tradingview-widgets').then(m => m.SymbolInfo),
    { ssr: false, loading: () => <WidgetLoader height={170} /> }
);

function WidgetLoader({ height }: { height: number }) {
    return (
        <div
            className="w-full rounded-2xl bg-[#121319] border border-white/[0.08] animate-pulse flex items-center justify-center text-muted-foreground/50 text-xs font-mono"
            style={{ height }}
        >
            Loading market telemetry...
        </div>
    );
}

// Hook that guarantees dark theme is used and avoids initial hydration mismatch
function useSafeColorTheme() {
    const { resolvedTheme, theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Explicitly check for light; default to dark for Tradexa obsidian fintech
    const isLight = mounted && (resolvedTheme === 'light' || theme === 'light');
    const colorTheme: 'light' | 'dark' = isLight ? 'light' : 'dark';

    return { mounted, colorTheme };
}

// ----- Exported convenience wrappers -----

export function TVMarketQuotes({ height = 400 }: { height?: number }) {
    const { mounted, colorTheme } = useSafeColorTheme();
    if (!mounted) return <WidgetLoader height={height} />;

    return (
        <div className="w-full bg-[#121319] rounded-2xl overflow-hidden">
            <MarketData
                key={`market-quotes-${colorTheme}`}
                colorTheme={colorTheme}
                height={height}
                width="100%"
                locale="en"
                showSymbolLogo
                symbolsGroups={[
                    {
                        name: 'India (NSE)',
                        originalName: 'India (NSE)',
                        symbols: [
                            { name: 'BSE:RELIANCE', displayName: 'Reliance' },
                            { name: 'BSE:TCS', displayName: 'TCS' },
                            { name: 'BSE:HDFCBANK', displayName: 'HDFC Bank' },
                            { name: 'BSE:INFY', displayName: 'Infosys' },
                            { name: 'BSE:ICICIBANK', displayName: 'ICICI Bank' },
                        ],
                    },
                    {
                        name: 'US Tech',
                        originalName: 'US Tech',
                        symbols: [
                            { name: 'NASDAQ:AAPL', displayName: 'Apple' },
                            { name: 'NASDAQ:GOOGL', displayName: 'Alphabet' },
                            { name: 'NASDAQ:MSFT', displayName: 'Microsoft' },
                            { name: 'NASDAQ:AMZN', displayName: 'Amazon' },
                            { name: 'NASDAQ:TSLA', displayName: 'Tesla' },
                        ],
                    },
                ]}
            />
        </div>
    );
}

export function TVLatestNews({ height = 350 }: { height?: number }) {
    const { mounted, colorTheme } = useSafeColorTheme();
    if (!mounted) return <WidgetLoader height={height} />;

    return (
        <div className="w-full bg-[#121319] rounded-2xl overflow-hidden">
            <Timeline
                key={`timeline-${colorTheme}`}
                colorTheme={colorTheme}
                height={height}
                width="100%"
                feedMode="market"
                market="stock"
                locale="en"
                displayMode="regular"
            />
        </div>
    );
}

export function TVAdvancedChart({ symbol, height = 600, style = 1 }: { symbol: string; height?: number; style?: number }) {
    const { mounted, colorTheme } = useSafeColorTheme();
    if (!mounted) return <WidgetLoader height={height} />;

    return (
        <div className="w-full bg-[#121319] rounded-2xl overflow-hidden">
            <AdvancedRealTimeChart
                key={`chart-${symbol}-${colorTheme}-${style}`}
                symbol={symbol}
                theme={colorTheme}
                height={height}
                width="100%"
                interval="D"
                allow_symbol_change={false}
                hide_side_toolbar
                hide_legend={false}
                save_image={false}
                style={style.toString() as any}
            />
        </div>
    );
}

export function TVTechnicalAnalysis({ symbol, height = 400 }: { symbol: string; height?: number }) {
    const { mounted, colorTheme } = useSafeColorTheme();
    if (!mounted) return <WidgetLoader height={height} />;

    return (
        <div className="w-full bg-[#121319] rounded-2xl overflow-hidden">
            <TechnicalAnalysis
                key={`ta-${symbol}-${colorTheme}`}
                symbol={symbol}
                colorTheme={colorTheme}
                height={height}
                width="100%"
                locale="en"
                interval="1h"
            />
        </div>
    );
}

export function TVCompanyProfile({ symbol, height = 440 }: { symbol: string; height?: number }) {
    const { mounted, colorTheme } = useSafeColorTheme();
    if (!mounted) return <WidgetLoader height={height} />;

    return (
        <div className="w-full bg-[#121319] rounded-2xl overflow-hidden">
            <CompanyProfile
                key={`profile-${symbol}-${colorTheme}`}
                symbol={symbol}
                colorTheme={colorTheme}
                height={height}
                width="100%"
                locale="en"
                isTransparent={false}
            />
        </div>
    );
}

export function TVFundamentals({ symbol, height = 464 }: { symbol: string; height?: number }) {
    const { mounted, colorTheme } = useSafeColorTheme();
    if (!mounted) return <WidgetLoader height={height} />;

    return (
        <div className="w-full bg-[#121319] rounded-2xl overflow-hidden">
            <FundamentalData
                key={`fundamentals-${symbol}-${colorTheme}`}
                symbol={symbol}
                colorTheme={colorTheme}
                height={height}
                width="100%"
                locale="en"
                displayMode="regular"
                isTransparent={false}
            />
        </div>
    );
}

export function TVSymbolInfo({ symbol, height = 170 }: { symbol: string; height?: number }) {
    const { mounted, colorTheme } = useSafeColorTheme();
    if (!mounted) return <WidgetLoader height={height} />;

    return (
        <div className="w-full bg-[#121319] rounded-2xl overflow-hidden">
            <SymbolInfo
                key={`syminfo-${symbol}-${colorTheme}`}
                symbol={symbol}
                colorTheme={colorTheme}
                width="100%"
                locale="en"
                isTransparent={false}
            />
        </div>
    );
}
