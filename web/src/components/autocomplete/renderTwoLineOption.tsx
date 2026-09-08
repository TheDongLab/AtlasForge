// SPDX-FileCopyrightText: 2026 Dong Lab, Yale School of Medicine <https://donglab.org>
//
// SPDX-License-Identifier: Apache-2.0

import type React from "react"
import { Typography } from "@mui/material"
import { acOptionStyle } from "./styles"

type OptionProps = { key: React.Key } & React.HTMLAttributes<HTMLLIElement>

export function renderTwoLineOption(props: object, primary: string, secondary: string) {
  const { key, ...rest } = props as OptionProps
  return (
    <li
      key={key}
      {...rest}
      style={{ ...(rest.style as React.CSSProperties | undefined), ...acOptionStyle }}
    >
      <div style={{ minWidth: 0, width: "100%" }}>
        <Typography
          noWrap
          component="div"
          variant="body2"
          fontWeight={600}
          sx={{ m: 0, lineHeight: 1.2, fontSize: "0.9rem" }}
        >
          {primary}
        </Typography>
        <Typography
          noWrap
          component="div"
          variant="caption"
          color="text.secondary"
          sx={{ m: 0, lineHeight: 1.2, fontSize: "0.8125rem" }}
        >
          {secondary}
        </Typography>
      </div>
    </li>
  )
}
