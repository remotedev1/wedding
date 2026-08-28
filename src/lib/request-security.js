function normalizedOrigin(value){
  try{return new URL(value).origin.toLowerCase()}catch{return null}
}
export function isSameOriginMutation(request){
  const method=String(request.method||"GET").toUpperCase();
  if(["GET","HEAD","OPTIONS"].includes(method)) return true;

  const fetchSite=request.headers.get("sec-fetch-site")?.toLowerCase();
  if(fetchSite && !["same-origin","same-site","none"].includes(fetchSite)) return false;

  const origin=request.headers.get("origin");
  if(!origin) return fetchSite==="same-origin"||fetchSite==="same-site";
  const supplied=normalizedOrigin(origin);
  if(!supplied) return false;

  const trusted=new Set();
  const configured=process.env.APP_URL||process.env.NEXT_PUBLIC_APP_URL||process.env.NEXTAUTH_URL;
  const configuredOrigin=configured&&normalizedOrigin(configured);
  if(configuredOrigin) trusted.add(configuredOrigin);

  const requestOrigin=normalizedOrigin(request.url);
  if(requestOrigin) trusted.add(requestOrigin);

  if(process.env.TRUST_PROXY==="1"){
    const host=request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const proto=request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    if(host&&["http","https"].includes(proto)){
      const forwarded=normalizedOrigin(`${proto}://${host}`);
      if(forwarded) trusted.add(forwarded);
    }
  }
  return trusted.has(supplied);
}
export function getTrustedClientIp(request){
  if(process.env.TRUST_PROXY!=="1") return undefined;
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||request.headers.get("x-real-ip")||undefined;
}
