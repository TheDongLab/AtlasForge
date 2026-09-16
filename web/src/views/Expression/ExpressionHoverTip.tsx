// SPDX-FileCopyrightText: 2026 Dong Lab, Yale School of Medicine <https://donglab.org>
//
// SPDX-License-Identifier: Apache-2.0

import { Box, Typography } from "@mui/material"
import CellHoverTip from "@/components/heatmap/CellHoverTip"
import { formatTpm } from "@/utils/format"
import type { ExpressionValueMode } from "@/types/expression"
import type { ExpressionHoverState } from "./useExpressionHeatmapState"

interface ExpressionHoverTipProps {
  hover: ExpressionHoverState
  monoFont: string
  valueMode: ExpressionValueMode
}

export default function ExpressionHoverTip({
  hover,
  monoFont,
  valueMode,
}: ExpressionHoverTipProps) {
  const showZScore = valueMode === "z-score"
  const label = showZScore ? "Z-score" : "TPM"
  const text =
    hover.value === null ? "—" : showZScore ? hover.value.toFixed(2) : formatTpm(hover.value)
  return (
    <CellHoverTip
      x={hover.clientX}
      y={hover.clientY}
      symbol={hover.symbol}
      columnLabel={hover.tissue}
      name={hover.name}
      monoFont={monoFont}
    >
      <Typography variant="caption" sx={{ display: "block", mt: 0.25, fontSize: 13 }}>
        {label}:{" "}
        <Box component="span" sx={{ fontFamily: monoFont, fontWeight: 600 }}>
          {text}
        </Box>
      </Typography>
    </CellHoverTip>
  )
}
