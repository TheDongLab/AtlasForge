// SPDX-FileCopyrightText: 2026 Dong Lab, Yale School of Medicine <https://donglab.org>
//
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo, useState } from "react"
import SearchIcon from "@mui/icons-material/Search"
import { Autocomplete, InputAdornment, TextField } from "@mui/material"
import { debounce } from "@mui/material/utils"
import type { Gene } from "@/types/gene"
import { useUIStore } from "@/store/uiStore"
import { renderTwoLineOption } from "@/components/autocomplete/renderTwoLineOption"
import { acInputSx, StyledPopper } from "@/components/autocomplete/styles"
import { VirtualListbox } from "@/components/autocomplete/VirtualListbox"
import { buildGeneIndex, searchGeneIndex } from "@/utils/geneSearch"

interface SearchBarProps {
  genes: Gene[]
  // Only needed by views that filter their own content by the query text
  value?: string
  onChange?: (value: string) => void
  onSelect?: (geneId: string) => void
  width?: number | string
}

export default function GeneSearchBar({
  genes,
  value = "",
  onChange = () => {},
  onSelect,
  width = 360,
}: SearchBarProps) {
  const setSelectedGeneId = useUIStore((s) => s.setSelectedGeneId)
  const selectGene = onSelect ?? setSelectedGeneId
  const [inputValue, setInputValue] = useState(value)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)

  const index = useMemo(() => buildGeneIndex(genes), [genes])

  const debouncedOnChange = useMemo(() => debounce(onChange, 150), [onChange])

  const options = useMemo(() => {
    // Show all options when reopening an unchanged selection
    const showAll = selectedSymbol !== null && inputValue === selectedSymbol
    if (showAll || !inputValue.trim()) return genes.slice(0, 100)
    return searchGeneIndex(index, inputValue).slice(0, 200)
  }, [inputValue, index, genes, selectedSymbol])

  const handleInputChange = useCallback(
    (_event: React.SyntheticEvent, newInput: string, reason: string) => {
      setInputValue(newInput)
      setSelectedGeneId(null)
      if (reason === "input") setSelectedSymbol(null)
      if (!newInput) {
        debouncedOnChange.clear()
        onChange("")
      } else {
        debouncedOnChange(newInput)
      }
    },
    [onChange, debouncedOnChange, setSelectedGeneId],
  )

  const handleChange = useCallback(
    (_event: React.SyntheticEvent, newValue: Gene | string | null) => {
      if (newValue && typeof newValue !== "string") {
        selectGene(newValue.id)
        setSelectedSymbol(newValue.symbol)
        setInputValue(newValue.symbol)
        onChange(newValue.symbol)
      } else if (newValue === null) {
        setSelectedSymbol(null)
        onChange("")
      }
    },
    [onChange, selectGene],
  )

  return (
    <Autocomplete<Gene, false, false, true>
      freeSolo
      size="small"
      sx={{ width, "& .MuiAutocomplete-clearIndicator": { color: "text.secondary" } }}
      disableListWrap
      options={options}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      getOptionLabel={(option) => (typeof option === "string" ? option : option.symbol)}
      filterOptions={(x) => x}
      slots={{ listbox: VirtualListbox, popper: StyledPopper }}
      renderOption={(props, option) => renderTwoLineOption(props, option.symbol, option.name)}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder="Search Ensembl ID, symbol, name, or family…"
          color="primary"
          sx={acInputSx}
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start" sx={{ ml: 0.75, mr: 0 }}>
                    <SearchIcon sx={{ fontSize: 16 }} color="primary" />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  )
}
