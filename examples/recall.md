# Rune in Recall Documents

Recall is a COBOL-inspired publishing language where documents have
IDENTIFICATION, DATA, and PROCEDURE divisions. Rune maps naturally —
`?` annotates divisions with intent, `@` marks computed content,
`~` marks editable fields, `!` marks explicit publish and export actions.

## Document Lifecycle

```
@document.title      ?"generated from IDENTIFICATION DIVISION — do not edit directly"
@document.author
@toc                 ?"computed from SECTION headings — regenerated on !compile"
@word-count          ?"live count — display only"

~document.status     ?"draft | review | published — controls distribution visibility"
~effective-date      ?"required before !publish — compliance checkpoint"
~audience            ?"internal | external | restricted — gates !export-pdf"

!compile             ?"renders all @ bindings, validates all ~ fields, rebuilds @toc"
!publish             ?"posts to distribution list in RECIPIENTS DIVISION — irreversible"
!export-pdf          ?"generates archival copy — stored to vault on execution"
!retract             ?"requires ~retraction-reason — notifies all recipients"

?"this document governed by editorial policy EP-2024-003"
?"all published versions are immutable — corrections require new document via !publish"
```

## Case Study Document

```
@case.id             ?"system-assigned — UC-XXX format"
@case.title
@case.published-at

~case.drift-score    ?"0–100 — adjusted per methodology v4.1, not manually set above 90"
~case.window-close   ?"ISO date — triggers prognostic review workflow on !close-window"
~case.status         ?"open | narrowing | resolved | invalidated"

!publish-case        ?"deploys to KV store — visible at /uc-XXX immediately"
!close-window        ?"sets @case.closed-at, triggers review, immutable after"
!add-trigger         ?"appends to trigger list — requires ~trigger-description"

?"6D methodology — all drift scores follow bounded scoring rules"
?"case closure is irreversible — contact editorial if in error"
```

## Why Rune Fits Recall

- `!` maps directly to PROCEDURE DIVISION operations — explicit, named, auditable
- `?` gives every DATA DIVISION field the rationale that COBOL comments never preserved
- `@` makes computed fields (TOC, word count, case ID) structurally non-writable
- `~` makes editable fields (status, dates, scores) enumerable and governable
