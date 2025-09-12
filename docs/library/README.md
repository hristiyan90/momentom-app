# Workout Library v0

Purpose: a seed catalog used by planning/UI before the builder engine.

- Source file: `/library/workouts.json` (flat array of workout objects)
- Allowed enums:
  - sport: run|bike|swim|strength
  - phase: base|build|peak|taper
  - primary_zone: z1..z5|strength
  - segments[].type: warmup|interval|recovery|cooldown|steady|drill|strength
  - segments[].target: zone|rpe|power|pace|none
- Prefer time-based segments (`duration_min`). Put swim distances in `notes`.

Validation:
```bash
jq . library/workouts.json >/dev/null