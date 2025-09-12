# Workout Library Seeds

This folder contains the **seed data** used by the app/seed scripts.

- **Primary seed file:** `workouts.json` (flat array of workout objects)

## Docs, Schema & QA

All documentation and templates live under **`docs/library/`**:

- [Overview & usage](../docs/library/README.md)
- [Workout template (schema)](../docs/library/template.workout.json)
- [Coverage checklist](../docs/library/coverage-checklist.md)
- [Evidence brief](../docs/library/evidence-brief.md)
- [Coverage note (Drop-1)](../docs/library/coverage-note.md)
- [Mapping note](../docs/library/mapping-note.md)

## Validate

Before committing updates to `workouts.json`:

```bash
jq . library/workouts.json >/dev/null
echo $? # expect 0