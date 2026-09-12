"use client";

import { useEffect, useState } from "react";
import { Circle } from "lucide-react";

export default function MarketStatus() {
    const [isOpen, setIsOpen] = useState(false);
    const [time, setTime] = useState("");

    useEffect(() => {
        const checkMarketStatus = () => {
            const now = new Date();
            const day = now.getDay();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setTime(timeString);

            // Indian Market Hours: 9:15 AM - 3:30 PM (9.25 - 15.5)
            // Monday to Friday (1-5)
            const isWeekday = day >= 1 && day <= 5;
            const currentTime = hours + minutes / 60;
            const isMarketHours = currentTime >= 9.25 && currentTime <= 15.5;

            setIsOpen(isWeekday && isMarketHours);
        };

        checkMarketStatus();
        const interval = setInterval(checkMarketStatus, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-3 bg-[#121319]/90 backdrop-blur-xl px-4 py-2 rounded-full border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <div className="flex items-center gap-2">
                <Circle className={`h-2.5 w-2.5 fill-current ${isOpen ? 'text-emerald-400 animate-pulse drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'text-rose-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Market {isOpen ? "Open" : "Closed"}
                </span>
            </div>
            <div className="h-3.5 w-px bg-white/[0.1]" />
            <span className="text-xs font-mono text-muted-foreground font-medium">{time} IST</span>
        </div>
    );
}
