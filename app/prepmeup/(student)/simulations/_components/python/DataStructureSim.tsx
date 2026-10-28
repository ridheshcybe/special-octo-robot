"use client";

import React, { useState } from "react";

export function DataStructureSim() {
  const [listItems, setListItems] = useState<string[]>(["Apple", "Banana", "Cherry"]);
  const [newVal, setNewVal] = useState("");

  const handleAppend = () => {
    if (newVal.trim() && listItems.length < 6) {
      setListItems([...listItems, newVal.trim()]);
      setNewVal("");
    }
  };

  const handlePop = () => {
    if (listItems.length > 1) {
      setListItems(listItems.slice(0, -1));
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-3 rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4 items-center">
        <input
          type="text"
          placeholder="New element..."
          value={newVal}
          onChange={(e) => setNewVal(e.target.value)}
          className="flex-1 rounded-lg border border-[rgba(243,241,234,0.15)] bg-[#08080a] px-3 py-2 text-xs text-[#f3f1ea] focus:border-[#ff3b1d] focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAppend}
          disabled={!newVal.trim() || listItems.length >= 6}
          className="rounded-lg bg-[#ff3b1d] px-4 py-2 text-xs font-bold text-[#08080a] disabled:opacity-40"
        >
          .append()
        </button>
        <button
          type="button"
          onClick={handlePop}
          disabled={listItems.length <= 1}
          className="rounded-lg border border-[rgba(243,241,234,0.2)] bg-[#17171b] px-4 py-2 text-xs font-bold text-[#f3f1ea] disabled:opacity-40"
        >
          .pop()
        </button>
      </div>

      {/* Visual Array Structure */}
      <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-bold uppercase text-[#807f78]">
            Python List Layout in Contiguous Memory
          </h4>
          <span className="font-mono text-xs text-[#ff6a3d]">
            len(items) == {listItems.length}
          </span>
        </div>

        {/* Array Cells */}
        <div className="flex flex-wrap gap-2 justify-center py-4">
          {listItems.map((item, idx) => {
            const negIdx = idx - listItems.length;
            return (
              <div key={idx} className="flex flex-col items-center">
                {/* Positive Index */}
                <span className="font-mono text-[11px] font-bold text-[#4ade80] mb-1">
                  [{idx}]
                </span>

                {/* Data Block */}
                <div className="flex h-16 w-24 items-center justify-center rounded-xl border border-[#ff3b1d]/40 bg-[#17171b] font-mono text-xs font-bold text-[#f3f1ea] shadow">
                  &quot;{item}&quot;
                </div>

                {/* Negative Index */}
                <span className="font-mono text-[11px] font-bold text-[#ff6a3d] mt-1">
                  [{negIdx}]
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-around text-center text-xs border-t border-[rgba(243,241,234,0.06)] pt-4 text-[#807f78]">
          <span>Green = 0-Based Index (<code className="text-[#4ade80]">items[0]</code>)</span>
          <span>Orange = Negative Index (<code className="text-[#ff6a3d]">items[-1]</code>)</span>
        </div>
      </div>
    </div>
  );
}
