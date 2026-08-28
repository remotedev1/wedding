import { POLICY_REGISTRY, evaluateAccessRule } from "@/modules/auth/authorization/policy-registry";

export const PROTECTED_PREFIXES=["/dashboard"];

function segments(value){return (value.split("?")[0]?.replace(/\/+$/,"")||"/").split("/").filter(Boolean)}
function dynamic(segment){return /^\[[^/]+\]$/.test(segment)}
export function matchesRoutePattern(pattern,pathname){
  const a=segments(pattern),b=segments(pathname);
  if(a.length!==b.length)return false;
  return a.every((part,index)=>dynamic(part)||part===b[index]);
}
function specificity(pattern){return segments(pattern).reduce((s,p)=>s+(dynamic(p)?1:10),0)}
export function findRoutePolicy(pathname){
  return Object.entries(POLICY_REGISTRY.routes)
    .map(([pattern,rule])=>({pattern,...rule}))
    .sort((a,b)=>specificity(b.pattern)-specificity(a.pattern))
    .find(policy=>matchesRoutePattern(policy.pattern,pathname));
}
export function authorizePath(pathname,subject){
  if(!PROTECTED_PREFIXES.some(prefix=>pathname===prefix||pathname.startsWith(`${prefix}/`))) return true;
  const policy=findRoutePolicy(pathname);
  return policy ? evaluateAccessRule(subject,policy) : false;
}
