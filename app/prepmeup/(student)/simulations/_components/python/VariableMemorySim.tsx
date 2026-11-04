"use client";

import React, { useState } from "react";

export function VariableMemorySim() {
  const [scenario, setScenario] = useState<"primitive" | "mutable">("primitive");
  const [step, setStep] = useState(0);

  // Primitive Scenarios (Immutable int)
  const primitiveSteps = [
    {
      code: "a = 5",
      stack: [{ name: "a", pointsTo: "addr_101" }],
      heap: [{ addr: "addr_101", type: "int", val: "5" }],
      note: "Variable 'a' on stack points to heap object '5' at address 101.",
    },
    {
      code: "b = a",
      stack: [
        { name: "a", pointsTo: "addr_101" },
        { name: "b", pointsTo: "addr_101" },
      ],
      heap: [{ addr: "addr_101", type: "int", val: "5" }],
      note: "'b' copies reference to the exact same object. id(a) == id(b).",
    },
    {
      code: "a = 6",
      stack: [
        { name: "a", pointsTo: "addr_102" },
        { name: "b", pointsTo: "addr_101" },
      ],
      heap: [
        { addr: "addr_101", type: "int", val: "5" },
        { addr: "addr_102", type: "int", val: "6" },
      ],
      note: "Integers are immutable! 'a' now points to newly allocated object '6' at address 102. 'b' remains 5.",
    },
  ];

  // Mutable Scenarios (List)
  const mutableSteps = [
    {
      code: "x = [10, 20]",
      stack: [{ name: "x", pointsTo: "addr_501" }],
      heap: [{ addr: "addr_501", type: "list", val: "[10, 20]" }],
      note: "'x' points to mutable list object on heap at address 501.",
    },
    {
      code: "y = x",
      stack: [
        { name: "x", pointsTo: "addr_501" },
        { name: "y", pointsTo: "addr_501" },
      ],
      heap: [{ addr: "addr_501", type: "list", val: "[10, 20]" }],
      note: "'y' shares the identical pointer! No shallow copy is made.",
    },
    {
      code: "y.append(30)",
      stack: [
        { name: "x", pointsTo: "addr_501" },
        { name: "y", pointsTo: "addr_501" },
      ],
      heap: [{ addr: "addr_501", type: "list", val: "[10, 20, 30]" }],
      note: "Mutation happens in-place! Since 'x' and 'y' reference address 501, x is now also [10, 20, 30]!",
    },
  ];

  const currentSteps = scenario === "primitive" ? primitiveSteps : mutableSteps;
  const current = currentSteps[step];

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            setScenario("primitive");
            setStep(0);
          }}
          className={`flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition ${
            scenario === "primitive"
              ? "bg-[#ff3b1d] text-[#08080a]"
              : "border border-[rgba(243,241,234,0.15)] bg-[#111114] text-[#807f78]"
          }`}
        >
          Immutable Types (Integers)
        </button>
        <button
          type="button"
          onClick={() => {
            setScenario("mutable");
            setStep(0);
          }}
          className={`flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition ${
            scenario === "mutable"
              ? "bg-[#ff3b1d] text-[#08080a]"
              : "border border-[rgba(243,241,234,0.15)] bg-[#111114] text-[#807f78]"
          }`}
        >
          Mutable Types (Lists)
        </button>
      </div>

      {/* Step Stepper */}
      <div className="flex items-center justify-between rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4">
        <div>
          <span className="text-[10px] uppercase text-[#ff3b1d] font-bold">Step {step + 1} of 3</span>
          <p className="font-mono text-sm font-bold text-[#f3f1ea]">{current.code}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            className="rounded border border-[rgba(243,241,234,0.2)] px-3 py-1 text-xs text-[#f3f1ea] disabled:opacity-30"
          >
            ← Previous
          </button>
          <button
            type="button"
            disabled={step === currentSteps.length - 1}
            onClick={() => setStep(step + 1)}
            className="rounded bg-[#ff3b1d] px-3.5 py-1 text-xs font-bold text-[#08080a] disabled:opacity-30"
          >
            Next Step →
          </button>
        </div>
      </div>

      {/* Stack & Heap Visualization */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Call Stack Panel */}
        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-5">
          <h4 className="text-xs font-bold uppercase text-[#807f78] mb-3">
            Call Stack (Variable Names)
          </h4>
          <div className="space-y-3 font-mono text-xs">
            {current.stack.map((v, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-[#08080a] p-3 border border-[rgba(243,241,234,0.08)]"
              >
                <span className="text-[#ff6a3d] font-bold">{v.name}</span>
                <span className="text-[#807f78]">points to ➔</span>
                <span className="text-[#f3f1ea] bg-[#17171b] px-2 py-0.5 rounded text-[11px]">
                  {v.pointsTo}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Heap Memory Objects */}
        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-5">
          <h4 className="text-xs font-bold uppercase text-[#807f78] mb-3">
            Heap Memory (Allocated Objects)
          </h4>
          <div className="space-y-3 font-mono text-xs">
            {current.heap.map((obj, i) => (
              <div
                key={i}
                className="rounded-lg bg-[#08080a] p-3 border border-[rgba(243,241,234,0.08)] flex justify-between items-center"
              >
                <div>
                  <span className="text-[10px] text-[#807f78] block">{obj.addr} ({obj.type})</span>
                  <span className="text-[#4ade80] font-bold text-sm">{obj.val}</span>
                </div>
                <span className="text-[10px] text-[#807f78] bg-[#17171b] px-2 py-1 rounded">
                  id: {obj.addr.replace("addr_", "")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="rounded-xl border-l-4 border-[#ff3b1d] bg-[#17171b] p-4 text-xs leading-relaxed text-[#f3f1ea]">
        <strong className="text-[#ff6a3d] block mb-1">Pedagogical Insight:</strong>
        {current.note}
      </div>
    </div>
  );
}
