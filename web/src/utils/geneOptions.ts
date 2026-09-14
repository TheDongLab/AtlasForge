// SPDX-FileCopyrightText: 2026 Dong Lab, Yale School of Medicine <https://donglab.org>
//
// SPDX-License-Identifier: Apache-2.0

import type { FamilyOption, GeneOption } from "@/components/autocomplete/GeneSearchPanel"
import type { Gene } from "@/types/gene"

const byName = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true })

export function uniqueFamilies(
  rows: { family: string | null }[],
  geneById?: Map<string, Gene>,
): FamilyOption[] {
  const names = new Map<string, string>()
  if (geneById) for (const g of geneById.values()) names.set(g.family, g.family_name)
  return [...new Set(rows.filter((r) => r.family).map((r) => r.family as string))]
    .map((family) => ({ family, family_name: names.get(family) ?? family }))
    .sort((a, b) => byName(a.family, b.family))
}

export function uniqueGeneOptions(
  rows: { gene_id: string | null; symbol: string | null }[],
  geneById?: Map<string, Gene>,
): GeneOption[] {
  const seen = new Map<string, string>()
  for (const r of rows)
    if (r.gene_id && r.symbol && !seen.has(r.gene_id)) seen.set(r.gene_id, r.symbol)
  return [...seen.entries()]
    .map(([id, symbol]) => {
      const g = geneById?.get(id)
      return {
        id,
        symbol,
        name: g?.name ?? symbol,
        alias: g?.alias ?? null,
        category: g?.category ?? null,
        family: g?.family ?? null,
        family_name: g?.family_name ?? null,
      }
    })
    .sort((a, b) => byName(a.symbol, b.symbol))
}
