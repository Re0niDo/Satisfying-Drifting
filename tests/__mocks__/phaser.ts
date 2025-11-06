const createRegistry = () => {
  const store = new Map<string, unknown>();

  return {
    set: jest.fn((key: string, value: unknown) => {
      store.set(key, value);
      return value;
    }),
    get: jest.fn((key: string) => store.get(key)),
  };
};

const createEventEmitter = () => {
  const listeners = new Map<string, Function[]>();

  return {
    on: jest.fn((event: string, fn: Function) => {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event)!.push(fn);
    }),
    once: jest.fn((event: string, fn: Function) => {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event)!.push(fn);
    }),
    off: jest.fn((event: string, fn: Function) => {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(fn);
        if (index !== -1) {
          eventListeners.splice(index, 1);
        }
      }
    }),
  };
};

class Text {
  public text: string;
  public style: Record<string, unknown>;

  constructor(
    public scene: any,
    public x: number,
    public y: number,
    text: string,
    style: Record<string, unknown>
  ) {
    this.text = text;
    this.style = style;
  }

  setOrigin = jest.fn(() => this);
  setText = jest.fn((value: string) => {
    this.text = value;
    return this;
  });
  destroy = jest.fn();
}

class Rectangle {
  constructor(
    public scene: any,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public fillColor?: number,
    public fillAlpha?: number
  ) {}

  setStrokeStyle = jest.fn(() => this);
  setPosition = jest.fn(() => this);
  setSize = jest.fn(() => this);
  destroy = jest.fn();
}

class Graphics {
  constructor(public scene: any) {}

  fillStyle = jest.fn(() => this);
  fillRect = jest.fn(() => this);
  lineStyle = jest.fn(() => this);
  strokeRect = jest.fn(() => this);
  generateTexture = jest.fn(() => this);
  destroy = jest.fn();
}

class Sprite {
  public x: number;
  public y: number;
  public angle: number = 0;
  public width: number = 32;
  public height: number = 48;
  public body: any;
  public texture: { key: string };
  public scene: any;
  private listeners: Map<string, Function[]> = new Map();

  constructor(
    scene: any,
    x: number,
    y: number,
    texture: string
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.texture = { key: texture };
    
    // Mock physics body
    const createVelocityObject = () => ({
      x: 0, 
      y: 0, 
      dot: function(this: any, v: any) { return this.x * v.x + this.y * v.y; },
      clone: function(this: any) { 
        const obj = createVelocityObject();
        obj.x = this.x;
        obj.y = this.y;
        return obj;
      },
      subtract: function(this: any, v: any) {
        const obj = createVelocityObject();
        obj.x = this.x - v.x;
        obj.y = this.y - v.y;
        return obj;
      },
      length: function(this: any) { return globalThis.Math.sqrt(this.x * this.x + this.y * this.y); }
    });
    
    this.body = {
      velocity: createVelocityObject(),
      speed: 0,
      useDamping: false,
      drag: { x: 0, y: 0 },
      angularDrag: 0,
      maxSpeed: 0,
      setSize: jest.fn(),
      setCollideWorldBounds: jest.fn(),
      setDrag: jest.fn(function(this: any, drag: number) { this.drag.x = drag; this.drag.y = drag; }),
      setAngularDrag: jest.fn(function(this: any, drag: number) { this.angularDrag = drag; }),
      setBounce: jest.fn(),
      setMaxVelocity: jest.fn(),
      setMaxSpeed: jest.fn(function(this: any, speed: number) { this.maxSpeed = speed; }),
      setDamping: jest.fn(function(this: any, damping: boolean) { this.useDamping = damping; }),
      reset: jest.fn(function(this: any, x: number, y: number) {
        (this as any).x = x;
        (this as any).y = y;
        this.velocity = createVelocityObject();
        this.speed = 0;
      }),
      setVelocity: jest.fn(function(this: any, x: number, y: number) {
        this.velocity.x = x;
        this.velocity.y = y;
        this.speed = globalThis.Math.sqrt(x * x + y * y);
      }),
      setAngularVelocity: jest.fn(),
    };
  }

  setOrigin = jest.fn(() => this);
  setDepth = jest.fn(() => this);
  setPosition = jest.fn((x: number, y: number) => {
    this.x = x;
    this.y = y;
    return this;
  });
  setAngle = jest.fn((angle: number) => {
    this.angle = angle;
    return this;
  });
  
  // Mock destroy to call preDestroy if it exists
  destroy = jest.fn(function(this: any) {
    if (this.preDestroy && typeof this.preDestroy === 'function') {
      this.preDestroy();
    }
  });
  
  removeAllListeners = jest.fn(() => {
    this.listeners.clear();
  });
  on = jest.fn((event: string, fn: Function) => {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(fn);
    return this;
  });
  off = jest.fn((event: string, fn: Function) => {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(fn);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }
    return this;
  });
}

