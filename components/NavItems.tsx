'use client'

import { NAV_ITEMS } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchCommand from "@/components/SearchCommand";

const NavItems = ({ initialStocks }: { initialStocks: StockWithWatchlistStatus[] }) => {
    const pathname = usePathname()

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';

        return pathname.startsWith(path);
    }

    return (
        <ul className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-sm font-medium">
            {NAV_ITEMS.map(({ href, label }) => {
                const active = isActive(href);

                if (href === '/search') return (
                    <li key="search-trigger">
                        <SearchCommand
                            renderAs="text"
                            label="Search"
                            initialStocks={initialStocks}
                        />
                    </li>
                );

                return (
                    <li key={href}>
                        <Link
                            href={href}
                            className={`px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                                active
                                    ? 'bg-[#7033F6]/20 text-white border border-[#7033F6]/40 font-semibold shadow-[0_0_20px_rgba(112,51,246,0.25)]'
                                    : 'text-muted-foreground hover:text-white hover:bg-white/[0.05]'
                            }`}
                        >
                            {label}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
export default NavItems
