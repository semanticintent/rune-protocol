# Rune in Clinical Systems

Healthcare has the most demanding requirements for explicit, auditable bindings.
The `!` invariant — nothing consequential happens without explicit invocation —
maps directly to the clinical requirement that every intervention is intentional
and logged. The `?` primitive carries the regulatory rationale that paper-based
systems put in policy manuals that nobody reads at point of care.

## Patient Record

```
@patient.name
@patient.dob
@patient.mrn        ?"medical record number — system-assigned, immutable after creation"
@patient.allergies  ?"read from confirmed allergy list — update via !confirm-allergies only"

@vitals.bp          ?"latest reading from monitoring system — not manually entered"
@vitals.hr
@vitals.spo2        ?"peripheral oxygen saturation — alert threshold 94% in !check-vitals"

~diagnosis          ?"ICD-10 required — validated against formulary on !prescribe"
~care-plan          ?"editable by attending only — version-stamped on each save"
~discharge-summary  ?"required before !discharge — auto-populated from ~diagnosis and ~care-plan"
```

## Clinical Actions

```
!prescribe          ?"triggers drug interaction check — logged to medication administration record"
!confirm-allergies  ?"clinician attestation — creates auditable record with timestamp and session"
!order-lab          ?"explicit — no automatic orders on field change, requires ~diagnosis"
!discharge          ?"requires completed ~discharge-summary — notifies care coordinator and GP"
!escalate           ?"triggers rapid response team — logged to incident record"

?"all ! actions require authenticated clinician session — session token validated on dispatch"
?"this record is governed by HIPAA — access logged, export requires patient authorization"
?"medication changes logged to MAR automatically — Rune ! guarantees explicitness"
```

## Medication Administration

```
@medication.name
@medication.dose     ?"weight-based calculation — do not override without attending sign-off"
@medication.route
@medication.schedule ?"derived from !prescribe parameters — read-only at administration"

~administered-by    ?"nurse ID — required for !administer"
~administered-at    ?"defaults to now() — adjustable within ±15 min for documentation lag"
~refused            ?"patient refusal — requires ~refusal-reason before !document-refusal"

!administer         ?"scans barcode, validates ~administered-by, logs to MAR — five rights enforced"
!hold               ?"suspends schedule — requires ~hold-reason, notifies prescribing clinician"
!document-refusal   ?"records patient refusal — requires ~refusal-reason, logged to MAR"

?"five rights enforced on !administer: right patient, drug, dose, route, time"
```

## Why Rune Fits Healthcare

- `!` makes every clinical intervention explicit — no implicit side effects from reading or editing fields
- `~` makes every editable clinical parameter enumerable — auditors can query all mutable fields
- `@` makes feed-driven vitals and system-assigned identifiers structurally non-writable
- `?` keeps the regulatory rationale co-located with the binding — survives system migrations and EHR changes
