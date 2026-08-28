import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root=path.resolve(process.cwd());
const permissions=fs.readFileSync(path.join(root,"src/modules/auth/server/permissions.js"),"utf8");
const policies=fs.readFileSync(path.join(root,"src/modules/auth/authorization/policy-registry.js"),"utf8");
const resources=fs.readFileSync(path.join(root,"src/modules/auth/server/resource-authorization.js"),"utf8");

test("scorer role can score but cannot manage fixtures or payments",()=>{
  const scorer=permissions.match(/SCORER:\s*\[([\s\S]*?)\],\s*FAMILY:/)?.[1]||"";
  assert.match(scorer,/PERMISSIONS\.MATCHES_SCORE/);
  assert.doesNotMatch(scorer,/PERMISSIONS\.MATCHES_MANAGE/);
  assert.doesNotMatch(scorer,/PERMISSIONS\.PAYMENTS_MANAGE/);
  assert.doesNotMatch(scorer,/PERMISSIONS\.USERS_UPDATE/);
});

test("family and user roles have no administrative permissions",()=>{
  for(const role of ["FAMILY","USER"]){
    const pattern=new RegExp(`${role}:\\s*\\[([\\s\\S]*?)\\]`, "m");
    const body=permissions.match(pattern)?.[1]||"";
    assert.match(body,/TOURNAMENTS_VIEW/);
    assert.match(body,/MATCHES_VIEW/);
    assert.doesNotMatch(body,/MANAGE|CREATE|UPDATE|DELETE|SCORE/);
  }
});

test("sensitive tournament routes require explicit management permissions",()=>{
  assert.match(policies,/"\/dashboard\/tournaments\/\[tournamentId\]\/staff":\s*\{\s*permission:\s*PERMISSIONS\.MATCHES_MANAGE/);
  assert.match(policies,/"\/dashboard\/tournaments\/\[tournamentId\]\/matches\/\[matchesId\]\/result-correction":\s*\{\s*permission:\s*PERMISSIONS\.MATCHES_MANAGE/);
  assert.match(policies,/"\/dashboard\/payments":\s*\{\s*permission:\s*PERMISSIONS\.PAYMENTS_VIEW/);
});

test("resource scoring and fixture management are separate permissions",()=>{
  assert.match(resources,/Match:\s*\{[\s\S]*update:\s*PERMISSIONS\.MATCHES_MANAGE[\s\S]*score:\s*PERMISSIONS\.MATCHES_SCORE/);
});
