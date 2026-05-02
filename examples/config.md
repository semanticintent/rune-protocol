# Rune in Configuration Files

Configuration files annotated with Rune runes. `?` is the natural entry point — zero runtime cost, immediate value for humans and AI ops tooling.

## Infrastructure Config (YAML)

```yaml
# deployment.yaml — Rune Level 0 (intent annotations)

service: api-gateway

database_url: @env.DATABASE_URL       # read from environment
replica_count: ~scaling.replicas      # ?"scale event approval required above 10 — see runbook INFRA-004"
connection_pool: ~db.pool_size        # ?"tuned for p99 latency < 20ms — do not increase without load test"

feature_flags:
  new_checkout: ~rollout.checkout     # ?"canary: increment by 10% per day max — revert if error rate > 0.1%"
  dark_mode: ~rollout.dark_mode       # ?"fully rolled out Q4 — safe to set 100"

on_deploy:
  - !run-migrations                   # explicit — not automatic on restart
  - !warm-cache                       # explicit — operator may skip in emergency

# ?"this service is stateful — do not autoscale without DBA sign-off"
# ?"last security review: 2025-01-15 — no findings"
```

## Environment File

```bash
# .env.production — Rune Level 0

DATABASE_URL=@vault.DATABASE_URL       # read from Vault, never hardcoded
API_KEY=@vault.API_KEY                 # ?"rotates every 90 days — update downstream services"
MAX_CONNECTIONS=~ops.max_connections   # ?"default 100 — approved range 50-200 per capacity plan"
LOG_LEVEL=~ops.log_level               # ?"set to DEBUG only during incidents — storage cost at scale"
```

## The Value of `?` in Config

Config files accumulate decisions with lost rationale:
- Why is `replica_count` 3?
- Why does this service not autoscale?
- Why is the connection pool exactly 47?

With `?` annotations the rationale is in the file, in version control, and readable by AI ops tooling that can surface it during incidents, reviews, and onboarding.
