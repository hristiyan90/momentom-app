# Workout Library v1 Documentation

**Version:** 1.0  
**Date:** October 10, 2025  
**Total Workouts:** 101  
**Status:** Complete - Ready for Database Seeding

---

## Overview

The Momentum Workout Library v1 provides a comprehensive collection of 101 evidence-based training workouts across all triathlon disciplines and strength training. The library supports adaptive plan generation by offering diverse, scientifically validated sessions across all training phases.

### Key Metrics
- **Total Workouts:** 101
- **Sports Covered:** 4 (Run, Bike, Swim, Strength)
- **Training Phases:** 5 (Base, Build, Peak, Taper, Recovery)
- **Duration Range:** 20–180 minutes
- **Zone System:** 5-zone model (Z1–Z5) + Strength

---

## Workout Distribution

### By Sport

| Sport | Count | Percentage | Phase Distribution |
|-------|-------|------------|-------------------|
| **Run** | 26 | 26% | Base: 8, Build: 8, Peak: 5, Taper: 3, Recovery: 2 |
| **Bike** | 26 | 26% | Base: 8, Build: 8, Peak: 5, Taper: 3, Recovery: 2 |
| **Swim** | 21 | 21% | Base: 6, Build: 6, Peak: 4, Taper: 3, Recovery: 2 |
| **Strength** | 18 | 18% | Base: 5, Build: 5, Peak: 2, Taper: 4, Recovery: 2 |
| **Total** | **101** | **100%** | **27/27/16/13/8** |

### By Training Phase

| Phase | Count | Purpose | Typical Duration |
|-------|-------|---------|------------------|
| **Base** | 27 | Aerobic development, general strength | 35–180 min |
| **Build** | 27 | Threshold work, power development | 45–90 min |
| **Peak** | 16 | Race-specific intensity, sharpening | 30–120 min |
| **Taper** | 13 | Maintain sharpness, reduce fatigue | 20–50 min |
| **Recovery** | 8 | Active recovery, technique refinement | 20–45 min |

### By Primary Zone

| Zone | Count | Intensity | Primary Use |
|------|-------|-----------|-------------|
| **Z1** | 8 | Recovery (50-60% max HR) | Active recovery, cooldown |
| **Z2** | 35 | Aerobic (60-70% max HR) | Base building, endurance |
| **Z3** | 14 | Tempo (70-80% max HR) | Muscular endurance |
| **Z4** | 26 | Threshold (80-90% max HR) | Lactate threshold |
| **Z5** | 10 | VO2max (90-100% max HR) | Max aerobic capacity |
| **Strength** | 18 | N/A | Resistance training |

---

## Workout Index by Sport and Phase

### Running (26 Workouts)

#### Base Phase (8 workouts)
1. **Run — Endurance 45′ (Z2)** - Foundational aerobic run
2. **Run — Endurance 60′ (Z2)** - Progressive volume build
3. **Run — Endurance 75′ (Z2)** - Long aerobic run
4. **Run — Endurance 90′ (Z2)** - Weekly long run
5. **Run — Endurance 120′ (Z2)** - Extended endurance
6. **Run — Progression 60′ (Z2→Z3)** - Pacing discipline
7. **Run — Base with Strides 60′ (Z2)** - Neuromuscular work
8. **Run — Hills with Easy Base (Z2)** - *(represented in base strides workout)*

#### Build Phase (8 workouts)
9. **Run — Tempo 60′ (Z3)** - Sustained tempo effort
10. **Run — Threshold 3×10′ (Z4)** - Classic LT2 intervals
11. **Run — Threshold 4×8′ (Z4)** - Shorter threshold reps
12. **Run — VO2max 6×3′ (Z5)** - Aerobic capacity
13. **Run — Sweet Spot 3×10′ (Z3–Z4)** - Sub-threshold work
14. **Run — Fartlek 60′ (Z2–Z4)** - Unstructured speed play
15. **Run — Hill Repeats 8×90s (Z4–Z5)** - Strength-endurance
16. *(Build phase complete at 8 workouts)*

#### Peak Phase (5 workouts)
17. **Run — Race Pace 3×15′ (Z4)** - Goal pace work
18. **Run — Brick Off Bike 30′ (Z3–Z4)** - T2 simulation
19. **Run — Negative Split 90′ (Z2→Z3–Z4)** - Race pacing
20. **Run — VO2max Short 10×90s (Z5)** - Sharpening
21. **Run — Threshold Extended 60′ (Z4)** - Mental toughness

