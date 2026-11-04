"use client";

import React, { useState, useEffect } from "react";

export function OhmsLawSim() {
  const [voltage, setVoltage] = useState(12); // Volts
  const [resistance, setResistance] = useState(6); // Ohms
  const [offset, setOffset] = useState(0);

  // Calculations
  const current = resistance > 0 ? voltage / resistance : 0; // Amperes
  const power = voltage * current; // Watts
  const isOverheating = power > 35;

  // Charge flow animation
  useEffect(() => {
    let animId: number;
    const speed = Math.min(Math.max(current * 0.8, 0.2), 6);
    const animate = () => {
      setOffset((prev) => (prev + speed) % 40);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [current]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#807f78]">Voltage (V)</span>
            <span className="font-mono text-[#ff6a3d]">{voltage} V</span>
          </div>
          <input
            type="range"
            min="1"
            max="36"
            step="1"
            value={voltage}
            onChange={(e) => setVoltage(Number(e.target.value))}
            className="mt-3 w-full cursor-pointer accent-[#ff3b1d]"
          />
          <div className="flex justify-between text-[10px] text-[#807f78] mt-1">
            <span>1 V</span>
            <span>36 V</span>
          </div>
        </div>

        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#807f78]">Resistance (R)</span>
            <span className="font-mono text-[#ff6a3d]">{resistance} Ω</span>
          </div>
          <input
            type="range"
            min="1"
            max="24"
            step="1"
            value={resistance}
            onChange={(e) => setResistance(Number(e.target.value))}
            className="mt-3 w-full cursor-pointer accent-[#ff3b1d]"
          />
          <div className="flex justify-between text-[10px] text-[#807f78] mt-1">
            <span>1 Ω</span>
            <span>24 Ω</span>
          </div>
        </div>
      </div>

      {/* Calculated Readouts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#807f78]">
            Current (I = V/R)
          </span>
          <p className="mt-1 font-mono text-2xl font-bold text-[#f3f1ea]">
            {current.toFixed(2)} A
          </p>
        </div>

        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#807f78]">
            Power (P = V × I)
          </span>
          <p
            className={`mt-1 font-mono text-2xl font-bold ${
              isOverheating ? "text-red-400" : "text-[#22c55e]"
            }`}
          >
            {power.toFixed(1)} W
          </p>
        </div>

        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#807f78]">
            Status
          </span>
          <p
            className={`mt-1 font-mono text-sm font-bold uppercase ${
              isOverheating ? "text-red-400" : "text-green-400"
            }`}
          >
            {isOverheating ? "⚠ Overheating" : "Normal"}
          </p>
        </div>
      </div>

      {/* Interactive Circuit Canvas (SVG) */}
      <div className="relative rounded-2xl border border-[rgba(243,241,234,0.1)] bg-[#08080a] p-6 text-center">
        <svg
          viewBox="0 0 500 240"
          className="mx-auto h-auto w-full max-w-[500px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Circuit Loop Outline */}
          <rect
            x="60"
            y="40"
            width="380"
            height="160"
            rx="12"
            stroke="rgba(243,241,234,0.2)"
            strokeWidth="4"
          />

          {/* Animated Electron Charges along wire */}
          <rect
            x="60"
            y="40"
            width="380"
            height="160"
            rx="12"
            stroke="#ff3b1d"
            strokeWidth="3"
            strokeDasharray="6 24"
            strokeDashoffset={-offset}
          />

          {/* Voltage Source (DC Battery) - Left */}
          <g transform="translate(60, 120)">
            <circle cx="0" cy="0" r="24" fill="#111114" stroke="#ff3b1d" strokeWidth="2" />
            <text x="0" y="5" fill="#f3f1ea" fontSize="11" fontWeight="bold" textAnchor="middle">
              {voltage}V
            </text>
            <text x="0" y="-30" fill="#807f78" fontSize="10" textAnchor="middle">
              DC Source
            </text>
          </g>

          {/* Resistor Component - Top */}
          <g transform="translate(250, 40)">
            <rect
              x="-45"
              y="-15"
              width="90"
              height="30"
              rx="6"
              fill={isOverheating ? "rgba(239,68,68,0.3)" : "#17171b"}
              stroke={isOverheating ? "#ef4444" : "#ff6a3d"}
              strokeWidth="2"
            />
            <text x="0" y="5" fill="#f3f1ea" fontSize="12" fontWeight="bold" textAnchor="middle">
              {resistance} Ω
            </text>
            <text x="0" y="-22" fill="#807f78" fontSize="10" textAnchor="middle">
              Load Resistor
            </text>
          </g>

          {/* Digital Ammeter - Bottom */}
          <g transform="translate(250, 200)">
            <circle cx="0" cy="0" r="22" fill="#111114" stroke="#22c55e" strokeWidth="2" />
            <text x="0" y="5" fill="#4ade80" fontSize="11" fontWeight="bold" textAnchor="middle">
              {current.toFixed(1)}A
            </text>
            <text x="0" y="34" fill="#807f78" fontSize="10" textAnchor="middle">
              Ammeter
            </text>
          </g>
        </svg>

        <p className="mt-3 text-[11px] text-[#807f78]">
          Speed of moving red electron dashes reflects instantaneous current magnitude (I = {current.toFixed(2)} A).
        </p>
      </div>
    </div>
  );
}
