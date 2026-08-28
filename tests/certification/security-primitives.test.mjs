import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root=path.resolve(process.cwd());

async function importStandalone(rel){
  const source=fs.readFileSync(path.join(root,rel),"utf8");
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

test("safe redirects only permit local application paths", async()=>{
  const {getSafeRedirect}=await importStandalone("src/lib/safe-redirect.js");
  assert.equal(getSafeRedirect("/dashboard/tournaments"),"/dashboard/tournaments");
  assert.equal(getSafeRedirect("/dashboard?tab=live#top"),"/dashboard?tab=live#top");
  assert.equal(getSafeRedirect("https://evil.example/"),"/dashboard");
  assert.equal(getSafeRedirect("//evil.example/path"),"/dashboard");
  assert.equal(getSafeRedirect("/\\evil.example"),"/dashboard");
  assert.equal(getSafeRedirect("javascript:alert(1)"),"/dashboard");
});

test("same-origin mutation protection rejects foreign origins", async()=>{
  const {isSameOriginMutation}=await importStandalone("src/lib/request-security.js");
  const headers=new Headers({
    origin:"https://evil.example",
    "sec-fetch-site":"cross-site",
  });
  const req=new Request("https://hockey.example/api/example",{method:"POST",headers});
  assert.equal(isSameOriginMutation(req),false);
});

test("same-origin mutation protection accepts same origin", async()=>{
  const {isSameOriginMutation}=await importStandalone("src/lib/request-security.js");
  const req=new Request("https://hockey.example/api/example",{
    method:"POST",
    headers:{origin:"https://hockey.example","sec-fetch-site":"same-origin"},
  });
  assert.equal(isSameOriginMutation(req),true);
});