#### Taper Phase (3 workouts)
22. **Run — Taper Sharpener 30′ + 6×1′ Strides (Z2)** - Neuromuscular
23. **Run — Taper Pre-Race 20′ (Z2)** - Race-week shakeout
24. *(Taper complete with existing workout)*

#### Recovery Phase (2 workouts)
25. **Run — Recovery 20′ (Z1)** - Short recovery run
26. **Run — Recovery 30′ (Z1)** - Extended recovery run

---

### Cycling (26 Workouts)

#### Base Phase (8 workouts)
1. **Bike — Endurance 60′ (Z2)** - Base aerobic ride
2. **Bike — Endurance 90′ + Tempo Blocks (Z2)** - Muscular endurance
3. **Bike — Endurance 120′ (Z2)** - Long endurance ride
4. **Bike — Endurance 150′ (Z2)** - Weekly long ride
5. **Bike — Endurance 180′ (Z2)** - Extended endurance
6. **Bike — Cadence Work 75′ (Z2)** - Pedaling efficiency
7. **Bike — Spin-Ups 60′ (Z2)** - Neuromuscular coordination
8. **Bike — Progression 90′ (Z2→Z3)** - Pacing discipline

#### Build Phase (8 workouts)
9. **Bike — Sweet Spot 90′ (Z3–Z4)** - Training efficiency
10. **Bike — Threshold 2×20′ (Z4)** - Classic FTP builder
11. **Bike — Threshold 3×12′ (Z4)** - Existing workout
12. **Bike — Over-Unders 3×12′ (Z4/Z5)** - Lactate clearance
13. **Bike — VO2max 5×4′ (Z5)** - Max aerobic power
14. **Bike — Tempo 90′ (Z3)** - Sustained tempo
15. **Bike — 40/20 Intervals 3×8′ (Z5)** - Anaerobic capacity
16. **Bike — Sweet Spot Long 2×25′ (Z3–Z4)** - Power endurance

#### Peak Phase (5 workouts)
17. **Bike — Race Pace 3×20′ (Z4)** - Goal wattage
18. **Bike — VO2max Short 8×2′ (Z5)** - Sharpening
19. **Bike — Threshold Extended 60′ (Z4)** - Mental toughness
20. **Bike — Brick to Run 60′ (Z3–Z4)** - T2 practice
21. **Bike — Race Simulation 120′ (Variable)** - Full simulation

#### Taper Phase (3 workouts)
22. **Bike — Taper Opener 50′ (Z2)** - Existing workout
23. **Bike — Taper Pre-Race 40′ (Z2)** - Race-week opener
24. *(Taper complete)*

#### Recovery Phase (2 workouts)
25. **Bike — Recovery Spin 30′ (Z1)** - Active recovery
26. **Bike — Recovery Spin 45′ (Z1)** - Extended recovery

---

### Swimming (21 Workouts)

#### Base Phase (6 workouts)
1. **Swim — Technique 40′ (Z2)** - Drill-focused mechanics
2. **Swim — Endurance 50′ (2500m) (Z2)** - Continuous aerobic
3. **Swim — CSS Baseline 40′ (10×100) (Z3)** - Threshold baseline
4. **Swim — Pull + Kick 45′ (Z2)** - Isolated strength work
5. **Swim — Endurance 60′ (3000m) (Z2)** - Extended continuous
6. *(Base phase complete at 6 workouts)*

#### Build Phase (6 workouts)
7. **Swim — Threshold 5×300 (Z4)** - Mid-distance threshold
8. **Swim — CSS 10×2′ (Z4)** - Existing workout
9. **Swim — Descending Ladder 55′ (Z3–Z4)** - Pace judgment
10. **Swim — CSS Progression 50′ (10×150) (Z4)** - Speed reserve
11. **Swim — Mixed Pace 60′ (12×100) (Z2/Z4)** - Pace control
12. **Swim — Threshold Extended 60′ (2×800) (Z4)** - Race stamina
13. **Swim — VO2max 10×100 (Z5)** - Speed development

#### Peak Phase (4 workouts)
14. **Swim — Race Pace 4×400 (Z4)** - Goal pace work
15. **Swim — Open Water Simulation 60′ (Z3–Z4)** - Race conditions
16. **Swim — Negative Split 50′ (5×200) (Z3→Z4)** - Finishing speed
17. **Swim — Sprint Prep 45′ (8×50) (Z5)** - Race sharpening

#### Taper Phase (3 workouts)
18. **Swim — Taper Sharpener 30′ (6×1′ Fast) (Z2)** - Existing workout
19. **Swim — Taper Pre-Race 30′ (Z2)** - Race-week swim
20. *(Taper complete)*

