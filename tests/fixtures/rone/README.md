# Rone contract fixtures

Captured from public Rone Arena 1.2.3 responses during October 11–12, 2026, using the canonical API or its published backup. Fixtures represent observed contracts, not assertions that live scraped statistics stay unchanged.

- `items`, `spells`, `emblems`, `roles`: representative Academy collections, including talent/family identities.
- `duration`: Aulus duration buckets; `multiLane`: a projection retaining Gatotkaca's `Roam` and `Exp Lane` source labels.
- `wallpapers`: representative hero artwork and actual resolution fields.
- PH/ID schedule, standings, match and simulation files: league-specific identifiers, null scores, player assets, purchase sequences and provider tiebreak results.
- `customSimulation`: generated public computation for four synthetic teams.
- `calculator`: public consecutive-win result.

Collections may be shortened to representative records. User identifiers and account-related bookkeeping are removed. Signed image query values are replaced with non-sensitive example URLs where needed. Tests must not require current live responses or private credentials.

Use these fixtures to check normalization and invariants, not to serve a fallback copy of the new features. Reinspect current provider contracts before refreshing fixtures.
