interface EnvironmentVariables {
  MONGODB_URI: string;
  PORT: number;
}

export const env: EnvironmentVariables = {
  MONGODB_URI:
    process.env.MONGODB_URI ||
    'mongodb://devUser:Password123@localhost:27017/dev',
  PORT: parseInt(process.env.PORT || '3000'),
};
