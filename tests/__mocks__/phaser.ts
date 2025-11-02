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

class Scene {
  public sys: { settings: { key: string } };
  public registry = createRegistry();
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
    };
  }
}

const GameObjects = {
  Text,
  Rectangle,
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

const PhaserMock = {
  Scene,
  GameObjects,
  Sound,
  Core,
  HEADLESS: 0,
};

export default PhaserMock;
