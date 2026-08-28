export function getSafeRedirect(value,fallback="/dashboard"){
  const candidate=Array.isArray(value)?value[0]:value;
  if(!candidate||!candidate.startsWith("/")||candidate.startsWith("//")||candidate.includes("\\")||/[\u0000-\u001f\u007f]/.test(candidate)) return fallback;
  try{
    const base=new URL("https://hockey.invalid");
    const resolved=new URL(candidate,base);
    if(resolved.origin!==base.origin||!resolved.pathname.startsWith("/")) return fallback;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  }catch{return fallback}
}
