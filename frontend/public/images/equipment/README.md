# Equipment Icons

This directory contains equipment icons used in the WorkoutCart component to display visual representations of equipment needed for workouts.

## Equipment Icons Mapping

The following equipment types are supported with their corresponding icon files:

- `bodyweight.png` - Body weight exercises
- `dumbbell.png` - Dumbbell exercises
- `barbell.png` - Barbell exercises
- `kettlebell.png` - Kettlebell exercises
- `resistance-band.png` - Resistance band exercises
- `cable.png` - Cable machine exercises
- `machine.png` - General gym machines
- `bench.png` - Bench exercises
- `pullup-bar.png` - Pull-up bar exercises
- `medicine-ball.png` - Medicine ball exercises
- `trx.png` - TRX suspension trainer
- `yoga-mat.png` - Yoga mat exercises
- `stability-ball.png` - Stability ball exercises
- `foam-roller.png` - Foam roller exercises
- `weight-plate.png` - Weight plate exercises
- `ez-bar.png` - EZ bar exercises
- `trap-bar.png` - Trap bar exercises
- `suspension-trainer.png` - Suspension trainer
- `box.png` - Box/plyometric exercises
- `step.png` - Step exercises
- `default.png` - Default fallback icon

## Icon Specifications

- **Size**: 32x32 pixels (displayed at 32x32px)
- **Format**: PNG with transparent background
- **Style**: Simple, clean icons with good contrast
- **Color**: Preferably monochrome or simple colors

## Adding New Equipment Icons

1. Add the new equipment type to the `getEquipmentIcon` function in `WorkoutCart.vue`
2. Add the corresponding PNG file to this directory
3. Follow the naming convention: `equipment-name.png` (lowercase, hyphens for spaces)

## Fallback

If an equipment icon is not found, the system will display `default.png` as a fallback.
