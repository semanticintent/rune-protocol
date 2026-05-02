# Rune in Financial / Trading Systems

Trading and risk systems have the most demanding requirements for explicit, auditable bindings. Rune's `!` invariant — nothing happens without explicit invocation — maps directly to the compliance requirement that every trade action is intentional and logged.

## Risk Dashboard

```
@market-price ?"live NBBO feed, 15ms refresh"
@position.pnl
@position.delta

~risk-threshold ?"approved by risk committee Q1-2025 — review at quarter end"
~stop-loss      ?"maximum drawdown per desk policy v2.3 — change requires desk-head sign-off"
~position-limit ?"VaR-based — see risk model v4.1 for calculation"

!submit-order with order.id              ← explicit, logged to OMS, irrevocable
!escalate-breach with desk.id           ← triggers compliance notification
!override-limit with trader.id, reason  ← requires reason argument — logged with rationale

?"institutional order screen — notional > $1M — see access control policy"
?"all actions logged to compliance trail — REC-2024-007"
```

## Order Entry Form

```
@instrument.name
@instrument.last-price
@account.buying-power

~quantity      ?"round lot enforcement: min 100, multiples of 100"
~order-type    ?"market or limit only — stop orders require separate workflow"
~limit-price   ?"required when order-type = limit — validation in action"
~time-in-force ?"default DAY — GTC requires compliance pre-approval"

!place-order   ← single explicit trigger — no implicit submit on field change
!cancel-order with order.id

?"pre-trade risk checks run on !place-order — not on field changes"
?"this form does not support short orders — see SHORT-SELL-WORKFLOW.md"
```

## Why Rune Fits Finance

- `!` makes every consequential action explicit and auditable — no implicit side effects
- `~` makes every editable threshold visible and addressable — auditors can query all mutable risk parameters
- `@` makes every live feed read-only by design — display elements cannot accidentally mutate state
- `?` keeps the regulatory rationale co-located with the binding it describes — survives system migrations
