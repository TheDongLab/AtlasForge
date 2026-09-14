// SPDX-FileCopyrightText: 2026 Dong Lab, Yale School of Medicine <https://donglab.org>
//
// SPDX-License-Identifier: Apache-2.0

// Search for a gene or genomic coordinate

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import SearchIcon from "@mui/icons-material/Search"
import { Autocomplete, InputAdornment, TextField, Typography } from "@mui/material"
import { useGeneById } from "@/api/hooks/useGenes"
import { acInputSx, StyledPopper } from "@/components/autocomplete/styles"
import { VirtualListbox } from "@/components/autocomplete/VirtualListbox"
import type { BrowserGene } from "@/types/browser"
import { buildGeneIndex, searchGeneIndex } from "@/utils/geneSearch"

// Accept common colon, space, hyphen, and en dash coordinate formats
const LOCUS = /^(chr)?([0-9a-z]{1,5})[:\s]+([\d,]+)[-–\s]+([\d,]+)$/i
const POINT = /^(chr)?([0-9a-z]{1,5})[:\s]+([\d,]+)$/i

const INITIAL_OPTIONS = 1000
const QUERY_OPTIONS = 100

export interface Locus {
  chrom: string
  start: number
  end: number
}

const digits = (value: string) => Number(value.replace(/,/g, ""))

// Parse a genomic coordinate from user input.
//
// Input uses one-based inclusive coordinates. The browser uses zero-based, half-open
// coordinates, so only the start changes.
export function parseLocus(text: string, span: number): Locus | null {
  const trimmed = text.trim()
  const range = LOCUS.exec(trimmed)
  if (range) {
    const start = digits(range[3]) - 1
    const end = digits(range[4])
    if (end > start) return { chrom: range[0].split(/[:\s]/)[0], start, end }
  }
  const point = POINT.exec(trimmed)
  if (point) {
    const at = digits(point[3]) - 1
    return { chrom: point[0].split(/[:\s]/)[0], start: at - span / 2, end: at + span / 2 }
  }
  return null
}

interface Props {
  genes: BrowserGene[]
  regionId: string | null
  onSelectGene: (geneId: string) => void
  onClearGene: () => void
  onGoToLocus: (locus: Locus) => void
  width?: number | string
}

export default function LocusSearch({
  genes,
  regionId,
  onSelectGene,
  onClearGene,
  onGoToLocus,
  width = 320,
}: Props) {
  const [text, setText] = useState("")
  // Preserve accepted input so reopening shows the full gene list
  const [committed, setCommitted] = useState<string | null>(null)

  const hadRegion = useRef(regionId)
  useEffect(() => {
    const had = hadRegion.current
    hadRegion.current = regionId
    if (had && !regionId) {
      setText("")
      setCommitted(null)
    }
  }, [regionId])

  const geneById = useGeneById()
  const index = useMemo(
    () =>
      buildGeneIndex(
        genes.map((gene) => {
          const full = geneById.get(gene.gene_id)
          return {
            gene,
            id: gene.gene_id,
            symbol: gene.symbol,
            name: gene.name ?? "",
            alias: full?.alias ?? null,
            category: full?.category ?? null,
            family: full?.family ?? null,
            family_name: full?.family_name ?? null,
          }
        }),
      ),
    [genes, geneById],
  )

  const options = useMemo(() => {
    const showAll = committed !== null && text === committed
    // Preserve source order so family genes appear first
    if (showAll || !text.trim()) return genes.slice(0, INITIAL_OPTIONS)
    return searchGeneIndex(index, text)
      .slice(0, QUERY_OPTIONS)
      .map((entry) => entry.gene)
  }, [text, index, genes, committed])

  const submit = useCallback(
    (raw: string) => {
      const query = raw.trim()
      if (!query) return
      const named = genes.find(
        (gene) =>
          gene.symbol.toLowerCase() === query.toLowerCase() ||
          gene.gene_id.toLowerCase() === query.toLowerCase(),
      )
      if (named) {
        onSelectGene(named.gene_id)
        setText(named.symbol)
        setCommitted(named.symbol)
        return
      }
      const locus = parseLocus(query, 100_000)
      if (locus) {
        onGoToLocus(locus)
        setCommitted(raw)
      }
    },
    [genes, onSelectGene, onGoToLocus],
  )

  return (
    <Autocomplete<BrowserGene, false, false, true>
      freeSolo
      size="small"
      sx={{ width, "& .MuiAutocomplete-clearIndicator": { color: "text.secondary" } }}
      disableListWrap
      options={options}
      inputValue={text}
      onInputChange={(_event, next, reason) => {
        setText(next)
        if (reason === "input") setCommitted(null)
      }}
      onChange={(_event, next) => {
        if (next && typeof next !== "string") {
          onSelectGene(next.gene_id)
          setCommitted(next.symbol)
          setText(next.symbol)
        } else if (next === null) {
          setCommitted(null)
          onClearGene()
        } else if (typeof next === "string") {
          submit(next)
        }
      }}
      getOptionLabel={(option) => (typeof option === "string" ? option : option.symbol)}
      filterOptions={(x) => x}
      slots={{ listbox: VirtualListbox, popper: StyledPopper }}
      renderOption={(props, option) => {
        const { key, ...rest } = props as { key: React.Key } & React.HTMLAttributes<HTMLLIElement>
        return (
          <li
            key={key}
            {...rest}
            style={{
              ...(rest.style as React.CSSProperties | undefined),
              padding: "0 12px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ minWidth: 0, width: "100%" }}>
              <Typography
                component="div"
                variant="body2"
                fontWeight={600}
                noWrap
                sx={{ m: 0, lineHeight: 1.2, fontSize: "0.9rem" }}
              >
                {option.symbol}
              </Typography>
              <Typography
                component="div"
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ m: 0, lineHeight: 1.2, fontSize: "0.8125rem" }}
              >
                {option.name ?? option.chrom}
              </Typography>
            </div>
          </li>
        )
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder="Gene or genomic location"
          color="primary"
          sx={acInputSx}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit(text)
          }}
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
