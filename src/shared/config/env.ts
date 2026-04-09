export interface EnvVars {
  VITE_OPENWEATHER_API_KEY: string;
}

export function getEnvVars(): EnvVars {
  const raw = {
    VITE_OPENWEATHER_API_KEY:
      (import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined)?.trim() ?? '',
  };

  if (!raw.VITE_OPENWEATHER_API_KEY) {
    throw new Error(
      'Environment variable validation failed:\n  • VITE_OPENWEATHER_API_KEY: required',
    );
  }

  return raw;
}
