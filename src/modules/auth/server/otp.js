import crypto from "crypto";

function secret() {
  const value = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!value) throw new Error("NEXTAUTH_SECRET or AUTH_SECRET is required");
  return value;
}

export function hashAuthOtp(phoneNumber, otp) {
  return crypto
    .createHmac("sha256", secret())
    .update(`auth-registration:${phoneNumber}:${otp}`)
    .digest("hex");
}
