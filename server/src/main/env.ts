interface EnvironmentVariables {
  MONGODB_URI: string;
  PORT: number;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
};

const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
if (Boolean(googleClientId) !== Boolean(googleClientSecret)) {
  throw new Error(
    'Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, or leave both empty'
  );
}

export const env: EnvironmentVariables = {
  MONGODB_URI:
    process.env.MONGODB_URI ||
    'mongodb://devUser:Password123@localhost:27017/dev',
  PORT: parseInt(process.env.PORT || '4000', 10),
  BETTER_AUTH_SECRET: required('BETTER_AUTH_SECRET'),
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  GOOGLE_CLIENT_ID: googleClientId,
  GOOGLE_CLIENT_SECRET: googleClientSecret,
};
