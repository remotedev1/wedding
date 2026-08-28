/**
 * SMS utilities. Provider credentials are server-only environment variables.
 */
export async function sendOTPSMS(phoneNumber, otp) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[dev-sms] OTP for ${phoneNumber}: ${otp}`);
      return { success: true, developmentFallback: true };
    }
    throw new Error("SMS provider is not configured");
  }

  const twilio = (await import("twilio")).default;
  const client = twilio(accountSid, authToken);
  const target = String(phoneNumber).startsWith("+") ? String(phoneNumber) : `+91${phoneNumber}`;

  await client.messages.create({
    body: `Your tournament registration OTP is ${otp}. It expires in 10 minutes.`,
    from,
    to: target,
  });

  return { success: true };
}

export async function sendRegistrationConfirmationSMS(phoneNumber, details) {
  try {
    const message = `Registration received for ${details.tournamentName}. Family: ${details.familyName}. Events: ${details.gamesCount}. Amount: ₹${details.totalAmount}.`;
    if (process.env.NODE_ENV !== "production") {
      console.info(`[dev-sms] Confirmation to ${phoneNumber}: ${message}`);
      return { success: true, developmentFallback: true };
    }
    // Confirmation delivery can be added through the same provider without blocking registration.
    return { success: true };
  } catch (error) {
    console.error("Failed to send registration confirmation SMS:", error);
    return { success: false };
  }
}

export async function sendPaymentReminderSMS(phoneNumber, details) {
  try {
    const message = `Payment reminder for ${details.tournamentName}. Amount: ₹${details.amount}.`;
    if (process.env.NODE_ENV !== "production") console.info(`[dev-sms] Reminder to ${phoneNumber}: ${message}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to send payment reminder SMS:", error);
    return { success: false };
  }
}
