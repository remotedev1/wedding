export const AUTH_LIMITS={
  nameMin:2,
  nameMax:100,
  passwordMin:12,
  passwordMax:128,
};
export function normalizeAuthEmail(value){return typeof value==="string"?value.trim().toLowerCase():""}
export function normalizeDisplayName(value){return typeof value==="string"?value.trim().replace(/\s+/g," "):""}
export function isPasswordLengthValid(value){return typeof value==="string"&&value.length>=AUTH_LIMITS.passwordMin&&value.length<=AUTH_LIMITS.passwordMax}
