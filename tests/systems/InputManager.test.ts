/**
 * Unit tests for InputManager singleton
 */

import Phaser from 'phaser';
import { InputManager } from '../../src/systems/InputManager';
import { InputAction } from '../../src/types/InputTypes';

// Mock Phaser Key object
interface MockKey extends Partial<Phaser.Input.Keyboard.Key> {
  isDown: boolean;
  _justDown: boolean;
  _justUp: boolean;
}

function createMockKey(keyCode: string): MockKey {
  return {
    keyCode: keyCode.charCodeAt(0),
    isDown: false,
    _justDown: false,
    _justUp: false,
  };
}

// Mock Phaser.Input.Keyboard.JustDown before importing anything that uses it
if (!Phaser.Input) {
  (Phaser as any).Input = {};
}
if (!Phaser.Input.Keyboard) {
  (Phaser.Input as any).Keyboard = {};
}
if (!Phaser.Scenes) {
  (Phaser as any).Scenes = {};
}
if (!Phaser.Scenes.Events) {
  (Phaser.Scenes as any).Events = {
    SHUTDOWN: 'shutdown',
  };
}

const originalJustDown = Phaser.Input.Keyboard.JustDown;
Phaser.Input.Keyboard.JustDown = jest.fn((key: any) => {
  return key._justDown;
});

const originalJustUp = Phaser.Input.Keyboard.JustUp;
Phaser.Input.Keyboard.JustUp = jest.fn((key: any) => {
  return key._justUp;
});

// Mock scene helper
function createMockScene(): Phaser.Scene {
  const mockKeys: { [key: string]: MockKey } = {};
  
  const scene = {
    input: {
      keyboard: {
        addKey: jest.fn((code: string, _enableCapture?: boolean) => {
          if (!mockKeys[code]) {
            mockKeys[code] = createMockKey(code);
          }
          return mockKeys[code];
        }),
        removeKey: jest.fn((_key: MockKey) => {
          // Mock implementation
        }),
      },
    },
    time: {
      now: 0,
    },
    events: {
      once: jest.fn(),
      off: jest.fn(),
    },
  } as any;

  // Store mock keys on scene for test access
  (scene as any).mockKeys = mockKeys;
  
  return scene;
}

describe('InputManager Singleton', () => {
  let scene: Phaser.Scene;

  beforeEach(() => {
    scene = createMockScene();
    InputManager.destroyInstance();
  });

  afterEach(() => {
    InputManager.destroyInstance();
    jest.clearAllMocks();
  });

  it('should throw error if getInstance called without scene first', () => {
    expect(() => InputManager.getInstance()).toThrow(
      'InputManager: First call to getInstance must provide a scene'
    );
  });

  it('should create instance on first call with scene', () => {
    const instance = InputManager.getInstance(scene);
    expect(instance).toBeDefined();
    expect(InputManager.hasInstance()).toBe(true);
  });

  it('should return same instance on subsequent calls', () => {
    const instance1 = InputManager.getInstance(scene);
    const instance2 = InputManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should destroy instance when destroyInstance called', () => {
    InputManager.getInstance(scene);
    InputManager.destroyInstance();
    expect(InputManager.hasInstance()).toBe(false);
  });

  it('should register shutdown event listener on creation', () => {
    InputManager.getInstance(scene);
    expect(scene.events.once).toHaveBeenCalledWith(
      Phaser.Scenes.Events.SHUTDOWN,
      expect.any(Function),
      expect.anything()
    );
  });
});

