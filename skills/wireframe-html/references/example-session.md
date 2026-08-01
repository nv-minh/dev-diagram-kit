<!--
REFERENCE for /wireframe-html + /prototype-html — simulated session (atlas-re).
-->

## /wireframe-html

**Command:** `/wireframe-html atlas-re --flow approve-claim`

**Gate:** approved userflow ✓ · reuses ASCII content 1:1.

**L1:**

```
  1 | html-wireframe/approve-claim.html     | create | screens id="s1"…"s4"
  2 | html-wireframe/atlas-re-wireframe.html | create | entry + sidebar TOC
  3 | html-wireframe/atlas-re-wireframe-html-index.md | update
```

**You:** open `atlas-re-wireframe.html` in browser — B&W frames at 1024px width, sidebar jumps between flows.

---

## /prototype-html

**Command:** `/prototype-html atlas-re`

**Gate:** wireframes exist ✓

**Skill:** converts every `Nav → [n]` in wireframe index to working `<a href="#s{n}">` links in one self-contained HTML.

**L1:**

```
  1 | html-design/atlas-re-prototype.html | create | click-through all [1]…[6]
```

**Output report:**

```
✅ Prototype: all nav edges verified (0 broken links) | wireframe index HTML prototype column set
```
