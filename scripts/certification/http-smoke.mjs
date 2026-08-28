const base = String(process.env.CERT_BASE_URL || "").replace(/\/+$/, "");
if (!base) {
  console.error("CERT_BASE_URL is required, e.g. http://localhost:3000");
  process.exit(2);
}

const failures = [];
const checks = [];

async function check(name, fn) {
  try {
    await fn();
    checks.push({ name, ok:true });
  } catch (error) {
    failures.push({ name, error:error.message });
    checks.push({ name, ok:false });
  }
}

await check("homepage responds with security headers", async()=>{
  const response=await fetch(`${base}/`,{redirect:"manual"});
  if(response.status<200||response.status>=400) throw new Error(`HTTP ${response.status}`);
  const csp=response.headers.get("content-security-policy");
  if(!csp) throw new Error("Content-Security-Policy header missing");
  if(response.headers.get("x-content-type-options")!=="nosniff") throw new Error("nosniff header missing");
});

await check("public tournament endpoint does not fail", async()=>{
  const response=await fetch(`${base}/api/public/tournaments/current`,{cache:"no-store"});
  if(response.status>=500) throw new Error(`HTTP ${response.status}`);
  const body=await response.json().catch(()=>null);
  if(!body || typeof body!=="object") throw new Error("Expected JSON response");
});

await check("cross-origin mutation is rejected before business work", async()=>{
  const response=await fetch(`${base}/api/auth/forgot-password`,{
    method:"POST",
    headers:{
      "content-type":"application/json",
      "origin":"https://attacker.invalid",
      "sec-fetch-site":"cross-site",
    },
    body:JSON.stringify({email:"certification-nobody@example.invalid"}),
    redirect:"manual",
  });
  if(response.status!==403) throw new Error(`Expected 403, received ${response.status}`);
});

await check("oversized password-reset body is not accepted", async()=>{
  const response=await fetch(`${base}/api/auth/forgot-password`,{
    method:"POST",
    headers:{
      "content-type":"application/json",
      "origin":base,
      "sec-fetch-site":"same-origin",
    },
    body:JSON.stringify({email:`${"a".repeat(9000)}@example.invalid`}),
  });
  if(![400,413,429].includes(response.status)) throw new Error(`Expected 400/413/429, received ${response.status}`);
});

console.log(JSON.stringify({ ok:failures.length===0, checks, failures },null,2));
if(failures.length) process.exit(1);