describe('InputManager Input Detection', () => {
  let scene: Phaser.Scene;
  let input: InputManager;
  let mockKeys: { [key: string]: MockKey };

  beforeEach(() => {
    scene = createMockScene();
    mockKeys = (scene as any).mockKeys;
    input = InputManager.getInstance(scene);
  });

  afterEach(() => {
    InputManager.destroyInstance();
  });

  describe('Accelerate Input', () => {
    it('should detect W key accelerate input', () => {
      mockKeys['W'].isDown = true;
      input.update();
      expect(input.isAccelerating()).toBe(true);
    });

    it('should detect UP arrow accelerate input', () => {
      mockKeys['UP'].isDown = true;
      input.update();
      expect(input.isAccelerating()).toBe(true);
    });

    it('should return false when no accelerate keys pressed', () => {
      input.update();
      expect(input.isAccelerating()).toBe(false);
    });
  });

  describe('Brake Input', () => {
    it('should detect S key brake input', () => {
      mockKeys['S'].isDown = true;
      input.update();
      expect(input.isBraking()).toBe(true);
    });

    it('should detect DOWN arrow brake input', () => {
      mockKeys['DOWN'].isDown = true;
      input.update();
      expect(input.isBraking()).toBe(true);
    });
  });

  describe('Steering Input', () => {
    it('should detect A key steer left input', () => {
      mockKeys['A'].isDown = true;
      input.update();
      expect(input.isSteeringLeft()).toBe(true);
      expect(input.getSteeringAxis()).toBe(-1);
    });

    it('should detect D key steer right input', () => {
      mockKeys['D'].isDown = true;
      input.update();
      expect(input.isSteeringRight()).toBe(true);
      expect(input.getSteeringAxis()).toBe(1);
    });

    it('should detect LEFT arrow steer left input', () => {
      mockKeys['LEFT'].isDown = true;
      input.update();
      expect(input.getSteeringAxis()).toBe(-1);
    });

    it('should detect RIGHT arrow steer right input', () => {
      mockKeys['RIGHT'].isDown = true;
      input.update();
      expect(input.getSteeringAxis()).toBe(1);
    });

    it('should cancel opposite steering inputs', () => {
      mockKeys['A'].isDown = true;
      mockKeys['D'].isDown = true;
      input.update();
      expect(input.getSteeringAxis()).toBe(0);
    });

    it('should return 0 when no steering input', () => {
      input.update();
      expect(input.getSteeringAxis()).toBe(0);
    });
  });

  describe('Acceleration Axis', () => {
    it('should return 1 for accelerate', () => {
      mockKeys['W'].isDown = true;
      input.update();
      expect(input.getAccelerationAxis()).toBe(1);
    });

    it('should return -1 for brake', () => {
      mockKeys['S'].isDown = true;
      input.update();
      expect(input.getAccelerationAxis()).toBe(-1);
    });

    it('should cancel opposite inputs (accelerate + brake)', () => {
      mockKeys['W'].isDown = true;
      mockKeys['S'].isDown = true;
      input.update();
      expect(input.getAccelerationAxis()).toBe(0);
    });

    it('should return 0 when coasting', () => {
      input.update();
      expect(input.getAccelerationAxis()).toBe(0);
    });
  });

  describe('Handbrake Input', () => {
    it('should detect SPACE key handbrake input', () => {
      mockKeys['SPACE'].isDown = true;
      input.update();
      expect(input.isHandbraking()).toBe(true);
    });

    it('should return false when handbrake not pressed', () => {
      input.update();
      expect(input.isHandbraking()).toBe(false);
    });
  });

  describe('Pause Input', () => {
    it('should detect ESC key pause input', () => {
      mockKeys['ESC'].isDown = true;
      input.update();
      expect(input.isPausing()).toBe(true);
    });

    it('should return false when pause not pressed', () => {
      input.update();
      expect(input.isPausing()).toBe(false);
    });
  });

  describe('Pressed This Frame Detection', () => {
    it('should detect accelerate pressed this frame', () => {
      mockKeys['W']._justDown = true;
      input.update();
      expect(input.wasPressed(InputAction.Accelerate)).toBe(true);
    });

    it('should detect brake pressed this frame', () => {
      mockKeys['S']._justDown = true;
      input.update();
      expect(input.wasPressed(InputAction.Brake)).toBe(true);
    });

    it('should detect handbrake pressed this frame', () => {
      mockKeys['SPACE']._justDown = true;
      input.update();
      expect(input.wasPressed(InputAction.Handbrake)).toBe(true);
    });

    it('should detect pause pressed this frame', () => {
      mockKeys['ESC']._justDown = true;
      input.update();
      expect(input.wasPressed(InputAction.Pause)).toBe(true);
    });

    it('should not detect held keys as pressed this frame', () => {
      // Frame 1: Press key
      mockKeys['W']._justDown = true;
      mockKeys['W'].isDown = true;
      input.update();
      expect(input.wasPressed(InputAction.Accelerate)).toBe(true);

      // Frame 2: Still held but not "just down"
      mockKeys['W']._justDown = false;
      mockKeys['W'].isDown = true;
      input.update();
      expect(input.wasPressed(InputAction.Accelerate)).toBe(false);
    });
  });
});