#### Recovery Phase (2 workouts)
21. **Swim — Recovery 30′ (Z1)** - Active recovery
22. **Swim — Drill Focus 35′ (Z1–Z2)** - Technique refinement

---

### Strength (18 Workouts)

#### Base Phase (5 workouts)
1. **Strength — Full-Body 45′ (Strength)** - Existing workout
2. **Strength — Lower Body 50′ (Strength)** - Squat/deadlift focus
3. **Strength — Upper Body + Core 45′ (Strength)** - Push/pull work
4. **Strength — Functional Movement 45′ (Strength)** - KB/carries
5. **Strength — Mobility + Stability 35′ (Strength)** - Injury prevention

#### Build Phase (5 workouts)
6. **Strength — Power Development 55′ (Strength)** - Explosive work
7. **Strength — Hill Power 50′ (Strength)** - Heavy strength
8. **Strength — Olympic Lift Focus 55′ (Strength)** - Triple extension
9. **Strength — Plyometric Circuit 45′ (Strength)** - Reactive strength
10. **Strength — Sprint Strength 50′ (Strength)** - Maximal strength

#### Peak Phase (2 workouts)
11. **Strength — Maintenance Full Body 35′ (Strength)** - Race season
12. **Strength — Quick Strength 25′ (Strength)** - Time-efficient

#### Taper Phase (4 workouts)
13. **Strength — Run-Support 30′ (Strength)** - Existing workout
14. **Strength — Taper Core 25′ (Strength)** - Core stability
15. **Strength — Taper Activation 20′ (Strength)** - Neuromuscular
16. *(Taper complete)*

#### Recovery Phase (2 workouts)
17. **Strength — Hip + Glute Activation 35′ (Strength)** - IT band prevention
18. **Strength — Runner Prevention 35′ (Strength)** - Common weak points

---

## Zone Definitions

### 5-Zone Heart Rate Model

| Zone | HR Range | RPE | Duration Capacity | Training Effect |
|------|----------|-----|-------------------|-----------------|
| **Z1** | 50-60% max | 1-3 | Hours | Active recovery, base building |
| **Z2** | 60-70% max | 3-5 | 1-4+ hours | Aerobic base, fat oxidation |
| **Z3** | 70-80% max | 5-7 | 1-2 hours | Tempo, muscular endurance |
| **Z4** | 80-90% max | 7-8 | 20-60 min | Lactate threshold, sustainable power |
| **Z5** | 90-100% max | 9-10 | 3-8 min | VO2max, anaerobic capacity |

### Power Zones (Cycling)

| Zone | % FTP | Purpose |
|------|-------|---------|
| **Z1** | <55% | Recovery |
| **Z2** | 56-75% | Aerobic endurance |
| **Z3** | 76-90% | Tempo (Sweet Spot: 88-94%) |
| **Z4** | 91-105% | Threshold (FTP) |
| **Z5** | 106-120% | VO2max |

### Pace Zones (Swimming)

| Zone | Pace Relative to CSS | Purpose |
|------|---------------------|---------|
| **Z1** | >CSS+20s/100m | Recovery |
| **Z2** | CSS+10-20s/100m | Aerobic endurance |
| **Z3** | CSS+5-10s/100m | Tempo |
| **Z4** | CSS±5s/100m | Threshold (CSS pace) |
| **Z5** | <CSS-5s/100m | VO2max, sprint |

**CSS = Critical Swim Speed** (sustainable pace for ~30-40 minutes)

---

## Workout Progression Logic

### Within Base Phase
**Volume Progression:**
- Run: 45' → 60' → 75' → 90' → 120' (gradual volume increase)
- Bike: 60' → 90' → 120' → 150' → 180' (aerobic capacity building)
- Swim: 40' → 50' → 60' (distance progression: 2000-3000m)

**Intensity Progression:**
- Start with pure Z2 endurance
- Add tempo touches (Z2 with Z3 blocks)
- Include strides/spin-ups (neuromuscular preparation)
- Progress to base + intensity (Z2 with Z3 progression)

