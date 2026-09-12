'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import NavItems from "@/components/NavItems";
import { signOut } from "@/lib/actions/auth.actions";

const UserDropdown = ({ user, initialStocks }: { user: User, initialStocks: StockWithWatchlistStatus[] }) => {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push("/sign-in");
    }

    const firstLetter = (user.name?.trim()?.charAt(0) || 'U').toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-white/[0.06] border border-white/[0.06] transition-all cursor-pointer">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#6231F5] to-[#8749FA] text-white text-xs font-bold flex items-center justify-center ring-2 ring-[#7033F6]/50 shadow-sm uppercase">
                        {firstLetter}
                    </div>
                    <span className='text-sm font-semibold text-white'>
                        {user.name}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#121319] border border-white/[0.08] text-white w-60 rounded-2xl p-2 shadow-2xl backdrop-blur-2xl">
                <DropdownMenuLabel className="p-2">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#6231F5] to-[#8749FA] text-white text-base font-bold flex items-center justify-center ring-2 ring-[#7033F6]/50 shadow-md uppercase">
                            {firstLetter}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className='text-sm font-bold text-white truncate'>
                                {user.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/[0.08] my-1" />
                <DropdownMenuItem onClick={handleSignOut} className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl px-3 py-2 text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                </DropdownMenuItem>
                <DropdownMenuSeparator className="hidden sm:block bg-white/[0.08] my-1" />
                <nav className="sm:hidden p-1">
                    <NavItems initialStocks={initialStocks} />
                </nav>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
export default UserDropdown
