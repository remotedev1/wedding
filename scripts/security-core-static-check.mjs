import fs from "node:fs";
import path from "node:path";

const root=path.resolve(process.cwd());
const src=path.join(root,"src");
const failures=[];

function walk(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const full=path.join(dir,entry.name);
    return entry.isDirectory()?walk(full):[full];
  });
}
const code=walk(src).filter(f=>/\.(?:js|jsx|ts|tsx|mjs|cjs)$/.test(f));
const read=f=>fs.readFileSync(f,"utf8");
const rel=f=>path.relative(root,f).replaceAll("\\","/");

// Every protected dashboard page must be in the canonical route-policy registry.
const registry=read(path.join(src,"modules/auth/authorization/policy-registry.js"));
const registered=new Set([...registry.matchAll(/"(\/dashboard[^"]*)"\s*:/g)].map(m=>m[1]));
for(const file of code.filter(f=>/src\/app\/.*\/page\.(?:js|jsx|ts|tsx)$/.test(rel(f)))){
  const parts=rel(file).replace(/^src\/app\//,"").split("/").slice(0,-1).filter(p=>!(p.startsWith("(")&&p.endsWith(")")));
  const route="/"+parts.join("/");
  if(route.startsWith("/dashboard")&&!registered.has(route)) failures.push(`Protected page has no route policy: ${route}`);
}

// Every browser mutation API must use the common API setup/origin protection.
// Provider-signed webhooks are explicit exceptions.
const webhookExceptions=new Set(["src/app/api/razorpay/webhook/route.js"]);
for(const file of code.filter(f=>rel(f).includes("src/app/api/")&&/route\.(?:js|ts)$/.test(f))){
  const text=read(file);
  const mutation=/export\s+(?:const|async function)\s+(POST|PUT|PATCH|DELETE)\b/.test(text);
  if(!mutation||webhookExceptions.has(rel(file)))continue;
  if(!text.includes("setupApiHandler(")&&!text.includes("isSameOriginMutation(")){
    failures.push(`Mutation route lacks common security setup: ${rel(file)}`);
  }
}

// Server-only secrets must never be NEXT_PUBLIC.
for(const file of code){
  const text=read(file);
  if(/NEXT_PUBLIC_[A-Z0-9_]*(?:SECRET|PRIVATE_KEY|PASSWORD)/.test(text)){
    failures.push(`Potential public secret environment name in ${rel(file)}`);
  }
  if(file.includes("app/api")&&text.includes('headers.get("x-forwarded-for")')&&!text.includes("getTrustedClientIp")){
    failures.push(`API directly trusts x-forwarded-for: ${rel(file)}`);
  }
}

if(!fs.existsSync(path.join(root,"prisma/schema.prisma"))||!read(path.join(root,"prisma/schema.prisma")).includes("model AbuseRateLimit")){
  failures.push("Shared AbuseRateLimit model is missing");
}
if(!read(path.join(src,"middleware.js")).includes("Content-Security-Policy")){
  failures.push("CSP is not configured in middleware");
}
if(!read(path.join(src,"lib/auth.js")).includes("consumeRateLimit")){
  failures.push("Credential login is not using shared rate limiting");
}

if(failures.length){
  console.error("Security core static check FAILED");
  failures.forEach(f=>console.error(`- ${f}`));
  process.exit(1);
}
console.log("Security core static check passed");