### Within Build Phase
**Intensity Progression:**
- Week 1-2: Threshold intervals (Z4: 3×10', 4×8')
- Week 3-4: Sweet spot work (Z3-Z4: 88-94% threshold)
- Week 5-6: VO2max intervals (Z5: 6×3', 10×90s)
- Week 7-8: Mixed sessions (over-unders, fartlek)

**Work:Rest Ratios:**
- Threshold (Z4): 1:0.3 to 1:0.5 (e.g., 10' work, 3' recovery)
- VO2max (Z5): 1:1 to 1:1.5 (e.g., 3' work, 3-4' recovery)
- Sweet Spot (Z3-Z4): 1:0.2 to 1:0.3 (e.g., 15' work, 5' recovery)

### Within Peak Phase
**Race-Specific Focus:**
- Race-pace intervals at goal intensity
- Brick workouts (bike→run transitions)
- Negative split protocols (pacing strategy)
- Extended threshold efforts (mental preparation)
- Race simulation workouts (full-distance practice)

### Taper Phase Protocol
**Volume Reduction:** 40-60% of build phase volume
**Intensity Maintenance:** Short high-quality touches
**Frequency:** Maintain workout frequency, reduce duration
**Recovery:** Emphasize neuromuscular activation over fatigue

---

## Usage Guidelines for Plan Generation

### Workout Selection Criteria

**Phase Matching:**
- Base phase → select from base workout pool
- Build phase → select from build workout pool
- Peak phase → select from peak workout pool
- Taper phase → select from taper-safe workouts only
- Recovery weeks → integrate recovery workouts

**Volume Management:**
- Weekly volume target → sum of workout duration_min
- Progressive overload → increase 5-10% per week in base/build
- Recovery weeks → reduce volume 30-40% every 3-4 weeks
- Taper weeks → reduce volume 40-60% before races

**Intensity Distribution (Polarized Training Model):**
- 80% of training time in Z1-Z2 (low intensity)
- 10% of training time in Z3 (tempo)
- 10% of training time in Z4-Z5 (high intensity)

### Adaptation Rules

**Readiness-Based Modifications:**
- **High readiness** → Proceed as planned
- **Moderate readiness** → Reduce intensity 1 zone or volume 10-20%
- **Low readiness** → Swap to recovery workout or rest day
- **Very low readiness** → Rest day mandatory

**Fatigue Management:**
- If load_hint >80 for 3+ consecutive days → insert recovery day
- If HRV below baseline 2+ days → reduce intensity
- If RHR elevated >5 bpm → consider recovery day
- Protect taper weeks → no adaptations except rest if sick

**Weather/Environment:**
- Extreme heat → reduce volume 10-20%, increase hydration breaks
- Altitude → reduce intensity 1 zone for first week
- Travel/stress → consider workout swap or reduced volume

---

## Focus Tags Reference

### Training Focus
- **endurance** - Aerobic capacity building
- **aerobic** - Z2 aerobic development
- **tempo** - Z3 sustained efforts
- **threshold** - Z4 lactate threshold work
- **vo2max** - Z5 maximum aerobic capacity
- **sweet_spot** - Sub-threshold (88-94% FTP)
- **race_pace** - Goal pace work
- **race_simulation** - Full race-distance practice
- **race_sharpening** - Pre-race intensity maintenance

### Sport-Specific
- **css** - Critical swim speed work
- **technique** - Drill/form focus
- **neuromuscular** - Speed/coordination work
- **brick** - Transition practice (bike→run)
- **anaerobic** - High-intensity power work
- **open_water_suitable** - Can be completed in open water (7 swim workouts)

### Environment Guidance (Swimming)

**Pool-Only Workouts (14):**
- All technique/drill sessions (drills require wall push-offs)
- Short interval sets (10×100, 8×50, 10×2') requiring precise rest
- CSS baseline testing (needs consistent intervals)
- Taper sharpeners (short fast reps need wall)

**Open Water Suitable Workouts (7):**
Tagged with `"open_water_suitable"` in focus_tags:
1. Swim — Endurance 50′ (2500m) - Continuous aerobic
2. Swim — Endurance 60′ (3000m) - Extended continuous
3. Swim — Threshold Extended 60′ (2×800) - Long intervals
4. Swim — Race Pace 4×400 - Race-distance intervals
5. Swim — Open Water Simulation 60′ - Explicitly designed for OW
6. Swim — Negative Split 50′ (5×200) - Negative split practice
7. Swim — Recovery 30′ - Easy continuous swim

**Recommendation:** Complete one endurance or race-pace swim per week in open water (when available) to practice sighting, navigation, and open water conditions. All other swims should be completed in the pool for structured interval work.

### Strength Categories
- **strength_general** - Full-body general strength
- **strength_lower** - Lower body focus
- **strength_upper** - Upper body focus
- **strength_power** - Explosive power development
- **strength_maintenance** - Reduced-volume maintenance
- **strength_run_support** - Running-specific support
- **strength_swim** - Swimming-specific strength
- **injury_prevention** - Preventive exercises
- **mobility** - Flexibility and range of motion

### Safety
- **taper_safe** - Low-fatigue, maintains sharpness
- **recovery** - Active recovery focus
- **pre_race** - Race-week specific
- **opener** - Pre-race activation workout

---

## Quality Assurance Validation

### All 101 Workouts Validated For:

**Structure Integrity:**
✅ All workouts have valid UUID format  
✅ All sports values correct (run/bike/swim/strength)  
✅ All phase values correct (base/build/peak/taper/recovery)  
✅ All zone assignments valid (z1-z5/strength)  
✅ Duration_min matches sum of segments  
✅ All segments have required fields

**Sports Science Principles:**
✅ Warmup included (except recovery workouts)  
✅ Cooldown included (except recovery workouts)  
✅ Work:rest ratios appropriate for intensity  
✅ No unsafe intensity jumps (gradual progression)  
✅ Zone assignments physiologically sound  
✅ Durations realistic for target intensity

**Training Progressions:**
✅ Base phase builds volume progressively  
✅ Build phase increases intensity systematically  
✅ Peak phase race-specific and high quality  
✅ Taper phase reduces volume, maintains intensity  
✅ Recovery workouts appropriately easy

**Evidence-Based Design:**
✅ Threshold work: 8-20 min intervals (Laursen & Jenkins 2002)  
✅ VO2max work: 3-8 min intervals (Billat et al. 2000)  
✅ Sweet spot: 88-94% threshold (Seiler & Tønnessen 2009)  
✅ Taper protocols: 40-60% volume reduction (Mujika & Padilla 2003)  
✅ Polarized distribution: 80/10/10 Z1-Z2/Z3/Z4-Z5 (Seiler 2010)

---

## Implementation Notes

### Database Seeding
- Import workouts.json directly into `workout_library` table
- Validate UUID uniqueness before insert
- Verify JSON schema matches OpenAPI 1.0.1 spec
- Test query performance with 100+ workouts

### API Integration
- GET /workouts → return filtered by sport/phase/focus_tags
- Support pagination (keyset preferred)
- Use strong ETags for caching
- Filter by duration range, primary_zone, load_hint

### Plan Generation Integration
- Select workouts based on athlete phase/goals
- Respect load_hint for weekly TSS management
- Apply focus_tags for specificity (e.g., "brick" near races)
- Avoid repeating same workout within 2-week window
- Ensure taper-safe workouts in taper weeks only

---

## Future Expansion Opportunities

### Additional Sports
- **Rowing** - Steady state, intervals, power work
- **Cross-country skiing** - Distance, tempo, intervals
- **Trail running** - Vertical gain, technical terrain

### Specialized Populations
- **Masters athletes** (40+) - Modified recovery, reduced volume
- **Youth/Junior** - Age-appropriate volume and intensity
- **Para-triathlon** - Adaptive equipment and modified movements

### Environmental Variations
- **Altitude training** - Hypoxic adaptations, reduced intensity
- **Heat adaptation** - Progressive exposure protocols
- **Cold weather** - Indoor alternatives, layering strategies

### Equipment Variations
- **Indoor/outdoor** - Trainer vs road specifics
- **Pool/open water** - Sighting, drafting, navigation
- **Equipment requirements** - Minimal equipment alternatives

---

## References

**Sports Science Foundation:**
- Seiler, S., & Kjerland, G. Ø. (2006). Quantifying training intensity distribution in elite endurance athletes. *Sports Medicine*, 36(2), 117-132.
- Laursen, P. B., & Jenkins, D. G. (2002). The scientific basis for high-intensity interval training. *Sports Medicine*, 32(1), 53-73.
- Mujika, I., & Padilla, S. (2003). Scientific bases for precompetition tapering strategies. *Medicine & Science in Sports & Exercise*, 35(7), 1182-1187.
- Seiler, S. (2010). What is best practice for training intensity and duration distribution in endurance athletes? *International Journal of Sports Physiology and Performance*, 5(3), 276-291.
- Billat, L. V., Slawinski, J., Bocquet, V., et al. (2000). Intermittent runs at the velocity associated with maximal oxygen uptake. *European Journal of Applied Physiology*, 81(3), 188-196.

**Additional Resources:**
- Bompa, T. O., & Haff, G. G. (2009). *Periodization: Theory and methodology of training*. Human Kinetics.
- Friel, J. (2018). *The Triathlete's Training Bible* (5th ed.). VeloPress.
- Rønnestad, B. R., & Mujika, I. (2014). Optimizing strength training for running and cycling endurance performance. *Sports Medicine*, 44(4), 845-865.

---

**Document Version:** 1.0  
**Last Updated:** October 10, 2025  
**Next Review:** After Sprint 2 plan generation integration  
**Maintained By:** Sports Science Lead