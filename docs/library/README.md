# Workout Library v1.0

The Momentum Workout Library provides a comprehensive collection of 101 evidence-based endurance training workouts designed for triathletes across different sports, phases, and fitness levels.

## Overview

**Version:** 1.0 (Complete)  
**Total Workouts:** 101  
**Sports Covered:** Run (26), Bike (26), Swim (21), Strength (18)  
**Training Phases:** Base, Build, Peak, Taper, Recovery  
**Primary Focus:** Half-Distance (70.3) Triathlon Training

## Structure

### Core Files
- `workouts.json` - Main workout database (101 workouts - v1.0 complete)
- `template.workout.json` - Template for creating new workouts
- `coverage-checklist.md` - Testing and validation requirements
- `evidence-brief.md` - Rationale and evidence for workout design
- `expansion-summary.md` - Completion summary and metrics
- `mapping-note.md` - Plan generation integration notes

### Documentation
- `workout-library-v1.md` - Complete workout index and usage guide
- `qa-validation-report.md` - Quality assurance validation results
- `friel-validation-addendum.md` - Joe Friel protocol alignment

## Workout Schema

Each workout follows a standardized JSON schema:

```json
{
  "workout_id": "uuid",
  "sport": "run|bike|swim|strength",
  "title": "Sport — Type Duration (Zone)",
  "description": "Brief description of the workout purpose",
  "phase": "base|build|peak|taper|recovery",
  "focus_tags": ["endurance", "threshold", "taper_safe", "open_water_suitable"],
  "primary_zone": "z1|z2|z3|z4|z5|strength",
  "duration_min": 30,
  "load_hint": 45,
  "structure_json": {
    "segments": [
      {
        "type": "warmup|steady|interval|recovery|cooldown|strength",
        "target": "zone|pace|rpe|none",
        "duration_min": 10,
        "notes": "Athlete-facing instructions"
      }
    ]
  }
}
```

## Sports Coverage

### Running (26 workouts)
- **Base Phase (8):** Endurance 45-120', progression runs, strides
- **Build Phase (8):** Tempo, threshold intervals, VO2max, hill repeats
- **Peak Phase (5):** Race pace, brick runs, negative splits
- **Taper Phase (3):** Sharpeners, pre-race openers
- **Recovery Phase (2):** Easy recovery runs

### Cycling (26 workouts)
- **Base Phase (8):** Endurance 60-180', cadence work, spin-ups
- **Build Phase (8):** Sweet spot, threshold, over-unders, VO2max
- **Peak Phase (5):** Race pace, brick rides, race simulation
- **Taper Phase (3):** Openers, pre-race rides
- **Recovery Phase (2):** Easy recovery spins

### Swimming (21 workouts)
- **Base Phase (6):** Technique drills, endurance 2500-3000m, CSS baseline
- **Build Phase (6):** Threshold intervals, CSS progression, mixed pace
- **Peak Phase (4):** Race pace, open water simulation, negative splits
- **Taper Phase (3):** Sharpeners, pre-race swims
- **Recovery Phase (2):** Easy recovery swims
- **Note:** 7 workouts tagged "open_water_suitable" for OW training

### Strength (18 workouts)
- **Base Phase (5):** Full-body, lower body, upper body, functional movement
- **Build Phase (5):** Power development, Olympic lifts, plyometrics
- **Peak Phase (2):** Maintenance circuits
- **Taper Phase (4):** Run-support, core, activation
- **Recovery Phase (2):** Hip/glute activation, injury prevention

## Training Phases

### Base Phase (27 workouts)
- **Focus:** Aerobic development, general strength, injury prevention
- **Duration:** 4-12 weeks
- **Volume:** High (progressive increase)
- **Intensity:** Low-moderate (80%+ in Z1-Z2)

### Build Phase (27 workouts)
- **Focus:** Threshold work, sport-specific strength, progressive overload
- **Duration:** 6-12 weeks
- **Volume:** Moderate-high
- **Intensity:** High (20% in Z3-Z5)

### Peak Phase (16 workouts)
- **Focus:** Race-specific preparation, high-intensity work
- **Duration:** 2-4 weeks
- **Volume:** Moderate
- **Intensity:** Very high quality

### Taper Phase (13 workouts)
- **Focus:** Sharpening without fatigue, neuromuscular activation
- **Duration:** 1-2 weeks
- **Volume:** Low (40-60% of peak)
- **Intensity:** Brief high-quality touches

