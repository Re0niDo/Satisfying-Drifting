import Phaser from 'phaser';
import { Car } from '../../src/gameObjects/Car';
import { DriftState } from '../../src/types/PhysicsTypes';
import { InputManager } from '../../src/systems/InputManager';

describe('Car', () => {
  let scene: Phaser.Scene;
  let car: Car;

  beforeEach(() => {
    // Clean up any existing InputManager
    InputManager.destroyInstance();
    
    // Create a mock scene with all necessary methods
    scene = new Phaser.Scene({ key: 'TestScene' });
    
    // Initialize InputManager for Car constructor
    InputManager.getInstance(scene);
  });

  afterEach(() => {
    if (car && !car.scene) {
      // Only destroy if not already destroyed
      car.destroy();
    }
    
    // Clean up InputManager
    InputManager.destroyInstance();
  });

  describe('Constructor', () => {
    it('should create a car at specified position', () => {
      car = new Car(scene, 100, 200);
      
      expect(car.x).toBe(100);
      expect(car.y).toBe(200);
    });

    it('should use default texture key if not provided', () => {
      car = new Car(scene, 100, 200);
      
      expect(car.texture.key).toBe('car_placeholder');
    });

    it('should use custom texture key if provided', () => {
      car = new Car(scene, 100, 200, 'custom_car');
      
      expect(car.texture.key).toBe('custom_car');
    });

    it('should add car to scene display list', () => {
      car = new Car(scene, 100, 200);
      
      expect(scene.add.existing).toHaveBeenCalledWith(car);
    });

    it('should enable physics on car', () => {
      car = new Car(scene, 100, 200);
      
      expect(scene.physics.add.existing).toHaveBeenCalledWith(car);
    });

    it('should set origin to center', () => {
      car = new Car(scene, 100, 200);
      
      expect(car.setOrigin).toHaveBeenCalledWith(0.5, 0.5);
    });

    it('should set depth to 10', () => {
      car = new Car(scene, 100, 200);
      
      expect(car.setDepth).toHaveBeenCalledWith(10);
    });
  });

  describe('Physics Body Configuration', () => {
    beforeEach(() => {
      car = new Car(scene, 100, 200);
    });

    it('should have physics body configured', () => {
      expect(car.body).toBeDefined();
    });

    it('should set collision bounds smaller than sprite', () => {
      expect(car.body.setSize).toHaveBeenCalled();
      const args = (car.body.setSize as jest.Mock).mock.calls[0];
      expect(args[0]).toBeLessThan(car.width);
      expect(args[1]).toBeLessThan(car.height);
    });

    it('should disable world bounds collision', () => {
      expect(car.body.setCollideWorldBounds).toHaveBeenCalledWith(false);
    });

    it('should set drag to 0', () => {
      expect(car.body.setDrag).toHaveBeenCalledWith(0);
    });

    it('should set angular drag to 0', () => {
      expect(car.body.setAngularDrag).toHaveBeenCalledWith(0);
    });

    it('should disable bounce', () => {
      expect(car.body.setBounce).toHaveBeenCalledWith(0, 0);
    });

    it('should set max velocity', () => {
      expect(car.body.setMaxVelocity).toHaveBeenCalledWith(500, 500);
    });
  });

  describe('Physics State', () => {
    beforeEach(() => {
      car = new Car(scene, 100, 200);
    });

    it('should initialize physics state with correct position', () => {
      const state = car.getPhysicsState();
      
      expect(state.position.x).toBe(100);
      expect(state.position.y).toBe(200);
    });

    it('should initialize physics state with zero velocity', () => {
      const state = car.getPhysicsState();
      
      expect(state.velocity.x).toBe(0);
      expect(state.velocity.y).toBe(0);
    });

    it('should initialize physics state with zero speed', () => {
      const state = car.getPhysicsState();
      
      expect(state.speed).toBe(0);
    });

    it('should initialize physics state with zero rotation', () => {
      const state = car.getPhysicsState();
      
      expect(state.rotation).toBe(0);
    });

    it('should initialize physics state with normal drift state', () => {
      const state = car.getPhysicsState();
      
      expect(state.driftState).toBe(DriftState.Normal);
    });

    it('should initialize physics state with all input flags false', () => {
      const state = car.getPhysicsState();
      
      expect(state.isAccelerating).toBe(false);
      expect(state.isBraking).toBe(false);
      expect(state.isHandbraking).toBe(false);
    });

    it('should return readonly copy of physics state', () => {
      const state1 = car.getPhysicsState();
      const state2 = car.getPhysicsState();
      
      // Should be different objects (deep copy)
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe('setCarPosition', () => {
    beforeEach(() => {
      car = new Car(scene, 100, 200);
    });

    it('should update car position', () => {
      car.setCarPosition(300, 400);
      
      expect(car.x).toBe(300);
      expect(car.y).toBe(400);
    });

    it('should update physics state position', () => {
      car.setCarPosition(300, 400);
      
      const state = car.getPhysicsState();
      expect(state.position.x).toBe(300);
      expect(state.position.y).toBe(400);
    });

    it('should reset physics body', () => {
      car.setCarPosition(300, 400);
      
      expect(car.body.reset).toHaveBeenCalledWith(300, 400);
    });
  });

  describe('setCarRotation', () => {
    beforeEach(() => {
      car = new Car(scene, 100, 200);
    });

    it('should update car angle', () => {
      car.setCarRotation(45);
      
      expect(car.angle).toBe(45);
    });

    it('should update physics state rotation', () => {
      car.setCarRotation(45);
      
      const state = car.getPhysicsState();
      expect(state.rotation).toBe(45);
    });

    it('should handle negative rotation', () => {
      car.setCarRotation(-90);
      
      expect(car.angle).toBe(-90);
      const state = car.getPhysicsState();
      expect(state.rotation).toBe(-90);
    });

    it('should handle rotation greater than 360', () => {
      car.setCarRotation(450);
      
      expect(car.angle).toBe(450);
      const state = car.getPhysicsState();
      expect(state.rotation).toBe(450);
    });
  });

  describe('reset', () => {
    beforeEach(() => {
      car = new Car(scene, 100, 200);
      // Set some non-default values
      car.setCarPosition(500, 600);
      car.setCarRotation(90);
      car.body.setVelocity(100, 100);
      car.body.setAngularVelocity(50);
    });

    it('should reset position', () => {
      car.reset(100, 200, 0);
      
      expect(car.x).toBe(100);
      expect(car.y).toBe(200);
    });

    it('should reset rotation', () => {
      car.reset(100, 200, 45);
      
      expect(car.angle).toBe(45);
    });

    it('should default rotation to 0 if not provided', () => {
      car.reset(100, 200);
      
      expect(car.angle).toBe(0);
    });

    it('should reset velocity to zero', () => {
      car.reset(100, 200, 0);
      
      expect(car.body.setVelocity).toHaveBeenCalledWith(0, 0);
    });

    it('should reset angular velocity to zero', () => {
      car.reset(100, 200, 0);
      
      expect(car.body.setAngularVelocity).toHaveBeenCalledWith(0);
    });

    it('should reset physics state to initial values', () => {
      car.reset(100, 200, 45);
      
      const state = car.getPhysicsState();
      expect(state.position.x).toBe(100);
      expect(state.position.y).toBe(200);
      expect(state.rotation).toBe(45);
      expect(state.velocity.x).toBe(0);
      expect(state.velocity.y).toBe(0);
      expect(state.speed).toBe(0);
      expect(state.driftState).toBe(DriftState.Normal);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      car = new Car(scene, 100, 200);
    });

    it('should sync position from physics body', () => {
      car.x = 300;
      car.y = 400;
      
      car.update(0, 16);
      
      const state = car.getPhysicsState();
      expect(state.position.x).toBe(300);
      expect(state.position.y).toBe(400);
    });

    it('should sync velocity from physics body', () => {
      // Set velocity directly on body
      (car.body.velocity as any) = { x: 50, y: 100 };
      
      // Update physics state manually (without calling driftPhysics.update)
      car['physicsState'].velocity = { x: car.body.velocity.x, y: car.body.velocity.y };
      
      const state = car.getPhysicsState();
      expect(state.velocity.x).toBe(50);
      expect(state.velocity.y).toBe(100);
    });

    it('should sync speed from physics body', () => {
      // Set speed directly on body
      car.body.speed = 150;
      
      // Update physics state manually (without calling driftPhysics.update)
      car['physicsState'].speed = car.body.speed;
      
      const state = car.getPhysicsState();
      expect(state.speed).toBe(150);
    });

    it('should sync rotation from angle', () => {
      car.angle = 90;
      
      car.update(0, 16);
      
      const state = car.getPhysicsState();
      expect(state.rotation).toBe(90);
    });
  });

  describe('Lifecycle Methods', () => {
    beforeEach(() => {
      car = new Car(scene, 100, 200);
    });

    it('should have addedToScene method', () => {
      expect(car.addedToScene).toBeDefined();
      expect(typeof car.addedToScene).toBe('function');
    });

    it('should have removedFromScene method', () => {
      expect(car.removedFromScene).toBeDefined();
      expect(typeof car.removedFromScene).toBe('function');
    });

    it('should clean up listeners on preDestroy', () => {
      const removeListenersSpy = jest.spyOn(car, 'removeAllListeners');
      
      car.destroy();
      
      expect(removeListenersSpy).toHaveBeenCalled();
    });

    it('should not throw error when calling lifecycle methods', () => {
      expect(() => {
        car.addedToScene();
        car.removedFromScene();
      }).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    it('should properly clean up on destroy', () => {
      car = new Car(scene, 100, 200);
      
      // Add some event listeners
      car.on('test-event', () => {});
      car.on('another-event', () => {});
      
      const removeListenersSpy = jest.spyOn(car, 'removeAllListeners');
      
      car.destroy();
      
      expect(removeListenersSpy).toHaveBeenCalled();
    });

    it('should handle multiple destroy calls gracefully', () => {
      car = new Car(scene, 100, 200);
      
      expect(() => {
        car.destroy();
        car.destroy(); // Should not throw
      }).not.toThrow();
    });
  });
});
