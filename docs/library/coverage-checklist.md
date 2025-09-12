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
- [ ] Taper workouts (Z2 with neuromuscular work)
- [ ] Recovery workouts (Z1 active recovery)

### Cycling
- [ ] Endurance rides (Z2 aerobic base)
- [ ] Threshold intervals (Z4 power work)
- [ ] Tempo blocks (Z3 muscular endurance)
- [ ] Taper openers (Z2 with Z4 touches)

### Swimming
- [ ] CSS pace work (Z4 threshold swimming)
- [ ] Taper sharpeners (Z2 with Z5 touches)
- [ ] Stroke drills and technique work
- [ ] Endurance swims (Z2 aerobic base)

### Strength
- [ ] General strength (full-body, RPE 6-7)
- [ ] Run-support strength (injury prevention)
- [ ] Taper-safe strength (low volume, RPE 5-6)
- [ ] Sport-specific strength exercises

## Training Phases

### Base Phase
- [ ] Aerobic development focus
- [ ] General strength and mobility
- [ ] Injury prevention emphasis
- [ ] Moderate to high volume

### Build Phase
- [ ] Threshold and power work
- [ ] Sport-specific strength
- [ ] Higher intensity intervals
- [ ] Progressive overload

### Peak Phase
- [ ] Race-specific preparation
- [ ] High-intensity work
- [ ] Taper-safe protocols
- [ ] Mental preparation

### Taper Phase
- [ ] Sharpening without fatigue
- [ ] Neuromuscular activation
- [ ] Low volume, high quality
- [ ] Race simulation

### Recovery Phase
- [ ] Active recovery focus
- [ ] Low intensity work
- [ ] Mobility and flexibility
- [ ] Mental recovery

## Quality Assurance

### Evidence-Based Design
- [ ] Workout based on sports science research
- [ ] Appropriate intensity zones for phase
- [ ] Realistic duration and progression
- [ ] Evidence documented in `evidence-brief.md`

### Testing Validation
- [ ] Tested with real athletes
- [ ] Feedback incorporated
- [ ] Modifications documented
- [ ] Performance outcomes tracked

### Consistency Checks
- [ ] Naming conventions followed
- [ ] Zone assignments appropriate
- [ ] Duration matches structure
- [ ] Load hints realistic

## Documentation

### Required Documentation
- [ ] Workout rationale in description
- [ ] Evidence brief created
- [ ] Modification history tracked
- [ ] Testing results documented

### Optional Documentation
- [ ] Video demonstrations
- [ ] Equipment requirements
- [ ] Environmental considerations
- [ ] Progression pathways

## Accessibility

### Clear Instructions
- [ ] Notes are specific and actionable
- [ ] Technical terms explained
- [ ] Modifications suggested
- [ ] Safety considerations included

### Scalability
- [ ] Workout can be adapted for different fitness levels
- [ ] Duration can be modified
- [ ] Intensity can be adjusted
- [ ] Equipment alternatives provided

## Integration

### API Compatibility
- [ ] JSON schema validation passes
- [ ] All required fields present
- [ ] Data types correct
- [ ] Structure valid

### User Experience
- [ ] Workout is engaging and motivating
- [ ] Instructions are clear and concise
- [ ] Progression is logical
- [ ] Recovery is adequate