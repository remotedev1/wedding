function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getServerEnvironment() {
  return {
    nodeEnv: process.env.NODE_ENV || "development",
    authSecret: required("NEXTAUTH_SECRET"),
    appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
    companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || "Tournament Control",
  };
}

export function getPublicEnvironment() {
  return {
    companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || "Tournament Control",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "",
  };
}
