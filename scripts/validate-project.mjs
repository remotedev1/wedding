import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "src/app/page.tsx",
  "src/app/layout.tsx",
  "src/app/globals.css",
  "src/data/wedding.ts",
  "src/components/wedding/WeddingExperience.tsx",
  "src/components/wedding/EnvelopeStage.tsx",
  "src/components/wedding/InvitationContent.tsx",
  "public/kodava-symbol.svg",
  "public/opengraph-preview.svg",
  "public/favicon.svg"
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error("Missing required files:");
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const wedding = fs.readFileSync(path.join(root, "src/data/wedding.ts"), "utf8");
const placeholders = [
  "your-wedding-domain.com",
].filter((value) => wedding.includes(value));

console.log("Project structure: OK");

if (placeholders.length) {
  console.warn("\nDeployment placeholders still present:");
  for (const item of placeholders) console.warn(`- ${item}`);
  console.warn("\nReplace these before publishing the final invitation.");
} else {
  console.log("Wedding content placeholders: none detected");
}

const audioEnabled = /audio:\s*{[\s\S]*?enabled:\s*true/.test(wedding);
if (audioEnabled && !fs.existsSync(path.join(root, "public/audio/wedding-theme.mp3"))) {
  console.warn("\nMusic is enabled but public/audio/wedding-theme.mp3 is missing.");
}

console.log("\nValidation finished.");
