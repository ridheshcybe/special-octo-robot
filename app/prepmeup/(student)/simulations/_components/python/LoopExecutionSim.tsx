"use client";

import React, { useState } from "react";

export function LoopExecutionSim() {
  const [step, setStep] = useState(0);

  const loopTrace = [
    { line: 1, i: null, total: 0, cond: "Start", console: "" },
    { line: 2, i: 1, total: 0, cond: "1 in range(1, 5) -> True", console: "" },
    { line: 3, i: 1, total: 1, cond: "total += 1", console: "Adding 1 -> total is 1\n" },
    { line: 2, i: 2, total: 1, cond: "2 in range(1, 5) -> True", console: "Adding 1 -> total is 1\n" },
    { line: 3, i: 2, total: 3, cond: "total += 2", console: "Adding 1 -> total is 1\nAdding 2 -> total is 3\n" },
    { line: 2, i: 3, total: 3, cond: "3 in range(1, 5) -> True", console: "Adding 1 -> total is 1\nAdding 2 -> total is 3\n" },
    { line: 3, i: 3, total: 6, cond: "total += 3", console: "Adding 1 -> total is 1\nAdding 2 -> total is 3\nAdding 3 -> total is 6\n" },
    { line: 2, i: 4, total: 6, cond: "4 in range(1, 5) -> True", console: "Adding 1 -> total is 1\nAdding 2 -> total is 3\nAdding 3 -> total is 6\n" },
    { line: 3, i: 4, total: 10, cond: "total += 4", console: "Adding 1 -> total is 1\nAdding 2 -> total is 3\nAdding 3 -> total is 6\nAdding 4 -> total is 10\n" },
    { line: 2, i: 5, total: 10, cond: "5 in range(1, 5) -> False (Loop Terminates)", console: "Adding 1 -> total is 1\nAdding 2 -> total is 3\nAdding 3 -> total is 6\nAdding 4 -> total is 10\n" },
    { line: 4, i: 4, total: 10, cond: "print(final)", console: "Adding 1 -> total is 1\nAdding 2 -> total is 3\nAdding 3 -> total is 6\nAdding 4 -> total is 10\nFinal total is 10\n" },
  ];

  const current = loopTrace[step];

  const codeLines = [
    { num: 1, text: "total = 0" },
    { num: 2, text: "for i in range(1, 5):" },
    { num: 3, text: "    total += i" },
    { num: 4, text: "print('Final total is', total)" },
  ];

  return (
    <div className="space-y-6">
      {/* Playback Controls */}
      <div className="flex items-center justify-between rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep(0)}
            className="rounded border border-[rgba(243,241,234,0.2)] px-3 py-1 text-xs text-[#807f78] hover:text-[#f3f1ea] disabled:opacity-30"
          >
            ⏮ Reset
          </button>
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded border border-[rgba(243,241,234,0.2)] px-3 py-1 text-xs text-[#f3f1ea] disabled:opacity-30"
          >
            ◀ Step Back
          </button>
          <button
            type="button"
            disabled={step === loopTrace.length - 1}
            onClick={() => setStep((s) => Math.min(loopTrace.length - 1, s + 1))}
            className="rounded bg-[#ff3b1d] px-4 py-1 text-xs font-bold text-[#08080a] disabled:opacity-30"
          >
            Step Forward ▶
          </button>
        </div>

        <span className="font-mono text-xs text-[#807f78]">
          Step {step + 1} / {loopTrace.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Source Code View with Active Line Highlighting */}
        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-5">
          <h4 className="text-xs font-bold uppercase text-[#807f78] mb-3">Code Pointer</h4>
          <div className="rounded-lg bg-[#08080a] p-4 font-mono text-xs space-y-1 border border-[rgba(243,241,234,0.06)]">
            {codeLines.map((line) => {
              const isActive = current.line === line.num;
              return (
                <div
                  key={line.num}
                  className={`flex gap-3 px-2 py-1 rounded transition ${
                    isActive ? "bg-[#ff3b1d]/20 border-l-2 border-[#ff3b1d] text-[#f3f1ea] font-bold" : "text-[#807f78]"
                  }`}
                >
                  <span className="opacity-40">{line.num}</span>
                  <span>{line.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* State Environment & Console Output */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4">
            <h4 className="text-xs font-bold uppercase text-[#807f78] mb-2">Live Loop Variables</h4>
            <div className="grid grid-cols-2 gap-3 text-center font-mono">
              <div className="rounded-lg bg-[#08080a] p-3 border border-[rgba(243,241,234,0.06)]">
                <span className="text-[10px] text-[#807f78] block">Loop Variable i</span>
                <span className="text-lg font-bold text-[#ff6a3d]">
                  {current.i !== null ? current.i : "None"}
                </span>
              </div>
              <div className="rounded-lg bg-[#08080a] p-3 border border-[rgba(243,241,234,0.06)]">
                <span className="text-[10px] text-[#807f78] block">Accumulator total</span>
                <span className="text-lg font-bold text-[#4ade80]">{current.total}</span>
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-[#807f78] font-mono">{current.cond}</p>
          </div>

          <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4">
            <h4 className="text-xs font-bold uppercase text-[#807f78] mb-2">Standard Output (stdout)</h4>
            <pre className="min-h-[80px] rounded-lg bg-[#08080a] p-3 font-mono text-xs text-[#4ade80] whitespace-pre-wrap">
              {current.console || "(No output printed yet)"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
