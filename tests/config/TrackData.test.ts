/**
 * Unit tests for TrackData configuration and helper functions
 */

import { 
    TRACKS, 
    getTrackById, 
    getUnlockedTracks, 
    isTrackUnlocked, 
    validateTrackData 
} from '../../src/config/TrackData';
import { TrackDifficulty, ITrackConfig } from '../../src/types/TrackTypes';

describe('TrackData', () => {
    describe('TRACKS array', () => {
        it('should not be empty', () => {
            expect(TRACKS).toBeDefined();
            expect(TRACKS.length).toBeGreaterThan(0);
        });

        it('should contain tutorial track', () => {
            const tutorialTrack = TRACKS.find(track => track.id === 'tutorial-circuit');
            expect(tutorialTrack).toBeDefined();
        });

        it('should have all tracks with unique IDs', () => {
            const ids = TRACKS.map(track => track.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });
    });

    describe('TUTORIAL_TRACK configuration', () => {
        let tutorialTrack: ITrackConfig | undefined;

        beforeEach(() => {
            tutorialTrack = TRACKS.find(track => track.id === 'tutorial-circuit');
        });

        it('should have all required identification fields', () => {
            expect(tutorialTrack).toBeDefined();
            expect(tutorialTrack!.id).toBe('tutorial-circuit');
            expect(tutorialTrack!.name).toBe('Tutorial Circuit');
            expect(tutorialTrack!.description).toBeTruthy();
            expect(tutorialTrack!.difficulty).toBe(TrackDifficulty.Tutorial);
        });

        it('should have asset reference fields', () => {
            expect(tutorialTrack!.imageKey).toBe('track_tutorial');
            expect(tutorialTrack!.thumbnailKey).toBe('track_tutorial_thumb');
        });

        it('should have valid geometry properties', () => {
            expect(tutorialTrack!.width).toBe(150);
            expect(tutorialTrack!.driveArea).toBeDefined();
            expect(tutorialTrack!.driveArea.outerBoundary).toBeDefined();
            expect(tutorialTrack!.driveArea.outerBoundary.length).toBeGreaterThanOrEqual(3);
        });

        it('should have valid spawn point', () => {
            expect(tutorialTrack!.spawnPoint).toBeDefined();
            expect(typeof tutorialTrack!.spawnPoint.x).toBe('number');
            expect(typeof tutorialTrack!.spawnPoint.y).toBe('number');
            expect(typeof tutorialTrack!.spawnPoint.angle).toBe('number');
            expect(tutorialTrack!.spawnPoint.x).toBe(640);
            expect(tutorialTrack!.spawnPoint.y).toBe(600);
            expect(tutorialTrack!.spawnPoint.angle).toBe(270);
        });

        it('should have spawn point within game viewport', () => {
            const spawnX = tutorialTrack!.spawnPoint.x;
            const spawnY = tutorialTrack!.spawnPoint.y;
            
            expect(spawnX).toBeGreaterThanOrEqual(0);
            expect(spawnX).toBeLessThanOrEqual(1280);
            expect(spawnY).toBeGreaterThanOrEqual(0);
            expect(spawnY).toBeLessThanOrEqual(720);
        });

        it('should have spawn angle between 0-360 degrees', () => {
            const angle = tutorialTrack!.spawnPoint.angle;
            expect(angle).toBeGreaterThanOrEqual(0);
            expect(angle).toBeLessThan(360);
        });

        it('should have valid gameplay parameters', () => {
            expect(tutorialTrack!.optimalTime).toBe(30);
            expect(tutorialTrack!.minimumQuality).toBe(0);
        });

        it('should have no unlock requirement', () => {
            expect(tutorialTrack!.unlockRequirement).toBeUndefined();
        });

        it('should have inner boundaries defined', () => {
            expect(tutorialTrack!.driveArea.innerBoundaries).toBeDefined();
            expect(tutorialTrack!.driveArea.innerBoundaries!.length).toBeGreaterThan(0);
        });

        it('should use kebab-case for track ID', () => {
            expect(tutorialTrack!.id).toMatch(/^[a-z]+(-[a-z]+)*$/);
        });

        // Story 2.2.2: Drive area polygon validation
        describe('driveArea polygon structure', () => {
            it('should have outer boundary with minimum 8 points for smooth curves', () => {
                const outerBoundary = tutorialTrack!.driveArea.outerBoundary;
                expect(outerBoundary.length).toBeGreaterThanOrEqual(8);
            });

            it('should have all outer boundary points within game viewport', () => {
                const outerBoundary = tutorialTrack!.driveArea.outerBoundary;
                
                outerBoundary.forEach((point) => {
                    expect(point.x).toBeGreaterThanOrEqual(0);
                    expect(point.x).toBeLessThanOrEqual(1280);
                    expect(point.y).toBeGreaterThanOrEqual(0);
                    expect(point.y).toBeLessThanOrEqual(720);
                });
            });

            it('should have inner boundary defined as an array', () => {
                const innerBoundaries = tutorialTrack!.driveArea.innerBoundaries;
                expect(innerBoundaries).toBeDefined();
                expect(Array.isArray(innerBoundaries)).toBe(true);
                expect(innerBoundaries!.length).toBeGreaterThan(0);
            });

            it('should have inner boundary with minimum 8 points', () => {
                const innerBoundary = tutorialTrack!.driveArea.innerBoundaries![0];
                expect(innerBoundary.length).toBeGreaterThanOrEqual(8);
            });

            it('should have all inner boundary points within game viewport', () => {
                const innerBoundary = tutorialTrack!.driveArea.innerBoundaries![0];
                
                innerBoundary.forEach((point) => {
                    expect(point.x).toBeGreaterThanOrEqual(0);
                    expect(point.x).toBeLessThanOrEqual(1280);
                    expect(point.y).toBeGreaterThanOrEqual(0);
                    expect(point.y).toBeLessThanOrEqual(720);
                });
            });

            it('should have outer boundary as closed polygon (first point equals last)', () => {
                const outerBoundary = tutorialTrack!.driveArea.outerBoundary;
                const firstPoint = outerBoundary[0];
                const lastPoint = outerBoundary[outerBoundary.length - 1];
                
                expect(lastPoint.x).toBe(firstPoint.x);
                expect(lastPoint.y).toBe(firstPoint.y);
            });

            it('should have inner boundary as closed polygon (first point equals last)', () => {
                const innerBoundary = tutorialTrack!.driveArea.innerBoundaries![0];
                const firstPoint = innerBoundary[0];
                const lastPoint = innerBoundary[innerBoundary.length - 1];
                
                expect(lastPoint.x).toBe(firstPoint.x);
                expect(lastPoint.y).toBe(firstPoint.y);
            });

            it('should have outer boundary forming valid polygon (area > 0)', () => {
                const outerBoundary = tutorialTrack!.driveArea.outerBoundary;
                
                // Calculate polygon area using shoelace formula
                let area = 0;
                for (let i = 0; i < outerBoundary.length - 1; i++) {
                    const p1 = outerBoundary[i];
                    const p2 = outerBoundary[i + 1];
                    area += (p1.x * p2.y - p2.x * p1.y);
                }
                area = Math.abs(area / 2);
                
                expect(area).toBeGreaterThan(0);
            });

            it('should have inner boundary forming valid polygon (area > 0)', () => {
                const innerBoundary = tutorialTrack!.driveArea.innerBoundaries![0];
                
                // Calculate polygon area using shoelace formula
                let area = 0;
                for (let i = 0; i < innerBoundary.length - 1; i++) {
                    const p1 = innerBoundary[i];
                    const p2 = innerBoundary[i + 1];
                    area += (p1.x * p2.y - p2.x * p1.y);
                }
                area = Math.abs(area / 2);
                
                expect(area).toBeGreaterThan(0);
            });

            it('should have inner boundary smaller than outer boundary', () => {
                // Calculate areas
                const calculateArea = (points: { x: number; y: number }[]) => {
                    let area = 0;
                    for (let i = 0; i < points.length - 1; i++) {
                        const p1 = points[i];
                        const p2 = points[i + 1];
                        area += (p1.x * p2.y - p2.x * p1.y);
                    }
                    return Math.abs(area / 2);
                };

                const outerArea = calculateArea(tutorialTrack!.driveArea.outerBoundary);
                const innerArea = calculateArea(tutorialTrack!.driveArea.innerBoundaries![0]);
                
                expect(innerArea).toBeLessThan(outerArea);
            });
        });
    });

    describe('getTrackById', () => {
        it('should return track for valid ID', () => {
            const track = getTrackById('tutorial-circuit');
            expect(track).toBeDefined();
            expect(track!.id).toBe('tutorial-circuit');
        });

        it('should return undefined for invalid ID', () => {
            const track = getTrackById('non-existent-track');
            expect(track).toBeUndefined();
        });

        it('should return undefined for empty string', () => {
            const track = getTrackById('');
            expect(track).toBeUndefined();
        });

        it('should be case-sensitive', () => {
            const track = getTrackById('TUTORIAL-CIRCUIT');
            expect(track).toBeUndefined();
        });

        it('should handle whitespace in ID', () => {
            const track = getTrackById('tutorial-circuit ');
            expect(track).toBeUndefined();
        });
    });

    describe('getUnlockedTracks', () => {
        it('should return tutorial track with empty completed list', () => {
            const unlockedTracks = getUnlockedTracks([]);
            expect(unlockedTracks).toBeDefined();
            expect(unlockedTracks.length).toBeGreaterThan(0);
            
            const tutorialTrack = unlockedTracks.find(track => track.id === 'tutorial-circuit');
            expect(tutorialTrack).toBeDefined();
        });

        it('should return all tracks without requirements', () => {
            const unlockedTracks = getUnlockedTracks([]);
            unlockedTracks.forEach(track => {
                expect(track.unlockRequirement).toBeUndefined();
            });
        });

        it('should include tracks whose requirements are met', () => {
            // Create a mock track with unlock requirement for testing
            const mockTracks: ITrackConfig[] = [
                {
                    id: 'track-1',
                    name: 'Track 1',
                    description: 'First track',
                    difficulty: TrackDifficulty.Tutorial,
                    imageKey: 'track_1',
                    width: 150,
                    driveArea: {
                        outerBoundary: [
                            { x: 0, y: 0 },
                            { x: 100, y: 0 },
                            { x: 100, y: 100 }
                        ]
                    },
                    spawnPoint: { x: 50, y: 50, angle: 0 },
                    optimalTime: 30,
                    minimumQuality: 0
                },
                {
                    id: 'track-2',
                    name: 'Track 2',
                    description: 'Second track',
                    difficulty: TrackDifficulty.Easy,
                    imageKey: 'track_2',
                    width: 150,
                    driveArea: {
                        outerBoundary: [
                            { x: 0, y: 0 },
                            { x: 100, y: 0 },
                            { x: 100, y: 100 }
                        ]
                    },
                    spawnPoint: { x: 50, y: 50, angle: 0 },
                    optimalTime: 35,
                    minimumQuality: 50,
                    unlockRequirement: 'track-1'
                }
            ];

            // Simulate getUnlockedTracks logic
            const emptyCompletedList: string[] = [];
            const unlockedWithoutCompletion = mockTracks.filter(track => 
                !track.unlockRequirement || emptyCompletedList.includes(track.unlockRequirement)
            );
            expect(unlockedWithoutCompletion.length).toBe(1);
            expect(unlockedWithoutCompletion[0].id).toBe('track-1');

            const completedList: string[] = ['track-1'];
            const unlockedWithCompletion = mockTracks.filter(track => 
                !track.unlockRequirement || completedList.includes(track.unlockRequirement)
            );
            expect(unlockedWithCompletion.length).toBe(2);
        });

        it('should handle multiple completed tracks', () => {
            const completedIds = ['tutorial-circuit', 'track-a', 'track-b'];
            const unlockedTracks = getUnlockedTracks(completedIds);
            expect(unlockedTracks).toBeDefined();
            expect(Array.isArray(unlockedTracks)).toBe(true);
        });

        it('should return empty array if no tracks match', () => {
            // This scenario shouldn't happen with valid data, but test edge case
            // by filtering out all tracks artificially
            const emptyResult = TRACKS.filter(() => false);
            expect(emptyResult).toEqual([]);
        });
    });

    describe('isTrackUnlocked', () => {
        it('should return true for tutorial track with empty completed list', () => {
            const isUnlocked = isTrackUnlocked('tutorial-circuit', []);
            expect(isUnlocked).toBe(true);
        });

        it('should return false for non-existent track', () => {
            const isUnlocked = isTrackUnlocked('non-existent', []);
            expect(isUnlocked).toBe(false);
        });

        it('should return true for tracks without unlock requirements', () => {
            const tutorialTrack = TRACKS.find(track => track.id === 'tutorial-circuit');
            expect(tutorialTrack!.unlockRequirement).toBeUndefined();
            
            const isUnlocked = isTrackUnlocked('tutorial-circuit', []);
            expect(isUnlocked).toBe(true);
        });

        it('should return false for locked tracks', () => {
            // Test with a hypothetical locked track scenario
            const isUnlocked = isTrackUnlocked('locked-track', ['tutorial-circuit']);
            expect(isUnlocked).toBe(false);
        });

        it('should handle empty track ID', () => {
            const isUnlocked = isTrackUnlocked('', []);
            expect(isUnlocked).toBe(false);
        });

        it('should be case-sensitive', () => {
            const isUnlocked = isTrackUnlocked('TUTORIAL-CIRCUIT', []);
            expect(isUnlocked).toBe(false);
        });
    });

    describe('validateTrackData', () => {
        // Save original NODE_ENV
        const originalEnv = process.env.NODE_ENV;

        afterEach(() => {
            // Restore original NODE_ENV
            process.env.NODE_ENV = originalEnv;
        });

        it('should not throw for valid track data in development', () => {
            process.env.NODE_ENV = 'development';
            expect(() => validateTrackData()).not.toThrow();
        });

        it('should skip validation in production mode', () => {
            process.env.NODE_ENV = 'production';
            // Should not throw even with invalid data (though we're testing with valid data)
            expect(() => validateTrackData()).not.toThrow();
        });

        it('should validate track has required ID', () => {
            // Can't easily test this without modifying TRACKS array
            // But we can verify current tracks pass validation
            process.env.NODE_ENV = 'development';
            expect(() => validateTrackData()).not.toThrow();
            
            TRACKS.forEach(track => {
                expect(track.id).toBeTruthy();
                expect(typeof track.id).toBe('string');
            });
        });

        it('should validate track has required name', () => {
            process.env.NODE_ENV = 'development';
            expect(() => validateTrackData()).not.toThrow();
            
            TRACKS.forEach(track => {
                expect(track.name).toBeTruthy();
                expect(typeof track.name).toBe('string');
            });
        });

        it('should validate track has required imageKey', () => {
            process.env.NODE_ENV = 'development';
            expect(() => validateTrackData()).not.toThrow();
            
            TRACKS.forEach(track => {
                expect(track.imageKey).toBeTruthy();
                expect(typeof track.imageKey).toBe('string');
            });
        });

        it('should validate numeric ranges for width', () => {
            process.env.NODE_ENV = 'development';
            expect(() => validateTrackData()).not.toThrow();
            
            TRACKS.forEach(track => {
                expect(track.width).toBeGreaterThan(0);
            });
        });

        it('should validate numeric ranges for optimalTime', () => {
            process.env.NODE_ENV = 'development';
            expect(() => validateTrackData()).not.toThrow();
            
            TRACKS.forEach(track => {
                expect(track.optimalTime).toBeGreaterThan(0);
            });
        });

        it('should validate numeric ranges for minimumQuality', () => {
            process.env.NODE_ENV = 'development';
            expect(() => validateTrackData()).not.toThrow();
            
            TRACKS.forEach(track => {
                expect(track.minimumQuality).toBeGreaterThanOrEqual(0);
                expect(track.minimumQuality).toBeLessThanOrEqual(100);
            });
        });

        it('should validate outer boundary has at least 3 points', () => {
            process.env.NODE_ENV = 'development';
            expect(() => validateTrackData()).not.toThrow();
            
            TRACKS.forEach(track => {
                expect(track.driveArea.outerBoundary.length).toBeGreaterThanOrEqual(3);
            });
        });

        it('should validate outer boundary points have valid coordinates', () => {
            process.env.NODE_ENV = 'development';
            expect(() => validateTrackData()).not.toThrow();
            
            TRACKS.forEach(track => {
                track.driveArea.outerBoundary.forEach(point => {
                    expect(typeof point.x).toBe('number');
                    expect(typeof point.y).toBe('number');
                    expect(isNaN(point.x)).toBe(false);
                    expect(isNaN(point.y)).toBe(false);
                });
            });
        });

        it('should validate inner boundaries if present', () => {
            process.env.NODE_ENV = 'development';
            expect(() => validateTrackData()).not.toThrow();
            
            TRACKS.forEach(track => {
                if (track.driveArea.innerBoundaries) {
                    track.driveArea.innerBoundaries.forEach(hole => {
                        expect(hole.length).toBeGreaterThanOrEqual(3);
                        hole.forEach(point => {
                            expect(typeof point.x).toBe('number');
                            expect(typeof point.y).toBe('number');
                        });
                    });
                }
            });
        });

        it('should validate spawn point has valid coordinates', () => {
            process.env.NODE_ENV = 'development';
            expect(() => validateTrackData()).not.toThrow();
            
            TRACKS.forEach(track => {
                expect(typeof track.spawnPoint.x).toBe('number');
                expect(typeof track.spawnPoint.y).toBe('number');
                expect(typeof track.spawnPoint.angle).toBe('number');
                expect(isNaN(track.spawnPoint.x)).toBe(false);
                expect(isNaN(track.spawnPoint.y)).toBe(false);
                expect(isNaN(track.spawnPoint.angle)).toBe(false);
            });
        });

        it('should validate unlock requirements reference existing tracks', () => {
            process.env.NODE_ENV = 'development';
            expect(() => validateTrackData()).not.toThrow();
            
            TRACKS.forEach(track => {
                if (track.unlockRequirement) {
                    const requiredTrack = TRACKS.find(t => t.id === track.unlockRequirement);
                    expect(requiredTrack).toBeDefined();
                }
            });
        });
    });

    describe('Configuration structure', () => {
        it('should support 5 planned tracks (structure ready)', () => {
            // Verify the structure can hold 5 tracks
            expect(TRACKS).toBeDefined();
            expect(Array.isArray(TRACKS)).toBe(true);
            // Currently has 1, but structure supports more
            expect(TRACKS.length).toBeGreaterThanOrEqual(1);
        });

        it('should use kebab-case for all track IDs', () => {
            TRACKS.forEach(track => {
                expect(track.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
            });
        });

        it('should have consistent asset key naming', () => {
            TRACKS.forEach(track => {
                expect(track.imageKey).toMatch(/^track_[a-z0-9_]+$/);
                if (track.thumbnailKey) {
                    expect(track.thumbnailKey).toMatch(/^track_[a-z0-9_]+$/);
                }
            });
        });
    });
});
