# 3D Models Directory

This directory is for storing 3D models used in the workout planner.

## Supported Formats

- **GLTF/GLB** (Recommended) - Best for web, supports animations
- **OBJ** - Simple geometry, widely supported
- **FBX** - Good for complex models, may need conversion

## How to Add the TurboSquid Model

1. **Purchase the model** from TurboSquid:
   - Go to: https://www.turbosquid.com/3d-models/lean-body-slim-fit-male-anatomy-character-2439002
   - Purchase and download the model

2. **Convert to web format** (if needed):
   - If you get an FBX file, convert to GLTF using:
     - Blender (free)
     - Online converters
     - Three.js FBXLoader (but GLTF is better)

3. **Place the model file** in this directory:
   ```
   public/models/
   ├── human-anatomy.glb (or .gltf)
   └── README.md
   ```

4. **Update the model path** in the component:
   ```javascript
   // In ExternalModel3D.vue
   modelPath: '/models/human-anatomy.glb'
   ```

## Model Requirements

- **File size**: Keep under 10MB for web performance
- **Polygon count**: Under 50k triangles for smooth performance
- **Textures**: Include texture files if the model uses them
- **Naming**: Use descriptive names for muscle groups

## Example Model Structure

```
public/models/
├── human-anatomy.glb          # Main model file
├── human-anatomy-textures/    # Texture folder (if needed)
│   ├── skin.jpg
│   ├── muscle.jpg
│   └── bone.jpg
└── README.md
```

## Testing

1. Place your model file in this directory
2. Update the `modelPath` prop in `ExternalModel3D.vue`
3. The model should load automatically when you select "External Model"
