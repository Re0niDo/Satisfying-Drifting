/**
 * Centralized asset key constants and path mappings.
 * All asset loading should reference these constants instead of hardcoded strings.
 */

export const AssetKeys = {
    // Sprites
    CAR: 'car',
    PARTICLE: 'particle',
    
    // Tracks
    TRACK_TUTORIAL: 'track_tutorial',
    TRACK_SERPENTINE: 'track_serpentine',
    TRACK_HAIRPIN: 'track_hairpin',
    TRACK_GAUNTLET: 'track_gauntlet',
    TRACK_SANDBOX: 'track_sandbox',
    
    // UI Elements
    BUTTON: 'button',
    METER_BAR: 'meter_bar',
    
    // Audio - SFX
    SFX_TIRE_SCREECH: 'sfx_tire_screech',
    SFX_ENGINE: 'sfx_engine',
    SFX_UI_CLICK: 'sfx_ui_click',
    SFX_PERFECT_DRIFT: 'sfx_perfect_drift',
    
    // Audio - Music
    MUSIC_MENU: 'music_menu',
    MUSIC_GAMEPLAY: 'music_gameplay'
} as const;

export const AssetPaths = {
    // Sprites
    [AssetKeys.CAR]: 'assets/images/sprites/car-placeholder.png',
    [AssetKeys.PARTICLE]: 'assets/images/sprites/particle-placeholder.png',
    
    // Tracks
    [AssetKeys.TRACK_TUTORIAL]: 'assets/images/tracks/track-placeholder.png',
    [AssetKeys.TRACK_SERPENTINE]: 'assets/images/tracks/track-placeholder.png',
    [AssetKeys.TRACK_HAIRPIN]: 'assets/images/tracks/track-placeholder.png',
    [AssetKeys.TRACK_GAUNTLET]: 'assets/images/tracks/track-placeholder.png',
    [AssetKeys.TRACK_SANDBOX]: 'assets/images/tracks/track-placeholder.png',
    
    // UI Elements
    [AssetKeys.BUTTON]: 'assets/images/ui/button-placeholder.png',
    [AssetKeys.METER_BAR]: 'assets/images/ui/meter-bar-placeholder.png',
    
    // Audio - SFX
    [AssetKeys.SFX_TIRE_SCREECH]: 'assets/audio/sfx/tire-screech-placeholder.mp3',
    [AssetKeys.SFX_ENGINE]: 'assets/audio/sfx/engine-placeholder.mp3',
    [AssetKeys.SFX_UI_CLICK]: 'assets/audio/sfx/ui-click-placeholder.mp3',
    [AssetKeys.SFX_PERFECT_DRIFT]: 'assets/audio/sfx/perfect-drift-placeholder.mp3',
    
    // Audio - Music
    [AssetKeys.MUSIC_MENU]: 'assets/audio/music/bgm-placeholder.mp3',
    [AssetKeys.MUSIC_GAMEPLAY]: 'assets/audio/music/bgm-placeholder.mp3'
} as const;

/**
 * Asset type enumeration for type-safe asset loading
 */
export enum AssetType {
    IMAGE = 'image',
    AUDIO = 'audio',
    SPRITESHEET = 'spritesheet',
    JSON = 'json'
}

/**
 * Helper function to get asset path by key
 */
export function getAssetPath(key: string): string {
    return AssetPaths[key as keyof typeof AssetPaths] || '';
}
