# SPDX-FileCopyrightText: 2026 Dong Lab, Yale School of Medicine <https://donglab.org>
#
# SPDX-License-Identifier: Apache-2.0

"""Record provenance for datasets created by the fetch pipeline."""

from datetime import date
from pathlib import Path

import polars as pl

from ..lib import console
from ..lib.paths import PipelinePaths
from .plan import FetchOptions

HEADER = (
    "domain",
    "source",
    "version",
    "assembly",
    "retrieved_date",
    "license_spdx",
    "citation",
    "citation_url",
    "url",
)

ENSEMBL_URL = "https://www.ensembl.org"
COMPARA_URL = "https://www.ensembl.org/info/genome/compara"
HGNC_URL = "https://www.genenames.org"
NCBI_GENE_URL = "https://www.ncbi.nlm.nih.gov/gene"
GTEX_URL = "https://gtexportal.org/home/downloads/adult-gtex/bulk_tissue_expression"

ENSEMBL_CITE = (
    "Yates et al. Nucleic Acids Res 54:D1053 (2026)",
    "https://doi.org/10.1093/nar/gkaf1239",
)
HGNC_CITE = (
    "Seal et al. Nucleic Acids Res 54:D1098 (2026)",
    "https://doi.org/10.1093/nar/gkaf1229",
)
NCBI_GENE_CITE = (
    "Brown et al. Nucleic Acids Res 43:D36 (2015)",
    "https://doi.org/10.1093/nar/gku1055",
)
GTEX_CITE = (
    "The GTEx Consortium. Science 369:1318 (2020)",
    "https://doi.org/10.1126/science.aaz1776",
)

# name, license_spdx, url, citation, citation_url
STRUCTURE_SOURCES = [
    (
        "AlphaFold DB",
        "CC-BY-4.0",
        "https://alphafold.ebi.ac.uk",
        "Varadi et al. Nucleic Acids Res 52:D368 (2024); Jumper et al. Nature 596:583 (2021)",
        "https://doi.org/10.1093/nar/gkad1011",
    ),
    (
        "UniProt",
        "CC-BY-4.0",
        "https://www.uniprot.org",
        "The UniProt Consortium. Nucleic Acids Res 53:D609 (2025)",
        "https://doi.org/10.1093/nar/gkae1010",
    ),
    (
        "PDBe (via 3D-Beacons)",
        "CC0-1.0",
        "https://www.ebi.ac.uk/pdbe/pdbe-kb/3dbeacons",
        "Varadi et al. GigaScience 11:giac118 (2022)",
        "https://doi.org/10.1093/gigascience/giac118",
    ),
]

# name, url, citation, citation_url
TREE_SOURCES = {
    "ensembl_compara": (
        "Ensembl Compara",
        COMPARA_URL,
        "Herrero et al. Database 2016:bav096",
        "https://doi.org/10.1093/database/bav096",
    ),
    "ncbi": (
        "NCBI Taxonomy",
        "https://www.ncbi.nlm.nih.gov/taxonomy",
        "Schoch et al. Database 2020:baaa062",
        "https://doi.org/10.1093/database/baaa062",
    ),
    "timetree": (
        "TimeTree",
        "http://www.timetree.org",
        "Kumar et al. Mol Biol Evol 39:msac174 (2022)",
        "https://doi.org/10.1093/molbev/msac174",
    ),
    "ucsc": (
        "UCSC",
        "https://genome.ucsc.edu",
        "Casper et al. Nucleic Acids Res 54:D1331 (2026)",
        "https://doi.org/10.1093/nar/gkaf1250",
    ),
}


def _assembly(browser_dir: Path) -> str:
    path = browser_dir / "gene_models.tsv"
    if not path.exists():
        return ""
    df = pl.read_csv(path, separator="\t")
    if "assembly" in df.columns and df.height:
        return df["assembly"][0] or ""
    return ""


def _afdb_version(structure_dir: Path) -> str:
    path = structure_dir / "structures.tsv"
    if not path.exists():
        return ""
    df = pl.read_csv(path, separator="\t", infer_schema_length=10000)
    if "afdb_version" not in df.columns:
        return ""
    values = df["afdb_version"].drop_nulls().unique().to_list()
    return f"v{values[0]}" if len(values) == 1 else ""


def _rows(options: FetchOptions, paths: PipelinePaths) -> list[tuple[str, ...]]:
    source = paths.source
    today = date.today().isoformat()
    assembly = _assembly(paths.browser_source)
    rows = [
        (
            "genes",
            "Ensembl",
            str(options.ensembl_release),
            assembly,
            today,
            "",
            *ENSEMBL_CITE,
            ENSEMBL_URL,
        ),
        ("genes", "HGNC", "", "", today, "", *HGNC_CITE, HGNC_URL),
        ("genes", "NCBI Gene", "", "", today, "", *NCBI_GENE_CITE, NCBI_GENE_URL),
    ]
    # Record GTEx only when the pipeline fetched the expression matrix
    if (source / "expression.parquet").exists() and options.gtex_file is None:
        version = f"{options.gtex_version} · gene TPM"
        rows.append(("expression", "GTEx", version, "", today, "", *GTEX_CITE, GTEX_URL))
    if (source / "orthologs.tsv").exists():
        name, url, citation, citation_url = TREE_SOURCES["ensembl_compara"]
        rows.append(("conservation", name, "", "", today, "", citation, citation_url, url))
    tree = TREE_SOURCES.get(options.tree_source)
    if (source / "species_tree.nwk").exists() and options.tree_source != "ensembl_compara" and tree:
        name, url, citation, citation_url = tree
        rows.append(("conservation", name, "", "", today, "", citation, citation_url, url))
    if (paths.structure_source / "uniprot_map.tsv").exists():
        afdb = _afdb_version(paths.structure_source)
        for name, license_spdx, url, citation, citation_url in STRUCTURE_SOURCES:
            version = afdb if name == "AlphaFold DB" else ""
            rows.append(
                ("structure", name, version, "", today, license_spdx, citation, citation_url, url)
            )
    return rows


def run(options: FetchOptions, paths: PipelinePaths) -> None:
    rows = _rows(options, paths)
    lines = ["\t".join(HEADER)] + ["\t".join(row) for row in rows]
    path = paths.source / "sources.tsv"
    path.parent.mkdir(parents=True, exist_ok=True)
    partial = path.with_name(f".{path.name}.partial")
    partial.write_text("\n".join(lines) + "\n", encoding="utf-8")
    partial.replace(path)
    console.detail(f"Recorded {len(rows)} data sources -> {path}")
