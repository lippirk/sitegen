"""
simple script for generating index.pug (this is mainly a selection of links)
"""
from pathlib import Path
from io import StringIO
from typing import List
import json

ROUTE = "__route"
TITLE = "title"
DATE = "date"
OUT = Path("./index.pug")
OUT_DISS = Path("./edi_diss.pug")

posts = [
    "international-migrant-stock",
    "migrant-stock-monte-carlo",
    "sparing-supermarket-spending",
    "mouse-nft",
    "understanding-projection-matrix",
    "basic-state-space-model",
    "bootstrap-filter",
    "2d-mappings",
    "wordle"
]

def get_markdown_meta(path):
    d = {}
    with open(path, 'r') as f:
        in_meta = False
        for l in f:
            l = l.strip()
            if l == "---":
                if in_meta:
                    break
                else:
                    in_meta = True
                    continue
            kvp = [x.strip() for x in l.split(":")]
            d[kvp[0]] = kvp[1]
    return d


def get_meta(base_path: Path):
    index_md = base_path / "index.md"
    index_pug = base_path / "index.pug"
    if index_md.exists():
        meta = get_markdown_meta(index_md)
        meta[ROUTE] = f"/{str(index_md)}"
    elif index_pug.exists():
        meta_json = base_path / "metadata.json"
        if not meta_json.exists():
            raise Exception(f"found {index_pug}, but {meta_json} is missing")
        meta_json_raw = meta_json.read_text('utf-8')
        meta = json.loads(meta_json_raw)
        meta[ROUTE] = f"/{str(index_pug)}"
    else:
        raise Exception(
            f"post {base_path} must have either an index.md or index.pug, but neither existed")
    return meta

def gen_index_pug(post_metas: List, edi_diss_metas: List):
    buf = StringIO()

    def add(s):
        print(s, file=buf)
    add(f"extends layout.pug")
    add(f"")
    add(f"block content")
    add(f"  h3 Posts")
    add(f"  ul")
    for m in post_metas:
        route = m[ROUTE]
        title = m[TITLE]
        date = m[DATE]
        add(f"    li")
        add(f'      | [<a href="{route}">html</a>] {date} - {title}')
    add(f"")
    add(f"  div(style='display:none;')")
    add(f"    a(href='./edi_diss.pug') edi diss")
    add(f"    h3 MSc Diss/Extreme Value Theory")
    add(f"    ul")
    for m in edi_diss_metas:
           route = m[ROUTE]
           title = m[TITLE]
           date = m[DATE]
           add(f"      li")
           add(f'        | [<a href="{route}">html</a>] {title}')
    return buf.getvalue()

def gen_edi_diss_pug(edi_diss_metas: List):
    buf = StringIO()

    def add(s):
        print(s, file=buf)
    add(f"extends layout.pug")
    add(f"")
    add(f"block content")
    add(f"  h3 MSc Diss/Extreme Value Theory")
    add(f"  ul")
    for m in edi_diss_metas:
           route = m[ROUTE]
           title = m[TITLE]
           date = m[DATE]
           add(f"    li")
           add(f'      | [<a href="{route}">html</a>] {title}')
    return buf.getvalue()

def main():
    post_metas = sorted([get_meta(Path(f"./posts/{p}")) for p in posts],
                        key=lambda x: x["date"],
                        reverse=True)
    edi_diss_metas = sorted([get_meta(p) for p in Path("edi_diss").glob("*") if p.is_dir()],
                             key=lambda x: x["date"],
                             reverse=True)
    OUT.write_text(
        gen_index_pug(post_metas, edi_diss_metas)
    )
    OUT_DISS.write_text(
        gen_edi_diss_pug(edi_diss_metas)
    )


if __name__ == "__main__":
    main()
