const SENSITIVE_KEYS=/password|secret|token|authorization|cookie|otp|signature|key|session/i;
export function redactValue(value,depth=0){
  if(depth>5) return "[TRUNCATED]";
  if(Array.isArray(value)) return value.slice(0,50).map(v=>redactValue(v,depth+1));
  if(value&&typeof value==="object"){
    return Object.fromEntries(Object.entries(value).slice(0,100).map(([k,v])=>[k,SENSITIVE_KEYS.test(k)?"[REDACTED]":redactValue(v,depth+1)]));
  }
  if(typeof value==="string"&&value.length>2000) return `${value.slice(0,2000)}…`;
  return value;
}
