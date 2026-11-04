"use client";

import React, { useState } from "react";

export function PowerEnergySim() {
  const [voltage, setVoltage] = useState(230); // 230V Indian standard mains
  const [current, setCurrent] = useState(5); // 5A standard appliance
  const [hours, setHours] = useState(4); // 4 hours per day

  // Power in Watts and kW
  const powerWatts = voltage * current;
  const powerKw = powerWatts / 1000;

  // Energy consumed in kWh (Units) and Joules
  const energyKwh = powerKw * hours;
  const energyJoules = powerWatts * hours * 3600;

  // Comparison metrics
  const bulbEquivalentHours = (energyKwh * 1000) / 60; // 60W bulb

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#807f78]">Mains Voltage (V)</span>
            <span className="font-mono text-[#ff6a3d]">{voltage} V</span>
          </div>
          <input
            type="range"
            min="100"
            max="440"
            step="10"
            value={voltage}
            onChange={(e) => setVoltage(Number(e.target.value))}
            className="mt-3 w-full cursor-pointer accent-[#ff3b1d]"
          />
        </div>

        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#807f78]">Load Current (I)</span>
            <span className="font-mono text-[#ff6a3d]">{current} A</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="0.5"
            value={current}
            onChange={(e) => setCurrent(Number(e.target.value))}
            className="mt-3 w-full cursor-pointer accent-[#ff3b1d]"
          />
        </div>

        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#807f78]">Operating Time (t)</span>
            <span className="font-mono text-[#ff6a3d]">{hours} Hours</span>
          </div>
          <input
            type="range"
            min="1"
            max="24"
            step="1"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="mt-3 w-full cursor-pointer accent-[#ff3b1d]"
          />
        </div>
      </div>

      {/* Primary KPI Outputs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-5 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#807f78]">
            Instantaneous Power (P = V × I)
          </span>
          <p className="mt-1 font-mono text-3xl font-bold text-[#f3f1ea]">
            {powerWatts >= 1000 ? `${powerKw.toFixed(2)} kW` : `${powerWatts.toFixed(0)} W`}
          </p>
        </div>

        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-5 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#807f78]">
            Energy Consumed (E = P × t)
          </span>
          <p className="mt-1 font-mono text-3xl font-bold text-[#ff6a3d]">
            {energyKwh.toFixed(2)} kWh
          </p>
          <span className="text-[10px] text-[#807f78]">({(energyJoules / 1e6).toFixed(2)} MegaJoules)</span>
        </div>

        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-5 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#807f78]">
            Appliance Benchmark
          </span>
          <p className="mt-1 font-mono text-2xl font-bold text-[#4ade80]">
            ~{bulbEquivalentHours.toFixed(0)} Hours
          </p>
          <span className="text-[10px] text-[#807f78]">Powering a 60W standard incandescent bulb</span>
        </div>
      </div>
    </div>
  );
}
