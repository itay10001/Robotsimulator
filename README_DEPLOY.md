# RouteForge DECODE Canvas Physics Simulator

Plain static HTML/CSS/JS project.

## Vercel

Use:

- Framework Preset: Other
- Build Command: leave blank
- Output Directory: .
- Install Command: leave blank/default

## Implemented

- Canvas-only field renderer; DOM is only UI/HUD/buttons
- Fixed timestep physics loop at 120 Hz
- SI units internally
- 12 ft × 12 ft field scaling
- 24 purple + 12 green artifacts
- Artifact rolling friction, wall bounce, artifact-artifact collision
- Robot-artifact collision with speed-relevant impulse transfer
- Force-limited robot drive with traction and battery sag approximation
- Continuous WASD TeleOp
- Intake capture based on mouth position and relative speed
- Shooter flywheel spin-up and projectile launch
- 2.5D projectiles with gravity and quadratic drag
- GOAL + CLASSIFIER approximation
- 9-slot classifier ramps and OVERFLOW
- Push-to-open gates that release classified artifacts
- DEPOT, BASE, movement, goal, pattern, RP scoring buckets
- Event-tier RP presets
- Autonomous script runner

## Limitation

Exact field geometry is approximate. The design report says official CAD is the source of truth. Replace the geometry values in `js/app.js` / object `F` with official CAD-derived positions for competition-grade accuracy.
