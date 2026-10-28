"use client";

import React, { useState } from "react";

export function CodeTracingSim() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [executed, setExecuted] = useState(false);

  const snippet = `nums = [1, 2, 3]
res = []
for n in nums:
    if n % 2 != 0:
        res.append(n * 10)
    else:
        res.append(n + 10)
print(res)`;

  const options = [
    "[10, 12, 30]",
    "[10, 20, 30]",
    "[11, 12, 13]",
    "[10, 12, 13]",
  ];

  const correctAnswer = "[10, 12, 30]";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-6">
        <h4 className="text-xs font-bold uppercase text-[#807f78] mb-3">
          Exam Output Prediction Snippet
        </h4>
        <pre className="rounded-lg bg-[#08080a] p-4 font-mono text-xs text-[#f3f1ea] leading-relaxed border border-[rgba(243,241,234,0.06)]">
          {snippet}
        </pre>
      </div>

      {/* Prediction Options */}
      <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-6">
        <h4 className="text-xs font-bold uppercase text-[#807f78] mb-3">
          Predict Output before Executing:
        </h4>
        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          {options.map((opt, i) => {
            const isSelected = selectedAnswer === opt;
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSelectedAnswer(opt);
                  setExecuted(false);
                }}
                className={`rounded-lg border p-3 text-left transition ${
                  isSelected
                    ? "border-[#ff3b1d] bg-[#ff3b1d]/10 text-[#f3f1ea] font-bold"
                    : "border-[rgba(243,241,234,0.1)] bg-[#08080a] text-[#807f78] hover:text-[#f3f1ea]"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={!selectedAnswer}
            onClick={() => setExecuted(true)}
            className="rounded-lg bg-gradient-to-r from-[#ff3b1d] to-[#ff6a3d] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#08080a] disabled:opacity-40"
          >
            ▶ Verify with Python Engine
          </button>
        </div>
      </div>

      {/* Result Verification Box */}
      {executed && (
        <div
          className={`rounded-xl border p-5 ${
            selectedAnswer === correctAnswer
              ? "border-green-500/30 bg-green-950/10 text-green-300"
              : "border-red-500/30 bg-red-950/10 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{selectedAnswer === correctAnswer ? "✓" : "✕"}</span>
            <strong className="text-sm">
              {selectedAnswer === correctAnswer ? "Correct Prediction!" : "Incorrect Prediction!"}
            </strong>
          </div>
          <p className="mt-2 text-xs leading-relaxed font-sans text-[#f3f1ea]/90">
            For n=1 (odd), 1*10 = 10. For n=2 (even), 2+10 = 12. For n=3 (odd), 3*10 = 30. Result is <code>[10, 12, 30]</code>.
          </p>
        </div>
      )}
    </div>
  );
}
