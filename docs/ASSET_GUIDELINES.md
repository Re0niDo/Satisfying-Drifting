# Asset Guidelines for Satisfying Drifting

## Directory Structure

```
assets/
├── images/
│   ├── sprites/          # Game object sprites (car, particles)
│   ├── tracks/           # Track background images
│   └── ui/               # UI elements (buttons, meters, icons)
├── audio/
│   ├── sfx/              # Sound effects (tire screech, engine, UI)
│   └── music/            # Background music (menu, gameplay)
└── data/                 # JSON data files (track configs)
```

## Naming Conventions

### Images
- **Format:** PNG (lossless, transparency support)
- **Naming:** lowercase-with-dashes.png
- **Examples:**
  - `car-sprite.png`
  - `track-tutorial.png`
  - `button-start.png`
  - `particle-smoke.png`

### Audio
- **Format:** MP3 (wide browser support)
- **Naming:** lowercase-with-dashes.mp3
- **Examples:**
  - `tire-screech-loop.mp3`
  - `engine-rev.mp3`
  - `ui-click.mp3`
  - `bgm-gameplay.mp3`

### Sprites
- **Car Sprite:** 64x64px (or higher for detail), centered, facing right (0°)
- **Particle Texture:** 16x16px, white circle with alpha falloff
- **UI Elements:** 2x resolution for retina displays (scale down in code)

### Audio
- **SFX:** Mono, 22kHz-44kHz, loopable where needed
- **Music:** Stereo, 44kHz, OGG preferred (MP3 fallback)
- **Max Duration:** SFX < 5s, Music < 3 minutes

## Placeholder Assets (Current)

All placeholder assets are intentionally simple to:
1. Enable development without waiting for final art
2. Keep file sizes minimal for fast iteration
3. Clearly indicate "work in progress" status

### Replacing Placeholders

To replace a placeholder asset:
1. Create new asset following specifications above
2. Save with same filename as placeholder (or update AssetConfig.ts)
3. Place in same directory
4. Refresh browser - no code changes needed (paths use constants)

## Asset Optimization

### Images
- Use PNG for sprites (transparency)
- Use JPEG for large backgrounds (no transparency)
- Optimize with tools: TinyPNG, ImageOptim, or Squoosh
- Target: < 100KB per image, < 500KB per track background

### Audio
- Use OGG Vorbis for best quality/size ratio
- Provide MP3 fallback for Safari compatibility
- Loop points: Ensure seamless loops (use Audacity markers)
- Target: < 50KB per SFX, < 200KB per music track

## Asset Integration Checklist

When adding a new asset:
- [ ] Add asset file to appropriate directory
- [ ] Add asset key constant to `AssetConfig.ts` (AssetKeys)
- [ ] Add asset path to `AssetConfig.ts` (AssetPaths)
- [ ] Load asset in PreloadScene using asset key constant
- [ ] Reference asset in game code using asset key constant
- [ ] Test asset loads correctly in development build
- [ ] Verify no console errors related to asset loading

## Technical Specifications

### Image Specifications

| Asset Type | Dimensions | Format | Notes |
|------------|------------|--------|-------|
| Car Sprite | 64x64px | PNG | Centered, facing right (0°) |
| Particle | 16x16px | PNG | White circle, alpha gradient |
| Track Background | 1280x720px | PNG/JPEG | Match game resolution |
| UI Button | 200x60px | PNG | 2x for retina (400x120px) |
| Meter Bar | 300x30px | PNG | Horizontal bar, border |

### Audio Specifications

| Asset Type | Duration | Format | Sample Rate | Channels |
|------------|----------|--------|-------------|----------|
| Tire Screech | 1-3s (loop) | MP3/OGG | 22-44kHz | Mono |
| Engine Sound | 1-2s (loop) | MP3/OGG | 22-44kHz | Mono |
| UI Click | 0.1-0.3s | MP3/OGG | 22kHz | Mono |
| Perfect Drift | 0.3-0.5s | MP3/OGG | 44kHz | Mono |
| Background Music | 30-180s (loop) | MP3/OGG | 44kHz | Stereo |

