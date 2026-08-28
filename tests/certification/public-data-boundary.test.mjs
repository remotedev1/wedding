import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root=path.resolve(process.cwd());
const source=fs.readFileSync(path.join(root,"src/modules/tournaments/server/public.js"),"utf8");

test("public tournament snapshot only projects published fixtures",()=>{
  assert.match(source,/matches:\s*\{\s*where:\s*\{\s*publicationStatus:\s*"PUBLISHED"/);
});

test("public match counts do not expose internal hidden fixture totals",()=>{
  assert.doesNotMatch(source,/matches:\s*tournament\._count\.matches/);
  assert.match(source,/matches:\s*matches\.length/);
});

test("public officials projection excludes internal assignment metadata",()=>{
  assert.match(source,/select:\s*\{\s*id:\s*true,\s*role:\s*true,\s*name:\s*true\s*\}/);
  const officialSelect=source.match(/officials:\s*\{[\s\S]*?select:\s*\{([\s\S]*?)\}\s*,?\s*\}/)?.[1]||"";
  assert.doesNotMatch(officialSelect,/userId|phone|notes|assignedById|checkedInAt|checkedOutAt/);
});
