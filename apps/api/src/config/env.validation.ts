import { z } from "zod";

// z.coerce.boolean() runs JS's Boolean(value), which treats the string
// "false" as true (any non-empty string is truthy) - these two helpers parse
// the literal strings "true"/"false" instead.
const booleanString = (defaultValue: boolean) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined ? defaultValue : v === "true"));

const optionalBooleanString = () =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true"));

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGINS: z.string().default(""),
  // Overrides the `secure` flag on auth cookies, which otherwise defaults to
  // (NODE_ENV === "production"). Needed to run a production deployment over
  // plain HTTP before TLS is set up - a Secure cookie is silently dropped by
  // the browser on non-HTTPS origins, which breaks login entirely.
  COOKIE_SECURE: optionalBooleanString(),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().default(1433),
  DB_USERNAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),
  DB_ENCRYPT: booleanString(false),
  DB_TRUST_SERVER_CERTIFICATE: booleanString(true),

  JWT_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  CUSTOMER_JWT_SECRET: z.string().min(16),
  CUSTOMER_JWT_REFRESH_SECRET: z.string().min(16),

  ENCRYPTION_KEY: z.string().min(16),

  UPLOAD_DIR: z.string().default("uploads"),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(
      `Invalid environment configuration:\n${result.error.issues
        .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
        .join("\n")}`,
    );
  }
  return result.data;
}
