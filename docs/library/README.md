# Workout Library

The Momentom Workout Library provides a curated collection of endurance training workouts designed for athletes across different sports, phases, and fitness levels.

## Structure

### Core Files
- `workouts.json` - Main workout database (Drop-1 seed with 10 workouts)
- `template.workout.json` - Template for creating new workouts
- `coverage-checklist.md` - Testing and validation requirements
- `evidence-brief.md` - Rationale and evidence for workout design

### Workout Schema

Each workout follows a standardized JSON schema:

```json
{
  "workout_id": "uuid",
  "sport": "run|bike|swim|strength",
  "title": "Workout Title",
  "description": "Brief description of the workout",
  "phase": "base|build|peak|taper|recovery",
  "focus_tags": ["endurance", "threshold", "strength"],
  "primary_zone": "z1|z2|z3|z4|z5|strength",
  "duration_min": 30,
  "load_hint": 45,
  "structure_json": {
    "segments": [
      {
        "type": "warmup|steady|interval|recovery|cooldown|strength",
        "target": "zone|pace|rpe|none",
        "duration_min": 10,
        "notes": "Specific instructions"
      }
    ]
  }
}
```

## Sports Coverage

- **Running**: Endurance, threshold, taper workouts
- **Cycling**: Power-based training, tempo blocks
- **Swimming**: CSS pace work, stroke drills
- **Strength**: General and sport-specific exercises

## Training Phases

- **Base**: Aerobic development, general strength
- **Build**: Threshold work, sport-specific strength
- **Peak**: Race-specific preparation
- **Taper**: Sharpening without fatigue
- **Recovery**: Active recovery and maintenance

## Usage

Workouts are designed to be:
- **Modular**: Segments can be adapted or combined
- **Scalable**: Duration and intensity can be adjusted
- **Sport-specific**: Tailored to each discipline's demands
- **Phase-appropriate**: Matched to training periodization

## Quality Assurance

All workouts undergo:
- **Evidence review**: Based on sports science research
- **Testing validation**: Real-world athlete feedback
- **Coverage analysis**: Ensures comprehensive training spectrum
- **Consistency checks**: Schema validation and format compliance

## Contributing

New workouts should:
1. Follow the template structure
2. Include evidence-based rationale
3. Pass coverage checklist validation
4. Be tested with real athletes
5. Document any modifications or adaptations

## Version Control

- **Drop-1**: Initial seed with 10 foundational workouts
- **Future drops**: Additional workouts based on user feedback and training needs