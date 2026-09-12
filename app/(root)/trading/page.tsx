import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPortfolioWithLivePrices, getTransactionHistory } from "@/lib/actions/portfolio.actions";
import TradingClient from "@/components/VirtualTrading/TradingClient";

export default async function TradingPage() {
    let session = null;
    try {
        const auth = await getAuth();
        session = await auth.api.getSession({ headers: await headers() });
    } catch (error) {
        console.error("Auth error in TradingPage:", error);
    }

    if (!session?.user) {
        redirect('/sign-in');
    }

    let portfolio = null;
    let transactions: any[] = [];
    try {
        portfolio = await getPortfolioWithLivePrices(session.user.id);
        transactions = await getTransactionHistory(session.user.id, 20);
    } catch (error) {
        console.error("Portfolio fetch error in TradingPage:", error);
    }

    return (
        <TradingClient
            userId={session.user.id}
            initialPortfolio={portfolio}
            initialTransactions={transactions}
        />
    );
}
