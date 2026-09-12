import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getBankingOverview } from "@/lib/actions/banking.actions";
import KuberXClient from "@/components/KuberX/KuberXClient";

export const metadata = {
    title: "KuberX Virtual Bank | Tradexa",
    description: "Instant virtual coin loans and treasury credit for active market traders.",
};

export default async function KuberXPage() {
    let session = null;
    try {
        const auth = await getAuth();
        session = await auth.api.getSession({ headers: await headers() });
    } catch (error) {
        console.error("Auth error in KuberXPage:", error);
    }

    if (!session?.user) {
        redirect('/sign-in');
    }

    const overview = await getBankingOverview(session.user.id);

    return (
        <KuberXClient
            userId={session.user.id}
            initialOverview={overview}
        />
    );
}
