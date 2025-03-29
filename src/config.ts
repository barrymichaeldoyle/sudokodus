const requiredEnvVars = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'] as const;

function validateEnvVars() {
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

validateEnvVars();

export const config = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL as string,
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string,
  },
} as const;

export type Config = typeof config;
