"use client";

import React from "react";

/**
 * PrepMeUpHero3D kept for API backwards compatibility.
 * Per redesign safety rails, 3D canvas is disabled (showCanvas={false} everywhere)
 * to maintain a calm, flat academic aesthetic.
 */
export function PrepMeUpHero3D({ showCanvas = false }: { showCanvas?: boolean }) {
  // Always inactive per calm academic redesign
  if (!showCanvas) return null;
  return null;
}
