// SPDX-FileCopyrightText: 2026 Dong Lab, Yale School of Medicine <https://donglab.org>
//
// SPDX-License-Identifier: Apache-2.0

import { Box, Link, Paper, Typography, useTheme } from "@mui/material"
import { DEVELOPER, DONG_LAB, LICENSE, PRODUCT_NAME, PRODUCT_URL } from "@/config/product"
import { ABOUT_CARD_PADDING, DONG_LAB_LOGO_MAX_WIDTH, DONG_LAB_LOGO_WIDTH } from "./constants"

export default function AboutCredits() {
  const mode = useTheme().palette.mode

  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: ABOUT_CARD_PADDING,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          gap: 2,
        }}
      >
        <Link
          href={DONG_LAB.url}
          target="_blank"
          rel="noreferrer"
          sx={{
            display: "flex",
            flexShrink: 0,
            width: { xs: "100%", sm: DONG_LAB_LOGO_WIDTH },
            maxWidth: DONG_LAB_LOGO_MAX_WIDTH,
          }}
        >
          <Box
            component="img"
            src={DONG_LAB.logo[mode]}
            alt={`${DONG_LAB.name} logo`}
            sx={{ display: "block", width: "100%", height: "auto" }}
          />
        </Link>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ flex: 1, minWidth: 0, lineHeight: 1.55 }}
        >
          This atlas was generated using{" "}
          <Link href={PRODUCT_URL} target="_blank" rel="noreferrer">
            {PRODUCT_NAME}
          </Link>
          , an open-source system that generates an interactive web atlas for any gene family.{" "}
          {PRODUCT_NAME} was developed by {DEVELOPER} in the{" "}
          <Link href={DONG_LAB.url} target="_blank" rel="noreferrer">
            {DONG_LAB.name}
          </Link>{" "}
          at the {DONG_LAB.center} at {DONG_LAB.institution}, and is released under the{" "}
          <Link href={LICENSE.url} target="_blank" rel="noreferrer">
            {LICENSE.spdx}
          </Link>{" "}
          license.
        </Typography>
      </Box>
    </Paper>
  )
}