describe('InputManager Restart Buffering', () => {
  let scene: Phaser.Scene;
  let input: InputManager;
  let mockKeys: { [key: string]: MockKey };
  let currentTime: number;

  beforeEach(() => {
    scene = createMockScene();
    currentTime = 0;
    scene.time.now = currentTime;
    input = InputManager.getInstance(scene);
    // Get mockKeys AFTER InputManager is created (which calls addKey)
    mockKeys = (scene as any).mockKeys;
  });

  afterEach(() => {
    InputManager.destroyInstance();
  });

  it('should allow first restart immediately', () => {
    // Ensure R key exists
    expect(mockKeys['R']).toBeDefined();
    
    mockKeys['R']._justDown = true;
    mockKeys['R'].isDown = true;
    input.update(currentTime);
    expect(input.isRestarting()).toBe(true);
    expect(input.wasPressed(InputAction.Restart)).toBe(true);
  });

  it('should block second restart within cooldown period', () => {
    // First restart at time 0
    mockKeys['R']._justDown = true;
    input.update(0);
    expect(input.isRestarting()).toBe(true);

    // Second restart at time 100ms (within 300ms cooldown)
    mockKeys['R']._justDown = false;
    input.update(50);
    mockKeys['R']._justDown = true;
    input.update(100);
    expect(input.isRestarting()).toBe(false);
  });

  it('should allow restart after cooldown expires', () => {
    // First restart at time 0
    mockKeys['R']._justDown = true;
    input.update(0);
    expect(input.isRestarting()).toBe(true);

    // Clear the just down flag
    mockKeys['R']._justDown = false;
    input.update(100);

    // Second restart at time 350ms (after 300ms cooldown)
    mockKeys['R']._justDown = true;
    input.update(350);
    expect(input.isRestarting()).toBe(true);
  });

  it('should use scene time when provided', () => {
    mockKeys['R']._justDown = true;
    input.update(1000);
    expect(input.isRestarting()).toBe(true);

    mockKeys['R']._justDown = false;
    input.update(1100);
    mockKeys['R']._justDown = true;
    input.update(1200);
    expect(input.isRestarting()).toBe(false);

    mockKeys['R']._justDown = false;
    input.update(1300);
    mockKeys['R']._justDown = true;
    input.update(1310);
    expect(input.isRestarting()).toBe(true);
  });

  it('should fall back to scene.time.now when time not provided', () => {
    // First restart at time 0
    scene.time.now = 0;
    mockKeys['R']._justDown = true;
    input.update();
    expect(input.isRestarting()).toBe(true);

    // Try restart at time 100 (within cooldown)
    scene.time.now = 100;
    mockKeys['R']._justDown = false;
    input.update();
    expect(input.isRestarting()).toBe(false);
    
    // Try restart again still within cooldown
    mockKeys['R']._justDown = true;
    input.update();
    expect(input.isRestarting()).toBe(false);

    // After cooldown expires
    scene.time.now = 350;
    mockKeys['R']._justDown = false;
    input.update();
    mockKeys['R']._justDown = true;
    input.update();
    expect(input.isRestarting()).toBe(true);
  });
});

describe('InputManager State Management', () => {
  let scene: Phaser.Scene;
  let input: InputManager;

  beforeEach(() => {
    scene = createMockScene();
    input = InputManager.getInstance(scene);
  });

  afterEach(() => {
    InputManager.destroyInstance();
  });

  it('should return read-only copy of state via getState', () => {
    const state1 = input.getState();
    const state2 = input.getState();
    
    // Should be different objects (copies)
    expect(state1).not.toBe(state2);
    
    // But with same values
    expect(state1).toEqual(state2);
  });

  it('should reset all input state via reset', () => {
    const mockKeys = (scene as any).mockKeys;
    
    // Set some input
    mockKeys['W'].isDown = true;
    mockKeys['A'].isDown = true;
    input.update();
    
    expect(input.isAccelerating()).toBe(true);
    expect(input.isSteeringLeft()).toBe(true);
    
    // Reset
    input.reset();
    
    const state = input.getState();
    expect(state.accelerate).toBe(false);
    expect(state.steerLeft).toBe(false);
    expect(state.acceleratePressed).toBe(false);
  });
});

describe('InputManager Cleanup', () => {
  let scene: Phaser.Scene;

  beforeEach(() => {
    scene = createMockScene();
    InputManager.destroyInstance();
  });

  afterEach(() => {
    InputManager.destroyInstance();
  });

  it('should remove all keyboard listeners on destroy', () => {
    const input = InputManager.getInstance(scene);
    const removeKeySpy = scene.input.keyboard!.removeKey as jest.Mock;
    
    input.destroy();
    
    // Should remove keys for all 7 actions (accelerate, brake, steerLeft, steerRight, handbrake, restart, pause)
    // Total: W, UP, S, DOWN, A, LEFT, D, RIGHT, SPACE, R, ESC = 11 keys
    expect(removeKeySpy).toHaveBeenCalledTimes(11);
  });

  it('should remove event listeners on destroy', () => {
    const input = InputManager.getInstance(scene);
    const offSpy = scene.events.off as jest.Mock;
    
    input.destroy();
    
    expect(offSpy).toHaveBeenCalledWith(
      Phaser.Scenes.Events.SHUTDOWN,
      expect.any(Function),
      expect.anything()
    );
  });

  it('should allow new instance after destroy', () => {
    InputManager.getInstance(scene);
    InputManager.destroyInstance();
    
    const newScene = createMockScene();
    const newInstance = InputManager.getInstance(newScene);
    
    expect(newInstance).toBeDefined();
    expect(InputManager.hasInstance()).toBe(true);
  });
});

// Restore original functions after all tests
afterAll(() => {
  if (originalJustDown) {
    Phaser.Input.Keyboard.JustDown = originalJustDown;
  }
  if (originalJustUp) {
    Phaser.Input.Keyboard.JustUp = originalJustUp;
  }
});