### Recovery Phase (8 workouts)
- **Focus:** Active recovery, technique refinement
- **Duration:** 1-4 weeks (after races or every 3-4 weeks)
- **Volume:** Very low
- **Intensity:** Z1 only

## Usage

### For Athletes
Workouts are designed to be:
- **Modular**: Segments can be adapted based on fitness level
- **Scalable**: Duration and intensity adjustable via plan generation
- **Sport-specific**: Tailored to each discipline's demands
- **Phase-appropriate**: Matched to training periodization
- **Device-compatible**: Export to bike computer/watch for tracking

### For Plan Generation
- **Filtering:** By sport, phase, primary_zone, focus_tags, duration
- **Selection:** Use load_hint for weekly TSS management
- **Variety:** Avoid repeating workouts within 2-week window
- **Constraints:** Taper-safe workouts only during taper phase
- **Adaptation:** Swap workouts based on readiness/constraints

### Intensity Distribution (80/20 Rule)
Plan generation should select workouts to achieve:
- **80% of training time** in Z1-Z2 (aerobic endurance)
- **10% of training time** in Z3 (tempo)
- **10% of training time** in Z4-Z5 (threshold, VO2max)

## Quality Assurance

All 101 workouts have been validated for:
- ✅ **Structure integrity**: 100% schema compliance
- ✅ **Sports science accuracy**: Evidence-based design
- ✅ **Safety protocols**: Proper warmup/cooldown, work:rest ratios
- ✅ **Progression logic**: Phase-appropriate progressions
- ✅ **Friel protocol alignment**: Triathlon-specific validation

### Validation Results
- **Structure Validation:** 101/101 pass
- **Sports Science:** 101/101 pass
- **Safety Assessment:** 101/101 pass
- **Evidence Alignment:** 101/101 pass
- **Overall Status:** ✅ APPROVED FOR PRODUCTION

## Evidence Base

Workouts designed according to:
- **Joe Friel** - Triathlon periodization and training abilities
- **Stephen Seiler** - Polarized training and intensity distribution
- **Paul Laursen** - High-intensity interval training protocols
- **Iñigo Mujika** - Taper strategies and recovery protocols

See `evidence-brief.md` for complete references and research foundation.

## Integration

### API Endpoints
```
GET /workouts
  ?sport=run|bike|swim|strength
  &phase=base|build|peak|taper|recovery
  &primary_zone=z1|z2|z3|z4|z5|strength
  &focus_tags=endurance,threshold,brick
  &duration_min_range=30-90
```

### Database Schema
Workouts stored in `workout_library` table with indexes on:
- `sport`
- `phase`
- `primary_zone`
- `focus_tags` (array)

### Caching
- Strong ETags based on canonical JSON
- Cache invalidation on library updates

## Version History

### v1.0 (October 2025) - Complete
- **101 workouts** across all sports and phases
- Evidence-based design validated against Friel protocols
- Half-distance (70.3) optimization
- Open water guidance for swim workouts
- Comprehensive QA validation (100% pass rate)

### v0.1 (Drop-1) - Initial Seed
- 10 foundational workouts
- Schema validation and structure testing
- UI/ingestion proof of concept

## Future Enhancements

### Short-Term (Sprint 2-3)
- Add workout preview visualizations
- Create workout "families" (progression series)
- Add difficulty ratings (beginner/intermediate/advanced)
- Track workout popularity and completion rates

### Medium-Term (Cycle 3-4)
- Equipment variations (indoor/outdoor, minimal equipment)
- Environmental adaptations (altitude, heat, cold)
- Additional race distances (Sprint, Olympic, Ironman)
- Testing protocols (FTP, threshold pace, CSS)

### Long-Term (Future Cycles)
- Specialized populations (masters, youth, para-triathlon)
- AI-generated custom workouts
- User-submitted workouts with curation
- Video demonstrations and form coaching

## Contributing

New workouts should:
1. Follow the `template.workout.json` structure
2. Include evidence-based rationale in description
3. Pass `coverage-checklist.md` validation
4. Be reviewed by Sports Science Specialist
5. Document modifications or adaptations

## Support

For questions or issues:
- **Product Architect:** Schema and API integration
- **Sports Science Specialist:** Training methodology and validation
- **Full-Stack Dev:** Database seeding and implementation

---

**Library Version:** 1.0  
**Last Updated:** October 10, 2025  
**Maintained By:** Sports Science Specialist  
**Status:** ✅ Production Ready