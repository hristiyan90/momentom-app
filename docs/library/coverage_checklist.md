# Workout Library Coverage Checklist

## Schema Validation

### Required Fields
- [ ] `workout_id`: Valid UUID format
- [ ] `sport`: One of `run`, `bike`, `swim`, `strength`
- [ ] `title`: Descriptive title with phase and zone
- [ ] `description`: Clear purpose and benefits
- [ ] `phase`: One of `base`, `build`, `peak`, `taper`, `recovery`
- [ ] `focus_tags`: Array of valid focus tags
- [ ] `primary_zone`: One of `z1`, `z2`, `z3`, `z4`, `z5`, `strength`
- [ ] `duration_min`: Positive integer
- [ ] `load_hint`: Positive integer (typically 50-100% of duration)
- [ ] `structure_json`: Valid workout structure

### Structure Validation
- [ ] `structure_json.segments`: Non-empty array
- [ ] Each segment has required fields: `type`, `target`, `duration_min`, `notes`
- [ ] Segment types are valid: `warmup`, `steady`, `interval`, `recovery`, `cooldown`, `strength`
- [ ] Target values are valid: `zone`, `pace`, `rpe`, `none`
- [ ] Total segment duration matches `duration_min`

## Sports Coverage

### Running
- [ ] Endurance workouts (Z2 base building)
- [ ] Threshold workouts (Z4 lactate threshold)
- [ ] VO2max workouts (Z5 high-intensity intervals)
- [ ] Progression runs (Z2→Z3 or Z2→Z4)
- [ ] Fartlek and mixed-pace sessions
- [ ] Hill repeats (strength-endurance)
- [ ] Taper workouts (Z2 with neuromuscular work)
- [ ] Recovery workouts (Z1 active recovery)
- [ ] Brick workouts (off-bike transition practice)

### Cycling
- [ ] Endurance rides (Z2 aerobic base)
- [ ] Threshold intervals (Z4 power work)
- [ ] Sweet spot intervals (88-94% FTP)
- [ ] Over-under intervals (Z4/Z5 alternating)
- [ ] VO2max intervals (Z5 high power)
- [ ] Tempo blocks (Z3 muscular endurance)
- [ ] Cadence work and spin-ups (neuromuscular)
- [ ] Taper openers (Z2 with Z4 touches)
- [ ] Recovery spins (Z1 active recovery)
- [ ] Brick workouts (bike-to-run transition practice)

### Swimming
- [ ] CSS pace work (Z4 threshold swimming)
- [ ] Endurance swims (Z2 aerobic base, 2500-3000m)
- [ ] Threshold intervals (Z4 sustained efforts)
- [ ] VO2max intervals (Z5 short fast reps)
- [ ] Mixed pace sets (alternating Z2/Z4)
- [ ] Descending sets (pace judgment)
- [ ] Negative split workouts (race pacing)
- [ ] Stroke drills and technique work
- [ ] Taper sharpeners (Z2 with Z5 touches)
- [ ] Recovery swims (Z1 active recovery)
- [ ] **Open water suitable workouts** (tagged appropriately)

### Strength
- [ ] General strength (full-body, RPE 6-7)
- [ ] Lower body focus (squats, deadlifts, single-leg)
- [ ] Upper body + core (push, pull, trunk stability)
- [ ] Power development (explosive movements, plyometrics)
- [ ] Functional movement (kettlebells, carries)
- [ ] Run-support strength (injury prevention)
- [ ] Maintenance circuits (race season, low volume)
- [ ] Taper-safe strength (low volume, RPE 5-6)
- [ ] Mobility and stability work
- [ ] Sport-specific strength exercises

## Training Phases

### Base Phase
- [ ] Aerobic development focus (Z1-Z2 majority)
- [ ] General strength and mobility
- [ ] Injury prevention emphasis
- [ ] Moderate to high volume
- [ ] Progressive volume increases (<10% per week)
- [ ] Technique and skill work included

### Build Phase
- [ ] Threshold and power work (Z4 primary)
- [ ] VO2max intervals introduced (Z5)
- [ ] Sport-specific strength
- [ ] Higher intensity intervals
- [ ] Progressive overload (intensity and/or volume)
- [ ] Sweet spot and tempo work (Z3)

### Peak Phase
- [ ] Race-specific preparation
- [ ] High-intensity work (Z4-Z5)
- [ ] Race pace intervals
- [ ] Brick workouts (transition practice)
- [ ] Race simulation workouts
- [ ] Mental preparation and confidence building

### Taper Phase
- [ ] Sharpening without fatigue
- [ ] Neuromuscular activation (strides, spin-ups, short sprints)
- [ ] Low volume (40-60% of peak), high quality
- [ ] Brief intensity touches (maintain sharpness)
- [ ] Race simulation (short versions)
- [ ] Recovery emphasis

### Recovery Phase
- [ ] Active recovery focus (Z1 only)
- [ ] Low intensity work
- [ ] Mobility and flexibility
- [ ] Technique refinement
- [ ] Mental recovery
- [ ] Injury prevention exercises

## Quality Assurance

