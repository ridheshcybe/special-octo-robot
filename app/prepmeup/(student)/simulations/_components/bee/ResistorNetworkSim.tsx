"use client";

import React, { useState } from "react";

export function ResistorNetworkSim() {
  const [mode, setMode] = useState<"series" | "parallel">("series");
  const [resistors, setResistors] = useState<number[]>([10, 20, 30]);
  const [voltage, setVoltage] = useState(60); // Total source voltage

  const addResistor = () => {
    if (resistors.length < 4) {
      setResistors([...resistors, 10]);
    }
  };

  const removeResistor = (index: number) => {
    if (resistors.length > 2) {
      setResistors(resistors.filter((_, i) => i !== index));
    }
  };

  const updateResistorVal = (index: number, val: number) => {
    const updated = [...resistors];
    updated[index] = Math.max(1, val);
    setResistors(updated);
  };

  // Equivalent Resistance Calculation
  const req =
    mode === "series"
      ? resistors.reduce((sum, r) => sum + r, 0)
      : 1 / resistors.reduce((sum, r) => sum + 1 / r, 0);

  const totalCurrent = req > 0 ? voltage / req : 0;

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setMode("series")}
          className={`flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition ${
            mode === "series"
              ? "bg-[#ff3b1d] text-[#08080a]"
              : "border border-[rgba(243,241,234,0.15)] bg-[#111114] text-[#807f78]"
          }`}
        >
          Series Configuration
        </button>
        <button
          type="button"
          onClick={() => setMode("parallel")}
          className={`flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition ${
            mode === "parallel"
              ? "bg-[#ff3b1d] text-[#08080a]"
              : "border border-[rgba(243,241,234,0.15)] bg-[#111114] text-[#807f78]"
          }`}
        >
          Parallel Configuration
        </button>
      </div>

      {/* Dynamic Resistor Values Config */}
      <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase text-[#807f78]">
            Resistor Bank ({resistors.length} / 4)
          </span>
          {resistors.length < 4 && (
            <button
              type="button"
              onClick={addResistor}
              className="rounded bg-[#17171b] border border-[rgba(243,241,234,0.2)] px-2.5 py-1 text-xs text-[#f3f1ea] hover:border-[#ff3b1d]"
            >
              + Add Resistor
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {resistors.map((r, i) => (
            <div key={i} className="rounded-lg bg-[#08080a] p-3 border border-[rgba(243,241,234,0.06)]">
              <div className="flex justify-between items-center text-xs text-[#807f78] mb-1">
                <span>R{i + 1}</span>
                {resistors.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeResistor(i)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                )}
              </div>
              <input
                type="number"
                min="1"
                max="500"
                value={r}
                onChange={(e) => updateResistorVal(i, Number(e.target.value))}
                className="w-full rounded bg-[#17171b] px-2 py-1 font-mono text-sm text-[#f3f1ea] border border-[rgba(243,241,234,0.1)] focus:outline-none focus:border-[#ff3b1d]"
              />
              <span className="block text-[10px] text-[#807f78] mt-1">Ohms (Ω)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Equivalent Calculation Readouts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#807f78]">
            Equivalent Resistance (R_eq)
          </span>
          <p className="mt-1 font-mono text-2xl font-bold text-[#ff6a3d]">
            {req.toFixed(2)} Ω
          </p>
        </div>

        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#807f78]">
            Total Source Current
          </span>
          <p className="mt-1 font-mono text-2xl font-bold text-[#4ade80]">
            {totalCurrent.toFixed(2)} A
          </p>
        </div>

        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#807f78]">
            Supply Voltage
          </span>
          <p className="mt-1 font-mono text-2xl font-bold text-[#f3f1ea]">
            {voltage} V
          </p>
        </div>
      </div>

      {/* Branch Breakdown Table */}
      <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#f3f1ea] mb-3">
          Individual Resistor Measurements
        </h4>
        <div className="divide-y divide-[rgba(243,241,234,0.06)] font-mono text-xs">
          {resistors.map((r, i) => {
            const vDrop = mode === "series" ? totalCurrent * r : voltage;
            const iBranch = mode === "series" ? totalCurrent : voltage / r;
            return (
              <div key={i} className="flex justify-between py-2 text-[#807f78]">
                <span className="text-[#f3f1ea] font-semibold">Resistor R{i + 1} ({r} Ω)</span>
                <span>Voltage Drop: <strong className="text-[#f3f1ea]">{vDrop.toFixed(1)} V</strong></span>
                <span>Branch Current: <strong className="text-[#4ade80]">{iBranch.toFixed(2)} A</strong></span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
