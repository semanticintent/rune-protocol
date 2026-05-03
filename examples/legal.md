# Rune in Contract Systems

Legal contracts have two properties that make Rune a natural fit:
every clause has a rationale, and every execution is irrevocable.
`?` preserves the negotiation rationale that currently lives in email
threads. `!` encodes the irrevocability guarantee that contract law requires.

## Contract Negotiation

```
@contract.id         ?"system-assigned — immutable after !draft"
@contract.parties    ?"set at !draft — cannot be changed after creation"
@contract.version    ?"incremented on each !compile — display only"
@obligations         ?"computed from ~clauses — regenerated on !compile"

~payment-terms       ?"negotiable — standard net-30, client may request net-60 with approval"
~liability-cap       ?"default 12 months fees — increase above 24 months requires partner sign-off"
~termination-notice  ?"default 30 days — minimum 14 per jurisdiction"
~governing-law       ?"defaults to jurisdiction of service delivery — override requires legal review"
~renewal-terms       ?"auto-renew unless ~auto-renew = false — notice period per ~termination-notice"
```

## Contract Lifecycle Actions

```
!draft               ?"creates contract record, sets @contract.id — requires both parties identified"
!compile             ?"regenerates @obligations from current ~clauses — required before !execute"
!send-for-review     ?"notifies counterparty — version-stamped, tracked in matter"
!execute             ?"irrevocable — triggers countersignature workflow, creates immutable record"
!amend               ?"creates amendment document — does not modify executed contract"
!terminate           ?"initiates notice period per ~termination-notice — logged to matter"
!renew               ?"creates renewal record linked to original — inherits ~clauses unless overridden"

?"executed contracts are immutable — amendments via !amend only, never direct edit"
?"all ! actions require authenticated signatory with authority level ≥ 2"
?"this system complies with eSign Act (15 U.S.C. § 7001)"
?"audit trail retained for 7 years per records retention policy v3.1"
```

## Service Agreement

```
@sla.uptime-target   ?"99.9% — calculated from @incident.downtime-minutes"
@sla.response-time   ?"p99 < 200ms — measured at load balancer, not application"
@sla.credits-accrued ?"computed from ~sla-breach-log — applied on !process-credits"

~support-tier        ?"standard | premium | enterprise — gates response SLA"
~escalation-contact  ?"required for premium and enterprise — validated on !execute"
~review-frequency    ?"default quarterly — annual requires written agreement"

!report-breach       ?"logs to ~sla-breach-log, triggers notification — timestamped"
!process-credits     ?"applies @sla.credits-accrued to next invoice — irreversible"
!upgrade-tier        ?"effective next billing cycle — requires ~escalation-contact for premium+"

?"SLA credits are the sole remedy for uptime failures — see limitation of liability clause"
?"breach reporting window: 30 days from incident — late reports not eligible for credits"
```

## Why Rune Fits Legal

- `!` encodes irrevocability structurally — `!execute` cannot be undone, and the protocol guarantees it
- `~` makes every negotiable term enumerable — legal review can query all mutable clauses in one call
- `?` preserves negotiation rationale in the contract itself — survives system migrations and counsel changes
- `@` makes computed obligations (derived from clauses) structurally non-writable — no silent amendments
