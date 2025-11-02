import type { ImportMetaEnvLike } from '../../src/utils/env';

describe('env utilities', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    delete (globalThis as Record<string, unknown>).__VITE_IMPORT_META_ENV__;

    if (typeof originalNodeEnv === 'string') {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }

    jest.resetModules();
  });

  it('returns the globally injected Vite metadata when present', () => {
    jest.isolateModules(() => {
      const injectedEnv: ImportMetaEnvLike = { DEV: true, CUSTOM_FLAG: 'yes' };
      (globalThis as Record<string, unknown>).__VITE_IMPORT_META_ENV__ = injectedEnv;

      const { getImportMetaEnv } = require('../../src/utils/env') as typeof import('../../src/utils/env');

      expect(getImportMetaEnv()).toMatchObject(injectedEnv);
    });
  });

  it('caches the resolved environment between reads', () => {
    jest.isolateModules(() => {
      (globalThis as Record<string, unknown>).__VITE_IMPORT_META_ENV__ = { DEV: false, version: '1.0' };

      const envModule = require('../../src/utils/env') as typeof import('../../src/utils/env');
      const first = envModule.getImportMetaEnv();
      delete (globalThis as Record<string, unknown>).__VITE_IMPORT_META_ENV__;
      const second = envModule.getImportMetaEnv();

      expect(second).toBe(first);
      expect(second).toEqual({ DEV: false, version: '1.0' });
    });
  });

  it('prefers the DEV hint from import.meta when determining environment', () => {
    jest.isolateModules(() => {
      (globalThis as Record<string, unknown>).__VITE_IMPORT_META_ENV__ = { DEV: true };

      const { isDevEnvironment } = require('../../src/utils/env') as typeof import('../../src/utils/env');

      expect(isDevEnvironment()).toBe(true);
    });
  });

  it('falls back to NODE_ENV when Vite metadata is unavailable', () => {
    jest.isolateModules(() => {
      delete (globalThis as Record<string, unknown>).__VITE_IMPORT_META_ENV__;
      process.env.NODE_ENV = 'production';

      const { isDevEnvironment } = require('../../src/utils/env') as typeof import('../../src/utils/env');

      expect(isDevEnvironment()).toBe(false);
    });

    jest.isolateModules(() => {
      delete (globalThis as Record<string, unknown>).__VITE_IMPORT_META_ENV__;
      process.env.NODE_ENV = 'development';

      const { isDevEnvironment } = require('../../src/utils/env') as typeof import('../../src/utils/env');

      expect(isDevEnvironment()).toBe(true);
    });
  });

  it('returns an empty object when no environment information is available', () => {
    jest.isolateModules(() => {
      delete (globalThis as Record<string, unknown>).__VITE_IMPORT_META_ENV__;
      delete process.env.NODE_ENV;

      const { getImportMetaEnv } = require('../../src/utils/env') as typeof import('../../src/utils/env');

      expect(getImportMetaEnv()).toEqual({});
    });
  });
});
