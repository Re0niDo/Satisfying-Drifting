export type ImportMetaEnvLike = Partial<{
  DEV: boolean;
  PROD: boolean;
  [key: string]: unknown;
}>;

let cachedEnv: ImportMetaEnvLike | undefined;

function resolveImportMetaEnv(): ImportMetaEnvLike | undefined {
  if (cachedEnv) {
    return cachedEnv;
  }

  const globalEnv = (globalThis as Record<string, unknown>).__VITE_IMPORT_META_ENV__;
  if (globalEnv && typeof globalEnv === 'object') {
    cachedEnv = globalEnv as ImportMetaEnvLike;
    return cachedEnv;
  }

  try {
    const meta = (0, eval)('import.meta') as { env?: ImportMetaEnvLike };
    if (meta && typeof meta.env === 'object') {
      cachedEnv = meta.env;
      return cachedEnv;
    }
  } catch {
    // Running outside an environment that supports import.meta
  }

  return undefined;
}

/**
 * Provide access to the active Vite-style environment in both browser builds
 * and Jest where `import.meta` is unavailable.
 */
export function getImportMetaEnv(): ImportMetaEnvLike {
  return resolveImportMetaEnv() ?? {};
}

/**
 * Determine whether the code is currently running in a development environment.
 * Falls back to NODE_ENV when no Vite metadata is available.
 */
export function isDevEnvironment(): boolean {
  const env = getImportMetaEnv();
  if (typeof env.DEV === 'boolean') {
    return env.DEV;
  }

  if (
    typeof process !== 'undefined' &&
    typeof process.env?.NODE_ENV === 'string'
  ) {
    return process.env.NODE_ENV !== 'production';
  }

  return false;
}