class Scene {
  public sys: { settings: { key: string } };
  public registry = createRegistry();
  public events = createEventEmitter();
  public tweens = {
    killAll: jest.fn(),
    add: jest.fn(),
  };
  public time = {
    removeAllEvents: jest.fn(),
    delayedCall: jest.fn((_delay: number, callback: Function) => callback()),
  };
  public scene = {
    start: jest.fn(),
    key: '',
  };
  public load = {
    on: jest.fn(),
    off: jest.fn(),
    once: jest.fn(),
    image: jest.fn(),
    start: jest.fn(),
  };
  public textures = {
    exists: jest.fn(() => false),
  };
  public children = {
    list: [] as Array<Text | Rectangle>,
  };
  public add: {
    text: jest.Mock;
    rectangle: jest.Mock;
    existing: jest.Mock;
    graphics: jest.Mock;
  };
  public physics: {
    add: {
      existing: jest.Mock;
    };
  };
  public sound = {
    add: jest.fn(() => ({
      play: jest.fn(),
      stop: jest.fn(),
      destroy: jest.fn(),
    })),
  };
  public cache = {
    audio: {
      exists: jest.fn(() => false),
    },
  };
  public input = {
    keyboard: {
      on: jest.fn(),
      removeAllListeners: jest.fn(),
      addKey: jest.fn((code: string, _enableCapture?: boolean) => ({
        keyCode: code.charCodeAt(0),
        isDown: false,
      })),
      removeKey: jest.fn(),
    },
  };
  public cameras: { main: {
    width: number;
    height: number;
    fadeOut: jest.Mock;
    once: jest.Mock;
    emit: jest.Mock;
    centerX: number;
    centerY: number;
  } };

  constructor(config?: { key?: string }) {
    this.sys = {
      settings: {
        key: config?.key ?? '',
      },
    };

    const mainCamera: any = {
      width: 1280,
      height: 720,
      centerX: 640,
      centerY: 360,
      fadeOut: jest.fn(() => mainCamera),
      once: jest.fn((_event: string, callback: Function) => callback()),
      emit: jest.fn(),
    };

    this.cameras = { main: mainCamera };
    this.scene.key = this.sys.settings.key;

    this.add = {
      text: jest.fn((x: number, y: number, text: string, style: Record<string, unknown>) => {
        const obj = new Text(this, x, y, text, style);
        this.children.list.push(obj);
        return obj;
      }),
      rectangle: jest.fn(
        (
          x: number,
          y: number,
          width: number,
          height: number,
          fillColor?: number,
          fillAlpha?: number
        ) => {
          const obj = new Rectangle(this, x, y, width, height, fillColor, fillAlpha);
          this.children.list.push(obj);
          return obj;
        }
      ),
      existing: jest.fn((obj: any) => {
        this.children.list.push(obj);
        return obj;
      }),
      graphics: jest.fn(() => {
        return new Graphics(this);
      }),
    };

    this.physics = {
      add: {
        existing: jest.fn((obj: any) => {
          // Physics body is already mocked in Sprite constructor
          return obj;
        }),
      },
    };
  }
}

const GameObjects = {
  Text,
  Rectangle,
  Sprite,
  Graphics,
};

const Sound = {
  BaseSound: class {},
  HTML5AudioSound: class {},
};

const Core = {
  Events: {
    READY: 'ready',
  },
};

const Physics = {
  Arcade: {
    Body: class {
      velocity = { x: 0, y: 0, dot: (_v: any) => 0 };
      speed = 0;
      useDamping = false;
      drag = { x: 0, y: 0 };
      angularDrag = 0;
      maxSpeed = 0;
      setSize = jest.fn();
      setCollideWorldBounds = jest.fn();
      setDrag = jest.fn((drag: number) => { this.drag.x = drag; this.drag.y = drag; });
      setAngularDrag = jest.fn((drag: number) => { this.angularDrag = drag; });
      setBounce = jest.fn();
      setMaxVelocity = jest.fn();
      setMaxSpeed = jest.fn((speed: number) => { this.maxSpeed = speed; });
      setDamping = jest.fn((damping: boolean) => { this.useDamping = damping; });
      reset = jest.fn();
      setVelocity = jest.fn((x: number, y: number) => {
        this.velocity.x = x;
        this.velocity.y = y;
        this.speed = globalThis.Math.sqrt(x * x + y * y);
        this.velocity.dot = (v: any) => x * v.x + y * v.y;
      });
      setAngularVelocity = jest.fn();
    },
  },
};

const Scenes = {
  Events: {
    SHUTDOWN: 'shutdown',
  },
};

const Input = {
  Keyboard: {
    JustDown: jest.fn(),
    JustUp: jest.fn(),
  },
};

class Vector2 {
  constructor(public x: number = 0, public y: number = 0) {}
  
  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }
  
  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }
  
  subtract(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }
  
  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }
  
  length(): number {
    return globalThis.Math.sqrt(this.x * this.x + this.y * this.y);
  }
  
  setToPolar(angle: number, magnitude: number = 1): this {
    this.x = globalThis.Math.cos(angle) * magnitude;
    this.y = globalThis.Math.sin(angle) * magnitude;
    return this;
  }
}

const PhaserMath = {
  Vector2,
  Clamp: (value: number, min: number, max: number) => {
    return value < min ? min : value > max ? max : value;
  },
};

class Game {
  constructor(config: any) {
    // Mock game initialization
    if (config.callbacks && config.callbacks.postBoot) {
      setTimeout(() => config.callbacks.postBoot(this), 0);
    }
  }
  
  scene = {
    scenes: [new Scene({ key: 'MockScene' })],
  };
  
  destroy = jest.fn();
}

const PhaserMock = {
  Game,
  Scene,
  GameObjects,
  Sound,
  Core,
  Physics,
  Scenes,
  Input,
  Math: PhaserMath,
  HEADLESS: 0,
};

export default PhaserMock;