### Evidence-Based Design
- [ ] Workout based on sports science research
- [ ] Appropriate intensity zones for phase
- [ ] Realistic duration and progression
- [ ] Work:rest ratios scientifically validated
- [ ] Evidence documented in `evidence-brief.md`
- [ ] Friel protocols aligned (triathlon-specific)

### Safety Validation
- [ ] Proper warmup included (except recovery workouts)
- [ ] Adequate cooldown included (except recovery workouts)
- [ ] No unsafe intensity jumps (gradual progression)
- [ ] Recovery intervals appropriate for intensity
- [ ] Duration realistic for target intensity
- [ ] Progressive overload principles applied

### Testing Validation
- [ ] Tested with real athletes (or literature-validated protocols)
- [ ] Feedback incorporated
- [ ] Modifications documented
- [ ] Performance outcomes tracked
- [ ] Injury risk assessed

### Consistency Checks
- [ ] Naming conventions followed (Sport — Type Duration (Zone))
- [ ] Zone assignments appropriate for workout purpose
- [ ] Duration matches structure (segment sum)
- [ ] Load hints realistic (50-150% of duration based on intensity)
- [ ] Focus tags relevant and accurate

## Documentation

### Required Documentation
- [ ] Workout rationale in description
- [ ] Evidence brief created and maintained
- [ ] Modification history tracked (if applicable)
- [ ] Testing results documented (if applicable)
- [ ] QA validation report completed

### Optional Documentation
- [ ] Video demonstrations
- [ ] Equipment requirements specified
- [ ] Environmental considerations noted (indoor/outdoor, pool/open water)
- [ ] Progression pathways documented
- [ ] Athlete feedback compiled

## Accessibility

### Clear Instructions
- [ ] Notes are specific and actionable
- [ ] Technical terms explained or avoided
- [ ] Modifications suggested (if applicable)
- [ ] Safety considerations included
- [ ] Athlete-facing language (not coach jargon)

### Scalability
- [ ] Workout can be adapted for different fitness levels
- [ ] Duration can be modified by plan generation
- [ ] Intensity can be adjusted based on zones
- [ ] Equipment alternatives provided (if applicable)
- [ ] Indoor/outdoor flexibility (where applicable)

## Integration

### API Compatibility
- [ ] JSON schema validation passes
- [ ] All required fields present
- [ ] Data types correct (strings, integers, arrays, objects)
- [ ] Structure valid (parseable JSON)
- [ ] UUID format correct

### Plan Generation Support
- [ ] Focus tags enable smart filtering
- [ ] Load hints support TSS/weekly load calculation
- [ ] Phase assignments enable periodization
- [ ] Primary zone enables intensity distribution
- [ ] Duration enables schedule fitting

### User Experience
- [ ] Workout is engaging and motivating
- [ ] Instructions are clear and concise
- [ ] Progression is logical
- [ ] Recovery is adequate
- [ ] Title communicates purpose effectively

## Environment-Specific Validation (Swimming)

### Pool-Only Workouts
- [ ] Short interval sets (50m, 100m with precise rest)
- [ ] Technique and drill sessions
- [ ] CSS baseline testing (requires consistent intervals)
- [ ] Taper sharpeners (short fast reps need wall)
- [ ] Any workout requiring wall push-offs

### Open Water Suitable Workouts
- [ ] Continuous endurance swims (2500m+)
- [ ] Long interval sets (200m+ with manageable rest)
- [ ] Race pace intervals
- [ ] Race simulation workouts
- [ ] Recovery swims (continuous easy)
- [ ] Tagged with `"open_water_suitable"` in focus_tags

### Guidance
- [ ] Structured/drill workouts → Pool only
- [ ] Endurance/race pace workouts → Can be open water
- [ ] Recommendation: 1 OW swim per week when available

## Triathlon-Specific Features

### Brick Workouts
- [ ] Bike-to-run transition practice included
- [ ] Appropriate T2 simulation (30-60 min run off bike)
- [ ] Peak phase placement (race-specific)
- [ ] Sufficient brick variety (2-3 workouts minimum)

### Half-Distance (70.3) Optimization
- [ ] Long run up to 120 minutes (2 hours)
- [ ] Long bike up to 180 minutes (3 hours)
- [ ] Long swim up to 3000m continuous
- [ ] Volume appropriate for half-distance training
- [ ] Taper duration appropriate (10-14 days)

### Friel's Training Abilities
- [ ] Aerobic Endurance (AE) - Z1-Z2 workouts
- [ ] Muscular Endurance (ME) - Z3 tempo workouts
- [ ] Anaerobic Endurance (AnE) - Z4 threshold workouts
- [ ] Speed Skills (SS) - Neuromuscular workouts
- [ ] Force (F) - Strength and hill workouts
- [ ] Power (P) - VO2max workouts

### 80/20 Distribution Support
- [ ] Library enables 80% Z1-Z2 selection by plan generation
- [ ] Sufficient Z3-Z5 variety for 20% high-intensity
- [ ] Polarized training distribution achievable

---

**Checklist Version:** 2.0  
**Last Updated:** October 10, 2025  
**Total Validation Points:** 150+  
**Status:** Complete for v1.0 Library