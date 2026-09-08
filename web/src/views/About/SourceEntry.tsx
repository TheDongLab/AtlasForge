// SPDX-FileCopyrightText: 2026 Dong Lab, Yale School of Medicine <https://donglab.org>
//
// SPDX-License-Identifier: Apache-2.0

import { Box, Chip, Link, Typography } from "@mui/material"
import type { DataSourceRecord } from "@/types/structure"

function LicenseChip({ spdx }: { spdx: string | null }) {
  if (!spdx) return null
  return (
    <Chip
      label={spdx}
      size="small"
      variant="outlined"
      sx={{
        height: 19,
        fontSize: 11,
        color: "text.secondary",
        borderColor: "divider",
        fontWeight: 500,
        "& .MuiChip-label": { px: 0.75, transform: "translateY(0.75px)" },
      }}
    />
  )
}

export function sourceDetail(rec: DataSourceRecord): string {
  return [rec.version, rec.assembly].filter(Boolean).join(" · ")
}

export function SourceEntry({
  name,
  detail,
  spdx,
  url,
}: {
  name: string
  detail: string
  spdx: string | null
  url: string | null
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minHeight: 26 }}>
      {url ? (
        <Link href={url} target="_blank" rel="noreferrer" variant="body2">
          {name}
        </Link>
      ) : (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {name}
        </Typography>
      )}
      <Box sx={{ flex: 1 }} />
      {detail && (
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
          {detail}
        </Typography>
      )}
      <LicenseChip spdx={spdx} />
    </Box>
  )
}
