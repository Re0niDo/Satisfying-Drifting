// Jest setup file to provide browser APIs Phaser expects when running in jsdom.

// Phaser touches canvas context capabilities at import time, but jsdom's canvas
// implementation returns null. Mock getContext so Phaser's feature checks pass.
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: jest.fn(() => ({
    fillStyle: '',
    fillRect: jest.fn(),
    drawImage: jest.fn(),
    createLinearGradient: jest.fn(() => ({
      addColorStop: jest.fn(),
    })),
    getImageData: jest.fn(() => ({ data: [] })),
    putImageData: jest.fn(),
    setLineDash: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    lineTo: jest.fn(),
    moveTo: jest.fn(),
    clip: jest.fn(),
    stroke: jest.fn(),
  })),
});

// Provide a fallback interface for Vite's import.meta.env in tests.
Object.assign(globalThis, {
  __VITE_IMPORT_META_ENV__: {
    DEV: false,
  },
});
