import React, { useId } from 'react';

interface AlmasLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'horizontal';
  light?: boolean;
}

export default function AlmasLogo({ className = '', variant = 'full', light = true }: AlmasLogoProps) {
  const goldGradientId = useId();
  const silverGradientId = useId();

  const GoldEmblem = (
    <svg
      viewBox="0 0 200 130"
      className={
        variant === 'horizontal'
          ? 'w-7 h-7 md:w-9 md:h-9 shrink-0'
          : variant === 'icon'
          ? 'w-10 h-10'
          : 'w-14 h-11 md:w-16 md:h-12 shrink-0'
      }
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={goldGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="35%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#AA771C" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id={silverGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F3F4F6" />
          <stop offset="100%" stopColor="#D1D5DB" />
        </linearGradient>
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Diamond Outline & Facet Lattice */}
      <g stroke={`url(#${goldGradientId})`} strokeLinecap="round" strokeLinejoin="round" filter="url(#goldGlow)">
        {/* Outer Diamond Boundary */}
        <polygon points="50,15 150,15 185,55 100,115 15,55" fill="none" strokeWidth="3" />
        
        {/* Table & Upper Facets */}
        <line x1="75" y1="35" x2="125" y2="35" strokeWidth="2" />
        <line x1="50" y1="15" x2="75" y2="35" strokeWidth="2" />
        <line x1="100" y1="15" x2="100" y2="35" strokeWidth="2" />
        <line x1="150" y1="15" x2="125" y2="35" strokeWidth="2" />
        <line x1="15" y1="55" x2="75" y2="35" strokeWidth="2" />
        <line x1="185" y1="55" x2="125" y2="35" strokeWidth="2" />

        {/* Lower Pavilion Facets */}
        <line x1="15" y1="55" x2="100" y2="115" strokeWidth="2" />
        <line x1="185" y1="55" x2="100" y2="115" strokeWidth="2" />
        <line x1="75" y1="35" x2="100" y2="115" strokeWidth="2" />
        <line x1="125" y1="35" x2="100" y2="115" strokeWidth="2" />

        {/* Integrated 'A' Monogram inside Diamond */}
        <path
          d="M 100,22 L 65,102 M 100,22 L 135,102 M 77,72 L 123,72"
          stroke={`url(#${goldGradientId})`}
          strokeWidth="6"
          strokeLinecap="square"
        />
        {/* Serif Foot Details for 'A' */}
        <line x1="56" y1="102" x2="74" y2="102" strokeWidth="4" />
        <line x1="126" y1="102" x2="144" y2="102" strokeWidth="4" />
      </g>
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{GoldEmblem}</div>;
  }

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-2 md:gap-2.5 ${className}`}>
        {GoldEmblem}
        <span
          className={`font-serif tracking-[0.22em] sm:tracking-[0.26em] font-medium uppercase text-sm sm:text-base md:text-xl whitespace-nowrap ${
            light ? 'text-white' : 'text-emerald-950'
          }`}
          style={{
            fontFamily: "'Playfair Display', 'Cinzel', 'Didot', serif",
          }}
        >
          ALMAS JEWELS
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      {GoldEmblem}
      <span
        className={`font-serif tracking-[0.26em] sm:tracking-[0.32em] font-normal uppercase text-center mt-1.5 text-xs md:text-sm lg:text-base ${
          light ? 'text-white' : 'text-emerald-950'
        }`}
        style={{
          fontFamily: "'Playfair Display', 'Cinzel', 'Didot', serif",
        }}
      >
        ALMAS JEWELS
      </span>
    </div>
  );
}
