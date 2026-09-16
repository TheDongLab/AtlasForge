// SPDX-FileCopyrightText: 2026 Dong Lab, Yale School of Medicine <https://donglab.org>
//
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo } from "react"
import { useTheme } from "@mui/material"
import type { ExpressionRow } from "@/types/expression"

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  const v =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}

// Clamp t to [0, 1]
export function lerpHex(from: string, to: string, t: number): string {
  const u = Math.max(0, Math.min(1, t))
  const [ar, ag, ab] = hexToRgb(from)
  const [br, bg, bb] = hexToRgb(to)
  return `rgb(${Math.round(ar + (br - ar) * u)},${Math.round(ag + (bg - ag) * u)},${Math.round(ab + (bb - ab) * u)})`
}

export function tpmIntensity(tpm: number | null, domainMax: number): number {
  if (tpm === null) return 0
  return Math.max(0, Math.min(1, Math.log2(tpm + 1) / domainMax))
}

// Cap the scale at this percentile of the loaded values to prevent a few highly expressed genes from ruining the whole heatmap
const SCALE_PERCENTILE = 0.99

export function useTpmColorScale(rows: ExpressionRow[]) {
  const theme = useTheme()

  const domainMax = useMemo(() => {
    if (rows.length === 0) return 1
    const vals = rows.map((r) => Math.log2(r.tpm + 1)).sort((a, b) => a - b)
    const idx = Math.floor(SCALE_PERCENTILE * (vals.length - 1))
    return vals[idx] || 1
  }, [rows])

  const absentColor = theme.palette.action.disabledBackground
  const paper = theme.palette.background.paper
  const primary = theme.palette.primary.main

  // Lookup table because colorFor runs once per cell, tens of thousands of times per redraw
  const lut = useMemo(() => {
    const [br, bg, bb] = hexToRgb(paper)
    const [pr, pg, pb] = hexToRgb(primary)
    const N = 256
    const arr = new Array<string>(N)
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1)
      const r = Math.round(br + (pr - br) * t)
      const g = Math.round(bg + (pg - bg) * t)
      const b = Math.round(bb + (pb - bb) * t)
      arr[i] = `rgb(${r},${g},${b})`
    }
    return arr
  }, [paper, primary])

  const colorFor = useCallback(
    (tpm: number | null): string => {
      if (tpm === null) return absentColor
      const t = tpmIntensity(tpm, domainMax)
      return lut[Math.round(t * (lut.length - 1))]
    },
    [domainMax, absentColor, lut],
  )

  return { colorFor, domainMax }
}

function divergingLut(low: string, mid: string, high: string): string[] {
  const [lr, lg, lb] = hexToRgb(low)
  const [mr, mg, mb] = hexToRgb(mid)
  const [hr, hg, hb] = hexToRgb(high)
  const N = 256
  const arr = new Array<string>(N)
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1)
    const [a, ag, ab, br, bg, bb, u] =
      t < 0.5 ? [lr, lg, lb, mr, mg, mb, t * 2] : [mr, mg, mb, hr, hg, hb, (t - 0.5) * 2]
    const r = Math.round(a + (br - a) * u)
    const g = Math.round(ag + (bg - ag) * u)
    const b = Math.round(ab + (bb - ab) * u)
    arr[i] = `rgb(${r},${g},${b})`
  }
  return arr
}

// Match the diverging endpoints to the app's blue and magenta accents
export const Z_SCORE_COLORS = {
  light: { low: "#4078f2", high: "#a626a4" },
  dark: { low: "#51afef", high: "#c678dd" },
} as const

// Limit outliers to preserve contrast for most cells
const Z_SCALE_PERCENTILE = 0.99

export function useZScoreColorScale(rows: ExpressionRow[]) {
  const theme = useTheme()
  const mode = theme.palette.mode

  const zMax = useMemo(() => {
    const vals = rows
      .map((r) => Math.abs(r.z_score ?? 0))
      .filter((v) => Number.isFinite(v))
      .sort((a, b) => a - b)
    if (vals.length === 0) return 1
    const idx = Math.floor(Z_SCALE_PERCENTILE * (vals.length - 1))
    return vals[idx] || 1
  }, [rows])

  const absentColor = theme.palette.action.disabledBackground
  const paper = theme.palette.background.paper
  const low = Z_SCORE_COLORS[mode].low
  const high = Z_SCORE_COLORS[mode].high

  const lut = useMemo(() => divergingLut(low, paper, high), [low, paper, high])

  const colorAt = useCallback((t: number) => lut[Math.round(t * (lut.length - 1))], [lut])

  const colorFor = useCallback(
    (z: number | null): string => {
      if (z === null) return absentColor
      const t = 0.5 + Math.max(-1, Math.min(1, z / zMax)) * 0.5
      return colorAt(t)
    },
    [zMax, absentColor, colorAt],
  )

  return { colorFor, colorAt, zMax }
}
