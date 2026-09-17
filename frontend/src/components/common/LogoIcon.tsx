import React from "react";

export default function LogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="logoGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="accentGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        {/* Background Shield */}
        <rect width="100" height="100" rx="24" fill="url(#logoGradComp)" />
        {/* IoT WiFi Signal Waves */}
        <path d="M28 28C40 18 60 18 72 28" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" opacity="0.9"/>
        <path d="M35 35C44 27 56 27 65 35" stroke="#34D399" strokeWidth="4.5" strokeLinecap="round"/>
        {/* School Graduation Cap & Building */}
        <path d="M50 35L78 49L50 63L22 49L50 35Z" fill="#FFFFFF"/>
        <path d="M31 58V73C31 79 50 85 50 85C50 85 69 79 69 73V58L50 67L31 58Z" fill="#FFFFFF" opacity="0.95"/>
        {/* AI Sensor Node */}
        <circle cx="50" cy="71" r="5" fill="url(#accentGradComp)"/>
      </svg>
    </div>
  );
}
