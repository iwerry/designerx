#!/usr/bin/env python3
"""
DesignerX rebrand pass.

Derived from "Impeccable" by Paul Bakaus (Apache-2.0). This script renames the
*brand surface* (skill name, slash commands, launcher, agents, prose) to
DesignerX while preserving the *engine protocol* tokens that the compiled core
engine and the live-mode browser runtime depend on (see PROTECTED below).

Usage:  python3 tools/rebrand.py <repo-root>
Idempotent: running it twice changes nothing the second time.
"""
import os
import re
import sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."

# Files whose bytes must never change (browser runtime protocol, data, binaries).
SKIP_FILE = re.compile(
    r"(live-browser[^/]*\.js|modern-screenshot\.umd\.js|/scripts/data/|/VERSION$|/scripts/impeccable(\.cmd)?$|\.png$|\.jpg$|\.woff2?$)"
)
TEXT_EXT = (".md", ".json", ".yaml", ".yml", ".toml", ".cmd", ".txt", ".mjs", ".js", "")

# Tokens that form the engine / live-mode contract. They are swapped for
# sentinels, the brand pass runs, then they are restored verbatim.
PROTECTED = [
    r"\.impeccable\w*",                       # .impeccable/ state dir, .impeccableVariants
    r"data-impeccable[\w-]*",                 # live-mode DOM protocol
    r"dataset\.impeccable\w+",
    r"__impeccable\w*",
    r"(?:window\.)?__IMPECCABLE\w*",
    r"IMPECCABLE_\w+",                        # env vars read by the engine
    r"impeccable-(?:engine|variants?(?:-start|-end|-count)?|spin|command|css|params|param-values|"
    r"carbonize(?:-start)?|live|probe-?\w*|disable(?:-next-line|-line)?|session|completion|windows-\w+|"
    r"darwin-\w+|linux-\w+)",
    r"impeccable:[a-z]+",
    r"pbakaus/impeccable",
    r"impeccable\.style",
    r"@impeccable/",
    r"impeccable-(?:darwin|linux|windows)-\w+",
]
PROTECT_RE = re.compile("|".join("(?:%s)" % p for p in PROTECTED))


def is_git(dp):
    return re.search(r"(^|/)\.git(/|$)", dp) is not None


def rebrand_text(s: str) -> str:
    saved = []

    def stash(m):
        saved.append(m.group(0))
        return "\x01%d\x02" % (len(saved) - 1)

    s = PROTECT_RE.sub(stash, s)
    s = s.replace("Impeccable", "DesignerX").replace("IMPECCABLE", "DESIGNERX")
    s = s.replace("impeccable", "designerx")
    return re.sub(r"\x01(\d+)\x02", lambda m: saved[int(m.group(1))], s)


def rename_path(name: str) -> str:
    return name.replace("impeccable", "designerx") if "impeccable" in name else name


def main():
    changed = 0
    # 1) content pass
    for dp, dn, fn in os.walk(ROOT):
        if is_git(dp) or "/tools" in dp:
            continue
        for f in fn:
            p = os.path.join(dp, f)
            rel = "/" + os.path.relpath(p, ROOT)
            if SKIP_FILE.search(rel):
                continue
            if not f.endswith(TEXT_EXT) and "." in f:
                continue
            try:
                with open(p, "r", encoding="utf-8") as fh:
                    data = fh.read()
            except (UnicodeDecodeError, OSError):
                continue
            new = rebrand_text(data)
            if new != data:
                with open(p, "w", encoding="utf-8", newline="") as fh:
                    fh.write(new)
                changed += 1
    # 2) path pass (deepest first so parents rename last)
    renamed = 0
    for dp, dn, fn in os.walk(ROOT, topdown=False):
        if is_git(dp):
            continue
        for n in fn + dn:
            nn = rename_path(n)
            if nn != n:
                os.rename(os.path.join(dp, n), os.path.join(dp, nn))
                renamed += 1
    print("content files changed: %d | paths renamed: %d" % (changed, renamed))


if __name__ == "__main__":
    main()
