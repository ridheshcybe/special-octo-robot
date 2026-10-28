"use client";

import React, { useState, useEffect, useRef } from "react";

export function ACWaveformSim() {
  const [amplitude, setAmplitude] = useState(325); // Peak ~325V for 230V RMS
  const [frequency, setFrequency] = useState(50); // 50 Hz standard
  const [phaseAngleDeg, setPhaseAngleDeg] = useState(0); // Degrees
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Derived values
  const vRms = amplitude / Math.SQRT2;
  const timePeriodMs = (1 / frequency) * 1000;
  const angularFreq = 2 * Math.PI * frequency;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let timeShift = 0;

    const render = () => {
      timeShift += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Clear Canvas
      ctx.fillStyle = "#08080a";
      ctx.fillRect(0, 0, width, height);

      // Draw Grid Lines (Oscilloscope Reticle)
      ctx.strokeStyle = "rgba(243,241,234,0.06)";
      ctx.lineWidth = 1;

      // Vertical divisions
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      // Horizontal divisions
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center Axes
      ctx.strokeStyle = "rgba(243,241,234,0.18)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Sine Waveform Trace
      ctx.strokeStyle = "#ff3b1d";
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const phaseRad = (phaseAngleDeg * Math.PI) / 180;
      const scaleY = (height / 2 - 20) / 400; // Normalizer

      for (let x = 0; x < width; x++) {
        // Map x to time
        const t = (x / width) * 0.04; // 40ms window
        const v = amplitude * Math.sin(angularFreq * (t + timeShift * 0.0004) + phaseRad);
        const y = centerY - v * scaleY;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [amplitude, frequency, phaseAngleDeg, angularFreq]);

  return (
    <div className="space-y-6">
      {/* Oscilloscope Screen */}
      <div className="rounded-2xl border border-[rgba(243,241,234,0.1)] bg-[#08080a] p-4 text-center">
        <canvas
          ref={canvasRef}
          width={640}
          height={260}
          className="mx-auto w-full max-w-[640px] rounded-lg"
        />
        <div className="mt-2 flex justify-between text-[11px] font-mono text-[#807f78] px-2">
          <span>Scale: 50V / Div</span>
          <span>Timebase: 5ms / Div</span>
          <span>50 Hz Periodic Base</span>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#807f78]">Peak Amplitude (V_m)</span>
            <span className="font-mono text-[#ff6a3d]">{amplitude} V</span>
          </div>
          <input
            type="range"
            min="50"
            max="400"
            step="5"
            value={amplitude}
            onChange={(e) => setAmplitude(Number(e.target.value))}
            className="mt-2 w-full cursor-pointer accent-[#ff3b1d]"
          />
        </div>

        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#807f78]">Frequency (f)</span>
            <span className="font-mono text-[#ff6a3d]">{frequency} Hz</span>
          </div>
          <input
            type="range"
            min="10"
            max="120"
            step="5"
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="mt-2 w-full cursor-pointer accent-[#ff3b1d]"
          />
        </div>

        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#807f78]">Phase Angle (ϕ)</span>
            <span className="font-mono text-[#ff6a3d]">{phaseAngleDeg}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            step="15"
            value={phaseAngleDeg}
            onChange={(e) => setPhaseAngleDeg(Number(e.target.value))}
            className="mt-2 w-full cursor-pointer accent-[#ff3b1d]"
          />
        </div>
      </div>

      {/* Analytical Computations */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4 text-center">
          <span className="text-[10px] font-bold uppercase text-[#807f78]">
            RMS Voltage (V_rms = V_m / √2)
          </span>
          <p className="mt-1 font-mono text-2xl font-bold text-[#f3f1ea]">
            {vRms.toFixed(1)} V
          </p>
        </div>

        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4 text-center">
          <span className="text-[10px] font-bold uppercase text-[#807f78]">
            Time Period (T = 1/f)
          </span>
          <p className="mt-1 font-mono text-2xl font-bold text-[#4ade80]">
            {timePeriodMs.toFixed(1)} ms
          </p>
        </div>

        <div className="rounded-xl border border-[rgba(243,241,234,0.1)] bg-[#111114] p-4 text-center">
          <span className="text-[10px] font-bold uppercase text-[#807f78]">
            Angular Velocity (ω = 2πf)
          </span>
          <p className="mt-1 font-mono text-2xl font-bold text-[#ff6a3d]">
            {angularFreq.toFixed(0)} rad/s
          </p>
        </div>
      </div>
    </div>
  );
}
