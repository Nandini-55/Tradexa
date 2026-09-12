import Link from "next/link";
import Logo from "@/components/Logo";
import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
    let session = null;
    try {
        const auth = await getAuth();
        session = await auth.api.getSession({ headers: await headers() });
    } catch (error) {
        // If database connection is pending or auth is unavailable, allow auth page to render
        console.warn("Auth check failed in auth layout:", error);
    }

    if (session?.user) redirect('/');

    return (
        <main className="min-h-screen w-full bg-gradient-to-br from-[#8C7CAF] via-[#9E8ECA] to-[#7B68A6] flex flex-col items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-x-hidden selection:bg-purple-600 selection:text-white">
            {/* Top Navigation / Brand */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-4 px-2">
                <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 drop-shadow-md">
                    <Logo />
                </Link>
                <Link
                    href="/"
                    className="text-xs sm:text-sm font-semibold text-white/90 hover:text-white bg-black/25 hover:bg-black/35 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 transition-all shadow-sm"
                >
                    &larr; Back to Home
                </Link>
            </div>

            {/* Central Auth Card Content */}
            <div className="w-full flex items-center justify-center">
                {children}
            </div>
        </main>
    );
};

export default Layout;