## Asset Loading Strategy

### Priority Levels

1. **Critical Assets** (BootScene)
   - Essential UI elements
   - Loading screen graphics
   - Target: < 100KB total

2. **Gameplay Assets** (PreloadScene)
   - Car sprites
   - Particle textures
   - Current track background
   - Essential SFX
   - Target: < 2MB total

3. **Lazy-Loaded Assets**
   - Other track backgrounds (load on demand)
   - Optional music tracks
   - Achievement icons

### Preloading Best Practices

```typescript
// In PreloadScene.ts
import { AssetKeys, AssetPaths, getAssetPath } from '../config/AssetConfig';

// Load images
this.load.image(AssetKeys.CAR, getAssetPath(AssetKeys.CAR));
this.load.image(AssetKeys.PARTICLE, getAssetPath(AssetKeys.PARTICLE));

// Load audio with fallbacks
this.load.audio(AssetKeys.SFX_TIRE_SCREECH, [
    getAssetPath(AssetKeys.SFX_TIRE_SCREECH).replace('.mp3', '.ogg'),
    getAssetPath(AssetKeys.SFX_TIRE_SCREECH)
]);
```

## Asset Creation Tools

### Recommended Tools

**Image Creation:**
- **Free:** GIMP, Krita, Paint.NET
- **Paid:** Photoshop, Affinity Photo
- **Pixel Art:** Aseprite, Piskel
- **Vector:** Inkscape, Figma

**Audio Creation:**
- **Free:** Audacity, LMMS, Bfxr (SFX)
- **Paid:** Ableton Live, FL Studio
- **Online:** FreeSound.org, Incompetech (music)

**Optimization:**
- **Images:** TinyPNG, Squoosh, ImageOptim
- **Audio:** Audacity (export settings), FFmpeg

## Version Control

### What to Commit

- ✅ All placeholder assets (small file sizes)
- ✅ Final optimized assets
- ✅ Asset configuration files (AssetConfig.ts)
- ✅ Asset documentation

### What NOT to Commit

- ❌ Unoptimized source files (PSD, AI, WAV)
- ❌ Temporary/test assets
- ❌ Assets over 1MB without review

Store large source files in cloud storage (Google Drive, Dropbox) and reference in documentation.

## Performance Guidelines

### Mobile Optimization

- Keep total asset payload < 5MB for initial load
- Use texture atlases to reduce draw calls
- Compress audio aggressively (22kHz mono for SFX)
- Lazy-load non-critical assets

### Desktop Optimization

- Higher quality assets allowed (< 10MB total)
- Can use larger textures (2048x2048 max)
- Stereo audio at 44kHz acceptable
- Pre-cache all gameplay assets

## Troubleshooting

### Asset Not Loading

1. Check console for 404 errors
2. Verify file path in AssetConfig.ts matches actual file location
3. Ensure asset key is spelled correctly
4. Check file extension is correct (.png not .PNG)

### Asset Looks Wrong

1. Verify dimensions match specifications
2. Check if transparency is preserved (use PNG)
3. Ensure asset is optimized (not corrupted)
4. Test in multiple browsers

### Audio Not Playing

1. Check browser console for audio errors
2. Verify audio format (MP3 widely supported)
3. Test if audio autoplay is blocked (user interaction needed)
4. Provide multiple formats (OGG + MP3 fallback)

## Asset Roadmap

### Phase 1: Placeholders (Current)
- Minimal 1x1 pixel placeholders
- Enable basic development
- Total size: < 50KB

### Phase 2: Stylized Placeholders (Week 2-3)
- Simple but recognizable shapes
- Basic colors and indicators
- Total size: < 500KB

### Phase 3: Final Assets (Week 4+)
- Professional art and audio
- Optimized for performance
- Total size: < 5MB

## Contact

For questions about asset specifications or to contribute assets, contact the team lead or post in the project Discord #assets channel.

---

**Last Updated:** October 30, 2025  
**Version:** 1.0  
**Maintained By:** Game Developer Team
