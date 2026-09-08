// SPDX-FileCopyrightText: 2026 Dong Lab, Yale School of Medicine <https://donglab.org>
//
// SPDX-License-Identifier: Apache-2.0

import { Link as RouterLink, useLocation } from "react-router-dom"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { IconButton, Tooltip } from "@mui/material"

export default function AppInfoButton() {
  const active = useLocation().pathname === "/about"

  return (
    <Tooltip title="About">
      <IconButton
        component={RouterLink}
        to="/about"
        size="small"
        color={active ? "secondary" : "inherit"}
        aria-label="About"
      >
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  )
}
