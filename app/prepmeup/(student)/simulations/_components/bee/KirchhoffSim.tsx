"use client";

import React, { useState } from "react";

export function KirchhoffSim() {
  const [v1, setV1] = useState(20); // Mesh 1 Voltage Source
  const [v2, setV2] = useState(10); // Mesh 2 Voltage Source
  const [r1, setR1] = useState(4);  // Left branch
  const [r2, setR2] = useState(2);  // Middle common branch
  const [r3, setR3] = useState(5);  // Right branch

  // Mesh Analysis Matrix Equations:
  // (R1 + R2)*I1 - R2*I2 = V1
  // -R2*I1 + (R2 + R3)*I2 = -V2
  const a1 = r1 + r2;
  const b1 = -r2;
  const c1 = v1;

  const a2 = -r2;
  const b2 = r2 + r3;
  const c2 = -v2;

  // Cramer's rule determinant:
  const det = a1 * b2 - a2 * b1;
  const i1 = det !== 0 ? (c1 * b2 - c2 * b1) / det : 0;
  const i2 = det !== 0 ? (a1 * c2 - a2 * c1) / det : 0;
  const i3 = i1 - i2; // Current down middle branch

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-3 text-center">
          <span className="text-[10px] text-[#807f78]">V1 (Left)</span>
          <input
            type="number"
            value={v1}
            onChange={(e) => setV1(Number(e.target.value))}
            className="mt-1 w-full rounded bg-[#08080a] p-1 font-mono text-center text-sm text-[#ff6a3d]"
          />
        </div>
        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-3 text-center">
          <span className="text-[10px] text-[#807f78]">V2 (Right)</span>
          <input
            type="number"
            value={v2}
            onChange={(e) => setV2(Number(e.target.value))}
            className="mt-1 w-full rounded bg-[#08080a] p-1 font-mono text-center text-sm text-[#ff6a3d]"
          />
        </div>
        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-3 text-center">
          <span className="text-[10px] text-[#807f78]">R1 (Ω)</span>
          <input
            type="number"
            min="1"
            value={r1}
            onChange={(e) => setR1(Math.max(1, Number(e.target.value)))}
            className="mt-1 w-full rounded bg-[#08080a] p-1 font-mono text-center text-sm text-[#f3f1ea]"
          />
        </div>
        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-3 text-center">
          <span className="text-[10px] text-[#807f78]">R2 (Common)</span>
          <input
            type="number"
            min="1"
            value={r2}
            onChange={(e) => setR2(Math.max(1, Number(e.target.value)))}
            className="mt-1 w-full rounded bg-[#08080a] p-1 font-mono text-center text-sm text-[#f3f1ea]"
          />
        </div>
        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-3 text-center">
          <span className="text-[10px] text-[#807f78]">R3 (Ω)</span>
          <input
            type="number"
            min="1"
            value={r3}
            onChange={(e) => setR3(Math.max(1, Number(e.target.value)))}
            className="mt-1 w-full rounded bg-[#08080a] p-1 font-mono text-center text-sm text-[#f3f1ea]"
          />
        </div>
      </div>

      {/* Circuit Diagram SVG */}
      <div className="rounded-2xl border border-[rgba(243,241,234,0.1)] bg-[#08080a] p-6 text-center">
        <svg
          viewBox="0 0 600 220"
          className="mx-auto h-auto w-full max-w-[600px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Mesh Loop */}
          <rect x="50" y="30" width="500" height="160" rx="8" stroke="rgba(243,241,234,0.2)" strokeWidth="3" />
          {/* Middle Dividing Branch */}
          <line x1="300" y1="30" x2="300" y2="190" stroke="rgba(243,241,234,0.2)" strokeWidth="3" />

          {/* V1 Battery */}
          <circle cx="50" cy="110" r="20" fill="#111114" stroke="#ff3b1d" strokeWidth="2" />
          <text x="50" y="115" fill="#f3f1ea" fontSize="10" textAnchor="middle" fontWeight="bold">{v1}V</text>

          {/* R1 Top-Left */}
          <rect x="140" y="18" width="60" height="24" rx="4" fill="#17171b" stroke="#ff6a3d" strokeWidth="1.5" />
          <text x="170" y="34" fill="#f3f1ea" fontSize="10" textAnchor="middle">R1: {r1}Ω</text>

          {/* R2 Common Branch */}
          <rect x="270" y="95" width="60" height="24" rx="4" fill="#17171b" stroke="#4ade80" strokeWidth="1.5" />
          <text x="300" y="111" fill="#f3f1ea" fontSize="10" textAnchor="middle">R2: {r2}Ω</text>

          {/* R3 Top-Right */}
          <rect x="400" y="18" width="60" height="24" rx="4" fill="#17171b" stroke="#ff6a3d" strokeWidth="1.5" />
          <text x="430" y="34" fill="#f3f1ea" fontSize="10" textAnchor="middle">R3: {r3}Ω</text>

          {/* V2 Battery */}
          <circle cx="550" cy="110" r="20" fill="#111114" stroke="#ff3b1d" strokeWidth="2" />
          <text x="550" y="115" fill="#f3f1ea" fontSize="10" textAnchor="middle" fontWeight="bold">{v2}V</text>
        </svg>
      </div>

      {/* KCL & KVL Equations Display */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4 text-center">
          <span className="text-[10px] font-bold uppercase text-[#807f78]">Loop 1 Mesh Current (I_1)</span>
          <p className="mt-1 font-mono text-2xl font-bold text-[#ff6a3d]">{i1.toFixed(2)} A</p>
        </div>
        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4 text-center">
          <span className="text-[10px] font-bold uppercase text-[#807f78]">Middle Branch Current (I_3 = I_1 - I_2)</span>
          <p className="mt-1 font-mono text-2xl font-bold text-[#4ade80]">{i3.toFixed(2)} A</p>
        </div>
        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4 text-center">
          <span className="text-[10px] font-bold uppercase text-[#807f78]">Loop 2 Mesh Current (I_2)</span>
          <p className="mt-1 font-mono text-2xl font-bold text-[#ff6a3d]">{i2.toFixed(2)} A</p>
        </div>
      </div>
    </div>
  );
}
