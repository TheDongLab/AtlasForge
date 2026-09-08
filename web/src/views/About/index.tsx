// SPDX-FileCopyrightText: 2026 Dong Lab, Yale School of Medicine <https://donglab.org>
//
// SPDX-License-Identifier: Apache-2.0

import { Box, Typography } from "@mui/material"
import { atlas } from "@/config/atlas"
import { monoFontFamily } from "@/theme"
import AboutCredits from "./AboutCredits"
import AboutDataSources from "./AboutDataSources"
import { useAboutState } from "./useAboutState"
import { ABOUT_MAX_WIDTH } from "./constants"

export default function About() {
  const { domains, sources, studies } = useAboutState()

  return (
    <Box sx={{ minHeight: "100%", display: "flex", justifyContent: "center" }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: ABOUT_MAX_WIDTH,
          display: "flex",
          flexDirection: "column",
          gap: { xs: 3, sm: 4 },
          pt: { xs: 3, sm: 5 },
          pb: 6,
        }}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ color: "secondary.main", fontWeight: 700, letterSpacing: 0.5 }}
          >
            About
          </Typography>
          <Typography
            component="h1"
            sx={{
              color: "primary.main",
              fontFamily: monoFontFamily,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              fontSize: { xs: "1.9rem", sm: "2.4rem" },
            }}
          >
            {atlas.name}
          </Typography>
          {atlas.description && (
            <Typography variant="h6" color="text.secondary" sx={{ mt: 1, fontWeight: 400 }}>
              {atlas.description}
            </Typography>
          )}
        </Box>
        <AboutCredits />
        <AboutDataSources domains={domains} sources={sources} studies={studies} />
      </Box>
    </Box>
  )
}
