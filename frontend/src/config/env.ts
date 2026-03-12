const envSchema = {
  VITE_API_URL: import.meta.env.VITE_API_URL as string | undefined,
};

export const config = {
  apiUrl: envSchema.VITE_API_URL ?? 'http://localhost:3001',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;