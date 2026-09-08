// SPDX-FileCopyrightText: 2026 Dong Lab, Yale School of Medicine <https://donglab.org>
//
// SPDX-License-Identifier: Apache-2.0

import { styled } from "@mui/material/styles"
import { capBoxSx } from "@/theme"

const OPEN_IN_NEW_PATH =
  "M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3z"

const Anchor = styled("a")(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "3px 6px",
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.primary.main,
  fontSize: "0.8125rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.02em",
  lineHeight: 1.75,
  textDecoration: "none",
  whiteSpace: "nowrap",
  "&:hover": { backgroundColor: theme.palette.action.hover, textDecoration: "underline" },
  "& svg": { width: 16, height: 16, fill: "currentColor" },
  "& > span": capBoxSx,
}))

interface Props {
  href: string
  children: React.ReactNode
}

export default function ExternalLink({ href, children }: Props) {
  return (
    <Anchor href={href} target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d={OPEN_IN_NEW_PATH} />
      </svg>
      <span>{children}</span>
    </Anchor>
  )
}
