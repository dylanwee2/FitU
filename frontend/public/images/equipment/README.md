# Equipment Icons

This directory contains equipment icons used in the WorkoutCart component to display visual representations of equipment needed for workouts.

## Equipment Icons Mapping

The following equipment types are supported with their corresponding icon files:

- `bodyweight.svg` - Body weight exercises
- `dumbbell.svg` - Dumbbell exercises
- `barbell.svg` - Barbell exercises
- `kettlebell.svg` - Kettlebell exercises
- `resistance-band.svg` - Resistance band exercises
- `cable.svg` - Cable machine exercises
- `machine.svg` - General gym machines
- `bench.svg` - Bench exercises
- `pullup-bar.svg` - Pull-up bar exercises
- `medicine-ball.svg` - Medicine ball exercises
- `trx.svg` - TRX suspension trainer
- `yoga-mat.svg` - Yoga mat exercises
- `stability-ball.svg` - Stability ball exercises
- `foam-roller.svg` - Foam roller exercises
- `weight-plate.svg` - Weight plate exercises
- `ez-bar.svg` - EZ bar exercises
- `trap-bar.svg` - Trap bar exercises
- `suspension-trainer.svg` - Suspension trainer
- `box.svg` - Box/plyometric exercises
- `step.svg` - Step exercises
- `default.svg` - Default fallback icon

## Icon Specifications

- **Size**: 32x32 pixels (displayed at 32x32px)
- **Format**: SVG with transparent background
- **Style**: Premium modern icons with dark theme and gradient accents
- **Theme**: Dark background (#0f172a) with vibrant gradient colors for visual appeal

## Adding New Equipment Icons

1. Add the new equipment type to the `getEquipmentIcon` function in `WorkoutCart.vue`
2. Add the corresponding SVG file to this directory
3. Follow the naming convention: `equipment-name.svg` (lowercase, hyphens for spaces)
4. Use the dark theme (#0f172a background) with gradient accents for consistency

## Fallback

If an equipment icon is not found, the system will display `default.svg` as a fallback.
