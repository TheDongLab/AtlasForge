// SPDX-FileCopyrightText: 2026 Dong Lab, Yale School of Medicine <https://donglab.org>
//
// SPDX-License-Identifier: Apache-2.0

import { Box, Link, Paper, Typography } from "@mui/material"
import { monoFontFamily } from "@/theme"
import { SourceEntry, sourceDetail } from "./SourceEntry"
import {
  ABOUT_CARD_PADDING,
  SOURCE_CARD_MIN_WIDTH,
  SOURCE_CARD_PT,
  SOURCE_CARD_PB,
} from "./constants"
import type { DataDomain } from "@/config/methodology"
import type { DataSourceRecord } from "@/types/structure"
import type { GwasStudy } from "@/types/browser"

function DomainCard({
  domain,
  records,
  gwas,
}: {
  domain: DataDomain
  records: DataSourceRecord[]
  gwas: GwasStudy[]
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        px: ABOUT_CARD_PADDING,
        pt: SOURCE_CARD_PT,
        pb: SOURCE_CARD_PB,
      }}
    >
      <Typography
        variant="overline"
        sx={{ color: "secondary.main", fontWeight: 700, lineHeight: 1.6, letterSpacing: 0.5 }}
      >
        {domain.label}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: "block", mt: 0.25, lineHeight: 1.45 }}
      >
        {domain.method}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", mt: 0.25 }}>
        {records.map((rec) => (
          <Box key={`${rec.source}-${rec.url}`} sx={{ py: 0.25 }}>
            <SourceEntry
              name={rec.source}
              detail={sourceDetail(rec)}
              spdx={rec.license_spdx}
              url={rec.url}
            />
            {rec.citation && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: -0.25 }}
              >
                {rec.citation_url ? (
                  <Link
                    href={rec.citation_url}
                    target="_blank"
                    rel="noreferrer"
                    color="inherit"
                    underline="hover"
                    sx={{ fontWeight: "inherit" }}
                  >
                    {rec.citation}
                  </Link>
                ) : (
                  rec.citation
                )}
              </Typography>
            )}
          </Box>
        ))}
        {gwas.map((study) => (
          <Box key={study.study_id} sx={{ py: 0.25 }}>
            <SourceEntry name={study.trait} detail="" spdx={study.license_spdx} url={null} />
            {study.citation && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: -0.25 }}
              >
                {study.citation}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  )
}

export default function AboutDataSources({
  domains,
  sources,
  studies,
}: {
  domains: DataDomain[]
  sources: DataSourceRecord[]
  studies: GwasStudy[]
}) {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        component="h2"
        sx={{
          color: "secondary.main",
          fontFamily: monoFontFamily,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          fontSize: { xs: "1.15rem", sm: "1.35rem" },
          mb: 1.5,
        }}
      >
        Data sources and methods
      </Typography>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: `repeat(auto-fill, minmax(${SOURCE_CARD_MIN_WIDTH}px, 1fr))`,
        }}
      >
        {domains.map((domain) => (
          <DomainCard
            key={domain.key}
            domain={domain}
            records={sources.filter((s) => s.domain === domain.key)}
            gwas={domain.key === "browser" ? studies : []}
          />
        ))}
      </Box>
    </Box>
  )
}
