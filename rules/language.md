# Language — bilingual EN/VI (auto-mirror input)

> Shared rule for ALL skills. Decides the language of the **OUTPUT**: diagram labels, interview (clarify) questions, L1 plan preview, output report, and prose in generated docs. Every skill references this file in Constraints + References.

## Language selection rules (priority order)

1. **Explicit flag** `--lang en` | `--lang vi` → follow the flag exactly.
2. **Explicit request** in the prompt: "viết bằng tiếng Anh" / "write in English" / "in Vietnamese" / "bằng tiếng Việt" → follow it.
3. **Auto-mirror the input language** (default): whichever language the user mostly writes the description/content in → output in that language. Types in English → output English; Vietnamese → output Vietnamese.
4. **Unclear / mixed / very short input** (e.g. just `/erd --feature x`) → if the source (spec/doc/code) is mostly one language, **follow the source language**; otherwise default to **Vietnamese (VI)**.

**No-flip within a session:** once the language is set (flag/request) → keep it, do not switch midway.
**Update mode (existing file):** follow the **existing file's language** for consistency, unless the user requests a change.

## Scope

The selected language applies to:
- **Labels** in diagrams (node, edge label, block names, business relationships).
- **Interview / clarify questions** when information is missing.
- **L1 plan preview**, **output report**, and **prose** in generated `.md` files (description, notes).

## ALWAYS keep in English (do NOT translate)

- **Engine syntax keywords**: Mermaid (`sequenceDiagram`, `alt`, `stateDiagram-v2`, `flowchart`...), D2 (`shape`, `sql_table`, `style`, `direction`...), PlantUML (`@startuml`, `actor`, `usecase`, `package`, `|Lane|`...), BPMN XML, DBML.
- **Real technical identifiers**: table/column/service/endpoint/env/variable stay AS-IS as in the code/system (do NOT translate `user_id` → `ma_nguoi_dung`). Only the accompanying business label follows the output language.
- **IDs/codes** (FR-xxx, UC-xxx), slug, path.

Unicode labels are fine in every engine — accented Vietnamese renders well in Mermaid/D2/PlantUML/BPMN.

## Typography by language

Per `ba-conventions.md` §4: output **VI** → VN typography ("Mục N", "sang/đến/dẫn tới"); output **EN** → natural English typography (section refs, `→` in prose OK).

## No-fabrication when translating / missing source

- Translate **faithfully**: Vietnamese source with English output (or vice versa) → keep the real figures/names, do NOT fabricate new content in the name of "translation".
- Business term with uncertain translation → on first use write a short bilingual form `Đơn hàng (Order)`, then settle on one form.

## One-line summary

> **Explicit flag/request > mirror input language > default VI. Syntax keywords + real identifiers always English. Do not fabricate when translating.**
