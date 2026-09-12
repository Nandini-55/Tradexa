import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
        return NextResponse.json({ error: "Symbol required", c: 0, dp: 0 }, { status: 400 });
    }

    try {
        // Check if it's an Indian stock (NSE/BSE)
        const isIndianStock = symbol.endsWith('.NS') || symbol.endsWith('.BO');

        if (isIndianStock) {
            // Use Yahoo Finance for Indian stocks
            const yahooUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`;

            const response = await fetch(yahooUrl, {
                cache: 'no-store',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!response.ok) {
                console.error(`Yahoo Finance API error: ${response.status}`);
                return NextResponse.json({ c: 0, dp: 0, error: "Yahoo API error" }, { status: response.status });
            }

            const data = await response.json();
            const quote = data?.chart?.result?.[0]?.meta;

            if (!quote || !quote.regularMarketPrice) {
                console.error("No price data from Yahoo Finance");
                return NextResponse.json({ c: 0, dp: 0, error: "No price data" }, { status: 404 });
            }

            // Convert Yahoo Finance format to Finnhub-like format
            return NextResponse.json({
                c: quote.regularMarketPrice || 0,
                h: quote.regularMarketDayHigh || quote.regularMarketPrice || 0,
                l: quote.regularMarketDayLow || quote.regularMarketPrice || 0,
                o: quote.regularMarketOpen || quote.regularMarketPrice || 0,
                pc: quote.previousClose || quote.regularMarketPrice || 0,
                dp: quote.regularMarketChangePercent || 0,
                t: Date.now()
            });
        } else {
            // Use Finnhub for US stocks if API key is provided
            const token = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

            if (token) {
                try {
                    const response = await fetch(
                        `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`,
                        { cache: 'no-store' }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        if (data.c && data.c > 0) {
                            return NextResponse.json({
                                c: data.c,
                                h: data.h || data.c,
                                l: data.l || data.c,
                                o: data.o || data.c,
                                pc: data.pc || data.c,
                                dp: data.dp || 0,
                                t: data.t || Date.now()
                            });
                        }
                    }
                } catch (e) {
                    console.warn(`Finnhub quote error for ${symbol}, falling back to Yahoo Finance`);
                }
            }

            // Reliable fallback to Yahoo Finance (real-time US stock prices, no API key required)
            const yahooUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`;
            const response = await fetch(yahooUrl, {
                cache: 'no-store',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const quote = data?.chart?.result?.[0]?.meta;

                if (quote && quote.regularMarketPrice) {
                    const currentPrice = quote.regularMarketPrice;
                    const prevClose = quote.chartPreviousClose || quote.previousClose || currentPrice;
                    const changePercent = prevClose > 0 ? ((currentPrice - prevClose) / prevClose) * 100 : 0;

                    return NextResponse.json({
                        c: currentPrice,
                        h: quote.regularMarketDayHigh || currentPrice,
                        l: quote.regularMarketDayLow || currentPrice,
                        o: quote.regularMarketOpen || currentPrice,
                        pc: prevClose,
                        dp: changePercent,
                        t: Date.now()
                    });
                }
            }

            return NextResponse.json({ c: 100, dp: 0, warning: "Fallback quote" });
        }
    } catch (error) {
        console.error("Quote fetch error:", error);
        return NextResponse.json({ c: 0, dp: 0, error: "Failed to fetch" }, { status: 500 });
    }
}
