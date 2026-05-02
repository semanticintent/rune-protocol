# Rune Across Industries

Every industry that manages state, collects input, triggers behavior, and needs to record intent can host Rune. The four runes map to universal operations — the element vocabulary changes, the protocol does not.

---

## Financial Services

Trading systems, compliance dashboards, risk tools — every one needs to display live data, accept analyst input, trigger orders, and record the rationale behind decisions.

The `?` rune is particularly significant here. Regulators require proof of intent. When a risk threshold is set, the regulator does not just want to know the value — they want to know why. Today that rationale lives in a meeting note, a separate document, or someone's memory. With Rune it lives in the binding.

```
@market-price                      ← live feed, display only, no side effects
@position.pnl                      ← real-time P&L display

~risk-threshold ?"approved by risk committee Q1-2025, review at quarter end"
~stop-loss ?"maximum drawdown per desk policy v2.3 — do not modify without DBA"

!submit-order                      ← explicit, auditable, nothing implicit
!escalate-breach with desk.id      ← triggered by analyst, logged

?"this screen is for institutional orders only — notional > $1M"
```

The `!` rune enforces the principle that **nothing happens without intent**. No implicit order submission, no silent state mutation. Every trade trigger is explicit and auditable by design.

---

## Healthcare / Clinical Documentation

Clinical systems need to bind patient data, accept clinician input, trigger care protocols, and annotate clinical reasoning — all with audit trails.

```
@patient.vitals                    ← read from EHR, display only
@patient.allergies                 ← display, never editable on this screen

~diagnosis ?"ICD-10 required — confirm with attending before saving"
~medication-dose ?"weight-adjusted, see formulary v4.1 for range"

!order-medication with patient.id  ← explicit clinical action, logged to EMR
!flag-for-review                   ← triggers attending notification

?"post-operative day 2 context — normal ranges differ from admission baseline"
```

The separation between `@` (observe, no side effects) and `~` (edit, two-way sync) is clinically meaningful. A vital sign display should never be editable. A diagnosis field must be. Rune makes this distinction architectural, not just conventional.

The `?` annotations here are clinical reasoning — the kind of context that gets lost between shift handovers and that AI summarisation tools need to understand patient state accurately.

---

## Legal / Contract Systems

Contract templates bind to party data, present editable clauses, trigger signature events, and carry the legal intent behind every provision.

```
@party.registered-name             ← pulled from entity registry, immutable
@effective-date                    ← calculated, display only

~governing-law ?"default: English law — adjust for APAC jurisdiction per annexe B"
~liability-cap ?"negotiate per deal — standard is 12 months fees, not unlimited"

!countersign with party.id         ← signature event, irrevocable, timestamped
!request-amendment                 ← formal amendment workflow trigger

?"standard SaaS MSA v4.2 — last reviewed by legal 2024-Q3"
```

Every `!` in a contract is a legal event. Rune makes this explicit — there is no way to accidentally trigger a signature. The `?` annotations are the lawyer's notes that survive the PDF, the print, the scan, and the filing cabinet.

---

## Manufacturing / IoT

Control panels and SCADA interfaces display sensor readings, expose operator controls, trigger alarms and procedures, and document the rationale behind setpoints.

```
@sensor.temperature                ← live reading, display only
@production-rate                   ← calculated throughput

~setpoint ?"ISO 9001 §4.3 — approved range 18–22°C, signed off by QA"
~batch-size ?"minimum 500 units per run — economic order quantity"

!trigger-alarm with zone.id        ← operator action, logged to SCADA
!initiate-shutdown                 ← explicit, requires confirmation step

?"ambient temperature in packaging zone — not process zone, different tolerances"
```

The `?` annotation on the setpoint is the difference between a maintenance engineer knowing why it is what it is and spending three hours hunting through change logs.

---

## DevOps / Infrastructure-as-Code

Configuration files and deployment manifests need to read from environments, expose tunable values, trigger deployment actions, and document why decisions were made.

```yaml
# rune-annotated configuration

database_url: @env.DATABASE_URL       # read from environment
replica_count: ~scaling.replicas      # ?"scale event approval required above 10 — see runbook"
feature_flag: ~rollout.percentage     # ?"canary: increment by 10% per day max"

on_deploy: !run-migrations            # explicit — not automatic
on_rollback: !restore-snapshot        # explicit — operator must invoke

# ?"this service is stateful — do not autoscale without DBA sign-off"
# ?"reviewed by security team 2025-01-15 — no changes required"
```

Config files are full of decisions with lost rationale. Why is `replica_count` 3? Why is that feature flag at 40%? Why does this service not autoscale? With Rune `?` annotations, the rationale is in the file. It's in version control. It travels with the config.

---

## Education / Adaptive Learning

Course content that binds to learner state, adjusts to learner behaviour, triggers assessments, and carries the pedagogical intent behind every design decision.

```
@learner.progress                  ← display completion, read only
@module.difficulty                 ← current difficulty level

~learning-style ?"default: visual — adapt based on interaction patterns"
~pace-setting ?"learner-controlled — do not override without consent"

!submit-assessment with module.id  ← explicit submission, no auto-submit
!request-hint                      ← learner-invoked, logged for analytics

?"this module scaffolds abstract → concrete — do not reorder sections"
```

The `?` annotations here carry the instructional design rationale. When an AI tutor generates adaptive content for this module, it reads the intent and knows not to reorder the sections — even if reordering might seem to optimise for a learner's immediate preferences.

---

## Publishing / Long-Form Documents

Documents that bind to data sources, expose reader-configurable settings, trigger interactive elements, and carry the editorial intent behind structural decisions.

```
@report.published-date             ← display, read only
@author.name                       ← pulled from byline registry

~reading-level ?"default: standard — reader may adjust, affects vocabulary"
~currency-display ?"USD default — localise for reader geography"

!expand-methodology                ← reader-invoked detail expansion
!download-dataset                  ← explicit data access, logged

?"executive summary — 3-minute read, omit technical appendix for this audience"
```

When an AI generates a version of this document for a different audience, the `?` annotations tell it what matters: this is a 3-minute read, this audience doesn't need the technical appendix.

---

## The Pattern Across All Domains

Every example above follows the same structure:

1. **`@` bindings** are live data, feeds, or computed values — display only, no side effects
2. **`~` bindings** are the analyst's, clinician's, lawyer's, or operator's working surface — explicitly editable
3. **`!` bindings** are consequential actions — orders, signatures, alarms — explicit and auditable
4. **`?` annotations** are the rationale — the decision behind the value, the context for the AI, the note for the next person

The element vocabulary changes entirely between a trading screen, a clinical form, a contract, and a config file. The four runes do not change. That stability is the protocol.
