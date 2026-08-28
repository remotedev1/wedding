const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const forbidden = ["app","components","lib","hooks","schemas","actions","helpers","utils","context","auth.js","middleware.js"];
const offenders = forbidden.filter((name) => fs.existsSync(path.join(root, name)));

const jsconfig = JSON.parse(fs.readFileSync(path.join(root, "jsconfig.json"), "utf8"));
const alias = jsconfig?.compilerOptions?.paths?.["@/*"]?.[0];

let failed = false;
if (offenders.length) {
  failed = true;
  console.error("Runtime source must live under src/. Found at root:", offenders.join(", "));
}
if (alias !== "./src/*") {
  failed = true;
  console.error(`Expected @/* alias to resolve to ./src/*, received ${String(alias)}`);
}
for (const required of ["src/app","src/modules","src/components","src/config","src/lib","src/lib/auth.js","src/middleware.js"]) {
  if (!fs.existsSync(path.join(root, required))) {
    failed = true;
    console.error(`Missing required source path: ${required}`);
  }
}
if (failed) process.exit(1);
console.log("src architecture check passed");
