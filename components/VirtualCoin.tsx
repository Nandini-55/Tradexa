import React from "react";
import { cn } from "@/lib/utils";

interface VirtualCoinProps {
  className?: string;
  size?: number;
}

export default function VirtualCoin({ className = "h-4 w-4", size }: VirtualCoinProps) {
  return (
    <svg
      width={size || 20}
      height={size || 20}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block shrink-0 align-middle select-none", className)}
    >
      <defs>
        {/* Outer Ring Gradient */}
        <linearGradient id="coinGoldOuter" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="30%" stopColor="#EAB308" />
          <stop offset="70%" stopColor="#CA8A04" />
          <stop offset="100%" stopColor="#854D0E" />
        </linearGradient>

        {/* Coin Face Gradient */}
        <radialGradient id="coinFace" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#FACC15" />
          <stop offset="85%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </radialGradient>

        {/* Highlight Emboss */}
        <linearGradient id="coinEmboss" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id="coinGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#F59E0B" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Outer Coin Edge with subtle bevel */}
      <circle cx="12" cy="12" r="11" fill="url(#coinGoldOuter)" filter="url(#coinGlow)" />
      <circle cx="12" cy="12" r="10.2" stroke="#FEF9C3" strokeWidth="0.6" strokeOpacity="0.7" fill="none" />

      {/* Inner Recessed Face */}
      <circle cx="12" cy="12" r="9.2" fill="url(#coinFace)" />
      <circle cx="12" cy="12" r="8.2" stroke="#78350F" strokeWidth="0.5" strokeOpacity="0.5" fill="none" strokeDasharray="1.2 1.2" />

      {/* Embossed "V" (Virtual Coin) Logo Graphic */}
      <path
        d="M8.5 7.5L12 15L15.5 7.5H13.6L12 11.5L10.4 7.5H8.5Z"
        fill="url(#coinEmboss)"
        stroke="#78350F"
        strokeWidth="0.4"
      />
      {/* Decorative Star Sparks */}
      <circle cx="12" cy="16.5" r="0.7" fill="#FEF9C3" />
      <circle cx="6.8" cy="12" r="0.6" fill="#FEF9C3" opacity="0.8" />
      <circle cx="17.2" cy="12" r="0.6" fill="#FEF9C3" opacity="0.8" />
    </svg>
  );
}
