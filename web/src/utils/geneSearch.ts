// SPDX-FileCopyrightText: 2026 Dong Lab, Yale School of Medicine <https://donglab.org>
//
// SPDX-License-Identifier: Apache-2.0

export interface GeneSearchable {
  id: string
  symbol: string
  name: string
  alias: string | null
}

interface IndexedGene<T> {
  item: T
  symbol: string
  id: string
  name: string
  alias: string
}

export function buildGeneIndex<T extends GeneSearchable>(genes: T[]): IndexedGene<T>[] {
  return genes.map((g) => ({
    item: g,
    symbol: g.symbol.toLowerCase(),
    id: g.id.toLowerCase(),
    name: g.name.toLowerCase(),
    alias: (g.alias ?? "").toLowerCase(),
  }))
}

export function searchGeneIndex<T>(index: IndexedGene<T>[], query: string): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return index.map((i) => i.item)
  return index
    .filter(
      (i) => i.symbol.includes(q) || i.id.includes(q) || i.name.includes(q) || i.alias.includes(q),
    )
    .sort((a, b) => {
      const aExact = a.symbol === q
      const bExact = b.symbol === q
      if (aExact !== bExact) return aExact ? -1 : 1
      const aPrefix = a.symbol.startsWith(q)
      const bPrefix = b.symbol.startsWith(q)
      if (aPrefix !== bPrefix) return aPrefix ? -1 : 1
      return a.symbol.localeCompare(b.symbol, undefined, { numeric: true })
    })
    .map((i) => i.item)
}
