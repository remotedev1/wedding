import fs from "node:fs";
import path from "node:path";

const root=path.resolve(process.cwd());
const src=path.join(root,"src");
const failures=[];
const warnings=[];

function walk(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const full=path.join(dir,entry.name);
    return entry.isDirectory()?walk(full):[full];
  });
}
const files=walk(src).filter(file=>/\.(?:js|jsx|ts|tsx|mjs|cjs)$/.test(file));
const rel=file=>path.relative(root,file).replaceAll("\\","/");

for(const file of files){
  const text=fs.readFileSync(file,"utf8");
  for(const forbidden of ["@/features/","backOffice","frontEnd","NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY"]){
    if(text.includes(forbidden)) failures.push(`${rel(file)} contains legacy/unsafe token ${forbidden}`);
  }
}

const rootRuntime=["app","components","lib","hooks","schemas","actions","helpers","utils","context","auth.js","middleware.js"]
  .filter(name=>fs.existsSync(path.join(root,name)));
if(rootRuntime.length) failures.push(`Runtime source escaped src/: ${rootRuntime.join(", ")}`);

const apiRoutes=files.filter(file=>rel(file).startsWith("src/app/api/")&&/route\.(?:js|ts)$/.test(file));
const directDb=[];
for(const file of apiRoutes){
  const text=fs.readFileSync(file,"utf8");
  if(/\b(?:db|prisma)\./.test(text)) directDb.push(rel(file));
}
if(directDb.length){
  warnings.push({
    code:"API_DIRECT_DB_DEBT",
    message:`${directDb.length} API route handlers still contain direct database calls. Critical transaction domains have been moved to services, but remaining CRUD/content routes should be migrated module-by-module before declaring architectural completion.`,
    routes:directDb,
  });
}


console.log(JSON.stringify({
  ok:failures.length===0,
  files:files.length,
  apiRoutes:apiRoutes.length,
  directDbRoutes:directDb.length,
  failures,
  warnings,
},null,2));

if(failures.length) process.exit(1);
