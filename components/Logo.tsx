'use client';

import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    showText?: boolean;
}

const Logo = ({ className, showText = true }: LogoProps) => {
    return (
        <div className={cn("flex items-center", className)}>
            <svg
                viewBox="0 0 700 180"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-auto"
                aria-label="Tradexa"
            >
                {showText && (
                    <text
                        x="0"
                        y="132"
                        fill="white"
                        fontSize="142"
                        fontWeight="900"
                        fontFamily="Arial Black, Arial, sans-serif"
                        letterSpacing="-8"
                    >
                        Tradexa
                    </text>
                )}

                {/* Market trend line */}
                <path
                    d="
                        M 75 160
                        L 145 120
                        L 205 147
                        L 270 110
                        L 330 138
                        L 395 103
                        L 455 125
                        L 515 91
                        L 565 91
                        L 625 20
                    "
                    stroke="#00F5A0"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Arrow head */}
                <path
                    d="
                        M 625 20
                        L 603 27
                        M 625 20
                        L 620 42
                    "
                    stroke="#00F5A0"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
};

export default Logo;