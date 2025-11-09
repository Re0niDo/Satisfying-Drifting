/**
 * Unit tests for TrackTypes type definitions
 */

import { Vector2, ISpawnPoint, ITrackDriveArea, TrackDifficulty, ITrackConfig } from '../../src/types/TrackTypes';

describe('TrackTypes', () => {
    describe('Vector2', () => {
        it('should accept valid coordinates', () => {
            const vector: Vector2 = { x: 100, y: 200 };
            expect(vector.x).toBe(100);
            expect(vector.y).toBe(200);
        });

        it('should allow negative coordinates', () => {
            const vector: Vector2 = { x: -50, y: -75 };
            expect(vector.x).toBe(-50);
            expect(vector.y).toBe(-75);
        });

        it('should allow zero coordinates', () => {
            const vector: Vector2 = { x: 0, y: 0 };
            expect(vector.x).toBe(0);
            expect(vector.y).toBe(0);
        });
    });

    describe('ISpawnPoint', () => {
        it('should have position and angle properties', () => {
            const spawnPoint: ISpawnPoint = { x: 640, y: 360, angle: 0 };
            expect(spawnPoint.x).toBe(640);
            expect(spawnPoint.y).toBe(360);
            expect(spawnPoint.angle).toBe(0);
        });

        it('should accept various angle values', () => {
            const spawn90: ISpawnPoint = { x: 100, y: 100, angle: 90 };
            const spawn180: ISpawnPoint = { x: 100, y: 100, angle: 180 };
            const spawn270: ISpawnPoint = { x: 100, y: 100, angle: 270 };
            
            expect(spawn90.angle).toBe(90);
            expect(spawn180.angle).toBe(180);
            expect(spawn270.angle).toBe(270);
        });

        it('should allow negative angles', () => {
            const spawnPoint: ISpawnPoint = { x: 100, y: 100, angle: -45 };
            expect(spawnPoint.angle).toBe(-45);
        });
    });

    describe('ITrackDriveArea', () => {
        it('should have outer boundary array', () => {
            const driveArea: ITrackDriveArea = {
                outerBoundary: [
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                    { x: 100, y: 100 },
                    { x: 0, y: 100 }
                ]
            };
            
            expect(driveArea.outerBoundary).toHaveLength(4);
            expect(driveArea.outerBoundary[0]).toEqual({ x: 0, y: 0 });
        });

        it('should optionally have inner boundaries', () => {
            const driveArea: ITrackDriveArea = {
                outerBoundary: [
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                    { x: 100, y: 100 }
                ],
                innerBoundaries: [
                    [
                        { x: 25, y: 25 },
                        { x: 75, y: 25 },
                        { x: 75, y: 75 }
                    ]
                ]
            };
            
            expect(driveArea.innerBoundaries).toBeDefined();
            expect(driveArea.innerBoundaries).toHaveLength(1);
            expect(driveArea.innerBoundaries![0]).toHaveLength(3);
        });

        it('should allow no inner boundaries', () => {
            const driveArea: ITrackDriveArea = {
                outerBoundary: [
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                    { x: 100, y: 100 }
                ]
            };
            
            expect(driveArea.innerBoundaries).toBeUndefined();
        });
    });

    describe('TrackDifficulty', () => {
        it('should have 5 difficulty levels', () => {
            const difficulties = Object.values(TrackDifficulty);
            expect(difficulties).toHaveLength(5);
        });

        it('should have correct enum values', () => {
            expect(TrackDifficulty.Tutorial).toBe('TUTORIAL');
            expect(TrackDifficulty.Easy).toBe('EASY');
            expect(TrackDifficulty.Medium).toBe('MEDIUM');
            expect(TrackDifficulty.Hard).toBe('HARD');
            expect(TrackDifficulty.Sandbox).toBe('SANDBOX');
        });

        it('should be usable in track configs', () => {
            const difficulty: TrackDifficulty = TrackDifficulty.Tutorial;
            expect(difficulty).toBe('TUTORIAL');
        });
    });

    describe('ITrackConfig', () => {
        it('should have all required identification properties', () => {
            const trackConfig: ITrackConfig = {
                id: 'test-track',
                name: 'Test Track',
                description: 'A test track',
                difficulty: TrackDifficulty.Tutorial,
                imageKey: 'track_test',
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
                minimumQuality: 50
            };

            expect(trackConfig.id).toBe('test-track');
            expect(trackConfig.name).toBe('Test Track');
            expect(trackConfig.description).toBe('A test track');
            expect(trackConfig.difficulty).toBe(TrackDifficulty.Tutorial);
        });

        it('should have asset reference properties', () => {
            const trackConfig: ITrackConfig = {
                id: 'test-track',
                name: 'Test Track',
                description: 'A test track',
                difficulty: TrackDifficulty.Easy,
                imageKey: 'track_test',
                thumbnailKey: 'track_test_thumb',
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
                minimumQuality: 50
            };

            expect(trackConfig.imageKey).toBe('track_test');
            expect(trackConfig.thumbnailKey).toBe('track_test_thumb');
        });

        it('should have geometry properties', () => {
            const trackConfig: ITrackConfig = {
                id: 'test-track',
                name: 'Test Track',
                description: 'A test track',
                difficulty: TrackDifficulty.Medium,
                imageKey: 'track_test',
                width: 150,
                driveArea: {
                    outerBoundary: [
                        { x: 0, y: 0 },
                        { x: 100, y: 0 },
                        { x: 100, y: 100 }
                    ]
                },
                spawnPoint: { x: 50, y: 50, angle: 45 },
                optimalTime: 30,
                minimumQuality: 50
            };

            expect(trackConfig.width).toBe(150);
            expect(trackConfig.driveArea.outerBoundary).toHaveLength(3);
            expect(trackConfig.spawnPoint).toEqual({ x: 50, y: 50, angle: 45 });
        });

        it('should have gameplay parameters', () => {
            const trackConfig: ITrackConfig = {
                id: 'test-track',
                name: 'Test Track',
                description: 'A test track',
                difficulty: TrackDifficulty.Hard,
                imageKey: 'track_test',
                width: 150,
                driveArea: {
                    outerBoundary: [
                        { x: 0, y: 0 },
                        { x: 100, y: 0 },
                        { x: 100, y: 100 }
                    ]
                },
                spawnPoint: { x: 50, y: 50, angle: 0 },
                optimalTime: 45,
                minimumQuality: 75
            };

            expect(trackConfig.optimalTime).toBe(45);
            expect(trackConfig.minimumQuality).toBe(75);
        });

        it('should optionally have unlock requirement', () => {
            const trackConfig: ITrackConfig = {
                id: 'advanced-track',
                name: 'Advanced Track',
                description: 'An advanced track',
                difficulty: TrackDifficulty.Hard,
                imageKey: 'track_advanced',
                width: 150,
                driveArea: {
                    outerBoundary: [
                        { x: 0, y: 0 },
                        { x: 100, y: 0 },
                        { x: 100, y: 100 }
                    ]
                },
                spawnPoint: { x: 50, y: 50, angle: 0 },
                optimalTime: 45,
                minimumQuality: 75,
                unlockRequirement: 'tutorial-circuit'
            };

            expect(trackConfig.unlockRequirement).toBe('tutorial-circuit');
        });

        it('should optionally have future feature properties', () => {
            const trackConfig: ITrackConfig = {
                id: 'feature-track',
                name: 'Feature Track',
                description: 'A track with future features',
                difficulty: TrackDifficulty.Sandbox,
                imageKey: 'track_feature',
                width: 150,
                driveArea: {
                    outerBoundary: [
                        { x: 0, y: 0 },
                        { x: 100, y: 0 },
                        { x: 100, y: 100 }
                    ]
                },
                spawnPoint: { x: 50, y: 50, angle: 0 },
                optimalTime: 60,
                minimumQuality: 0,
                checkpoints: [
                    { x: 25, y: 25 },
                    { x: 75, y: 75 }
                ],
                decorations: [
                    { x: 10, y: 10 },
                    { x: 90, y: 90 }
                ],
                weatherEffects: 'rain'
            };

            expect(trackConfig.checkpoints).toHaveLength(2);
            expect(trackConfig.decorations).toHaveLength(2);
            expect(trackConfig.weatherEffects).toBe('rain');
        });

        it('should compile in TypeScript strict mode', () => {
            // This test passes if TypeScript compilation succeeds
            const trackConfig: ITrackConfig = {
                id: 'strict-mode-test',
                name: 'Strict Mode Test',
                description: 'Test strict mode compliance',
                difficulty: TrackDifficulty.Tutorial,
                imageKey: 'track_strict',
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
                minimumQuality: 50
            };

            expect(trackConfig).toBeDefined();
        });
    });
});
