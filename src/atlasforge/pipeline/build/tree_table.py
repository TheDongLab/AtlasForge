# SPDX-FileCopyrightText: 2026 Dong Lab, Yale School of Medicine <https://donglab.org>
#
# SPDX-License-Identifier: Apache-2.0

"""Write a clustering out as the table of nodes that clustering.parquet holds.

There is one row per node, giving the method, the id of the node, the id of its parent,
the length of the branch to it, and the gene it stands for. Storing it this way lets the
API return a tree without the frontend having to parse Newick. A node that is not a leaf
has no gene, and the root has no parent. Each of the builders here also returns the same
tree as Newick, which is useful for looking at directly.
"""

import sys

import polars as pl

CLUSTERING_SCHEMA = {
    "method": pl.Utf8,
    "node_id": pl.Int64,
    "parent_id": pl.Int64,
    "branch_length": pl.Float64,
    "gene_id": pl.Utf8,
    "symbol": pl.Utf8,
    "family": pl.Utf8,
}


def tree_rows(
    labels: list[str], dist, meta: dict[str, dict], method: str
) -> tuple[list[dict], str]:
    """Build the tree by average linkage, putting the larger of the two subtrees first at
    every split.

    Ordering the splits this way round, rather than the usual smaller subtree first, keeps
    the branches near the root of the tree together and brings the crowded parts of it to
    the top of the table. The nodes are numbered in the order the finished tree is walked,
    so two siblings stay in the same order however the frontend reads the table.
    """
    from scipy.cluster.hierarchy import linkage, to_tree
    from scipy.spatial.distance import squareform

    sys.setrecursionlimit(10000)

    z = linkage(squareform(dist, checks=False), method="average")
    root = to_tree(z)

    rows: list[dict] = []
    next_id = 0

    def visit(node, parent_id: int | None, parent_dist: float) -> str:
        nonlocal next_id
        node_id = next_id
        next_id += 1
        bl = max(0.0, parent_dist - node.dist) if parent_id is not None else 0.0
        if node.is_leaf():
            gid = labels[node.id]
            m = meta.get(gid, {})
            rows.append(
                {
                    "method": method,
                    "node_id": node_id,
                    "parent_id": parent_id,
                    "branch_length": bl,
                    "gene_id": gid,
                    "symbol": m.get("symbol"),
                    "family": m.get("family"),
                }
            )
            return f"{gid}:{bl:.5f}"
        rows.append(
            {
                "method": method,
                "node_id": node_id,
                "parent_id": parent_id,
                "branch_length": bl,
                "gene_id": None,
                "symbol": None,
                "family": None,
            }
        )
        kids = sorted([node.get_left(), node.get_right()], key=lambda c: c.count)[::-1]
        parts = [visit(c, node_id, node.dist) for c in kids]
        return f"({','.join(parts)}):{bl:.5f}"

    newick = visit(root, None, 0.0) + ";"
    return rows, newick
