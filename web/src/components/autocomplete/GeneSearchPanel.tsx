// SPDX-FileCopyrightText: 2026 Dong Lab, Yale School of Medicine <https://donglab.org>
//
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from "react"
import { Autocomplete, TextField } from "@mui/material"
import type { GeneSearchable } from "@/utils/geneSearch"
import { buildGeneIndex, searchGeneIndex } from "@/utils/geneSearch"
import { renderTwoLineOption } from "./renderTwoLineOption"
import { StyledPopper, acIndicatorSx, acInputSx } from "./styles"
import { VirtualListboxPanel } from "./VirtualListbox"

export type GeneOption = GeneSearchable

export interface FamilyOption {
  family: string
  family_name: string
}

interface Props {
  families: FamilyOption[]
  genes: GeneOption[]
  familyFilter: string | null
  onFamilyChange: (family: string | null) => void
  selectedGeneId: string | null
  onGeneChange: (gene: GeneOption | null) => void
}

export default function GeneSearchPanel({
  families,
  genes,
  familyFilter,
  onFamilyChange,
  selectedGeneId,
  onGeneChange,
}: Props) {
  const geneIndex = useMemo(() => buildGeneIndex(genes), [genes])
  return (
    <>
      <Autocomplete<FamilyOption>
        size="small"
        options={families}
        getOptionLabel={(o) => o.family}
        isOptionEqualToValue={(o, v) => o.family === v.family}
        value={families.find((f) => f.family === familyFilter) ?? null}
        onChange={(_, v) => onFamilyChange(v?.family ?? null)}
        filterOptions={(opts, { inputValue }) => {
          const q = inputValue.trim().toLowerCase()
          if (!q) return opts
          return opts.filter(
            (o) => o.family.toLowerCase().includes(q) || o.family_name.toLowerCase().includes(q),
          )
        }}
        sx={{ width: "100%", ...acIndicatorSx }}
        slots={{ listbox: VirtualListboxPanel, popper: StyledPopper }}
        renderOption={(props, o) => renderTwoLineOption(props, o.family, o.family_name)}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder="Family…"
            color="primary"
            sx={acInputSx}
          />
        )}
      />
      <Autocomplete
        size="small"
        options={genes}
        getOptionLabel={(o) => o.symbol}
        isOptionEqualToValue={(o, v) => o.id === v.id}
        value={genes.find((g) => g.id === selectedGeneId) ?? null}
        onChange={(_, v) => onGeneChange(v)}
        filterOptions={(_, state) => searchGeneIndex(geneIndex, state.inputValue)}
        sx={{ width: "100%", ...acIndicatorSx }}
        slots={{ listbox: VirtualListboxPanel, popper: StyledPopper }}
        renderOption={(props, option) => renderTwoLineOption(props, option.symbol, option.name)}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder="Symbol, name, ID, alias…"
            color="primary"
            sx={acInputSx}
          />
        )}
      />
    </>
  )
}
