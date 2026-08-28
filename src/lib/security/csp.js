export function buildContentSecurityPolicy(){
  const dev=process.env.NODE_ENV!=="production";
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev?" 'unsafe-eval'":""} https://checkout.razorpay.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-src https://api.razorpay.com https://checkout.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}
