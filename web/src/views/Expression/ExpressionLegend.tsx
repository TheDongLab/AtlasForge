// SPDX-FileCopyrightText: 2026 Dong Lab, Yale School of Medicine <https://donglab.org>
//
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo } from "react"
import { MenuItem, Select, Tooltip, useTheme } from "@mui/material"
import HeatmapColorLegend, { type LegendTick } from "@/components/HeatmapColorLegend"
import type { ExpressionRow, ExpressionValueMode } from "@/types/expression"
import { formatTpmCompact } from "@/utils/format"
import { lerpHex, useTpmColorScale, useZScoreColorScale } from "@/utils/tpmColor"

interface Props {
  rows: ExpressionRow[]
  valueMode: ExpressionValueMode
  onValueModeChange: (mode: ExpressionValueMode) => void
}

export default function ExpressionLegend({ rows, valueMode, onValueModeChange }: Props) {
  const theme = useTheme()
  const { domainMax } = useTpmColorScale(rows)
  const { colorAt: zScoreColorAt, zMax } = useZScoreColorScale(rows)
  const isZScore = valueMode === "z-score"

  const tpmColorAt = useCallback(
    (t: number) => lerpHex(theme.palette.background.paper, theme.palette.primary.main, t),
    [theme.palette.background.paper, theme.palette.primary.main],
  )

  const ticks: LegendTick[] = useMemo(
    () =>
      isZScore
        ? [
            { frac: 0, label: `−${zMax.toFixed(1)}` },
            { frac: 0.5, label: "0" },
            { frac: 1, label: `+${zMax.toFixed(1)}` },
          ]
        : [
            { frac: 0, label: "0" },
            { frac: 0.5, label: formatTpmCompact(Math.pow(2, domainMax / 2) - 1) },
            { frac: 1, label: `≥${formatTpmCompact(Math.pow(2, domainMax) - 1)}` },
          ],
    [isZScore, zMax, domainMax],
  )

  const modeSwitch = (
    <Tooltip title="Choose between TPM values and relative z-scores" placement="top">
      <Select
        value={valueMode}
        onChange={(e) => onValueModeChange(e.target.value as ExpressionValueMode)}
        variant="standard"
        disableUnderline
        inputProps={{ "aria-label": "Expression scale" }}
        sx={{
          alignSelf: "stretch",
          "& .MuiSelect-select": {
            py: 0,
            pl: 0.5,
            fontSize: 12,
            fontWeight: 600,
            color: "text.secondary",
          },
        }}
      >
        <MenuItem value="tpm">TPM</MenuItem>
        <MenuItem value="z-score">Z-score</MenuItem>
      </Select>
    </Tooltip>
  )

  return (
    <HeatmapColorLegend
      title={isZScore ? "Z-score" : "TPM"}
      titleContent={modeSwitch}
      colorAt={isZScore ? zScoreColorAt : tpmColorAt}
      ticks={ticks}
      absent={{ color: theme.palette.action.disabledBackground, label: "no data" }}
    />
  )
}
