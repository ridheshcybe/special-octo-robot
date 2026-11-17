"use client";

import React, { useEffect, useRef } from "react";

/**
 * Interactive 3D wireframe lattice + global 3D card tilt/spotlight controller.
 * Gives PrepMeUp AI tactile depth, perspective motion, and cursor-reactive lighting.
 */
export function PrepMeUpHero3D({ showCanvas = false }: { showCanvas?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Global cursor-reactive 3D tilt & spotlight for .pmu-card / .pmu-card-highlight
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.(
        ".pmu-card, .pmu-card-highlight"
      ) as HTMLElement | null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const nx = x / rect.width - 0.5;
      const ny = y / rect.height - 0.5;
      target.style.setProperty("--mx", `${x.toFixed(1)}px`);
      target.style.setProperty("--my", `${y.toFixed(1)}px`);
      target.style.setProperty("--rx", `${(-ny * 5).toFixed(2)}deg`);
      target.style.setProperty("--ry", `${(nx * 5).toFixed(2)}deg`);
    };

    const handlePointerOut = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.(
        ".pmu-card, .pmu-card-highlight"
      ) as HTMLElement | null;
      if (!target) return;
      target.style.setProperty("--rx", "0deg");
      target.style.setProperty("--ry", "0deg");
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", handlePointerOut, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerOut);
    };
  }, []);

  // 3D wireframe icosahedron + orbital rings in hero background
  useEffect(() => {
    if (!showCanvas) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : 520;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Golden ratio icosahedron vertices
    const t = (1 + Math.sqrt(5)) / 2;
    const rawVerts: [number, number, number][] = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
    ];
    const verts = rawVerts.map(([x, y, z]) => {
      const len = Math.hypot(x, y, z);
      return [x / len, y / len, z / len] as [number, number, number];
    });

    const edges: [number, number][] = [];
    for (let i = 0; i < verts.length; i++) {
      for (let j = i + 1; j < verts.length; j++) {
        const d = Math.hypot(
          verts[i][0] - verts[j][0],
          verts[i][1] - verts[j][1],
          verts[i][2] - verts[j][2]
        );
        if (d < 1.2) edges.push([i, j]);
      }
    }

    let targetX = 0;
    let targetY = 0;
    let rotX = 0.25;
    let rotY = 0.4;

    const onMove = (e: MouseEvent) => {
      targetY = (e.clientX / window.innerWidth - 0.5) * 0.9;
      targetX = (e.clientY / window.innerHeight - 0.5) * 0.6;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const render = (now: number) => {
      const time = now * 0.00045;
      rotX += (targetX + Math.sin(time) * 0.25 - rotX) * 0.04;
      rotY += (targetY + time - rotY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.46;
      const radius = Math.min(width, height) * 0.34;
      const fov = 3.2;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const projected = verts.map(([x, y, z]) => {
        // Rotate Y
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;
        // Rotate X
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;
        const scale = fov / (fov + z2 + 1.6);
        return {
          px: cx + x1 * radius * scale * 1.45,
          py: cy + y2 * radius * scale * 1.45,
          z: z2,
        };
      });

      // Draw edges with depth-based alpha
      for (const [a, b] of edges) {
        const pa = projected[a];
        const pb = projected[b];
        const depth = (pa.z + pb.z) * 0.5;
        const alpha = Math.max(0.06, Math.min(0.32, 0.2 - depth * 0.1));
        ctx.strokeStyle = `rgba(255, 59, 29, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pa.px, pa.py);
        ctx.lineTo(pb.px, pb.py);
        ctx.stroke();
      }

      // Draw vertices
      for (const p of projected) {
        const alpha = Math.max(0.15, Math.min(0.65, 0.42 - p.z * 0.2));
        ctx.fillStyle = `rgba(243, 241, 234, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [showCanvas]);

  if (!showCanvas) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.85,
      }}
    />
  );
}
