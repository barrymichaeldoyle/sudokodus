const requiredEnvVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'POSTHOG_KEY',
  'POSTHOG_HOST',
] as const;

function validateEnvVars() {
  const missingVars = requiredEnvVars.filter(
    envVar => !process.env[envVar]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

validateEnvVars();

export const config = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL as string,
    anonKey: process.env
      .EXPO_PUBLIC_SUPABASE_ANON_KEY as string,
  },
  posthog: {
    key: process.env.POSTHOG_KEY as string,
    host: process.env.POSTHOG_HOST as string,
  },
} as const;

export type Config = typeof config;
