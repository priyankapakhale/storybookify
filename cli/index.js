#!/usr/bin/env node

import { Command } from "commander";
import { resolve, join } from "path";
import fs, { existsSync } from "fs";
import { scanComponents } from "../dist/core/componentScanner.js";
import { generateStory } from "../dist/core/storyGenerator.js";
import { writeStoryFile } from "../dist/utils/fileUtils.js";

const REPO_URL = "https://github.com/priyankapakhale/storybookify";

//TODO: Add logo to be printed here
function printLogo() {}

function printWelcome() {
  printLogo();
  console.log(
    "✨ storybookify ✨  —  The zero-config, plug-and-play Storybook generator!\n"
  );
}

function printOutro(componentsCount, storiesPath) {
  console.log(
    "\n──────────────────────────────────────────────────────────────"
  );
  console.log(
    `🎉 All stories generated! (${componentsCount} component${
      componentsCount !== 1 ? "s" : ""
    })`
  );
  console.log("\nTo view your Storybook, run:\n");
  console.log("  cd storybook-app");
  console.log("  npm install");
  console.log("  npm run storybook\n");
  console.log("For docs, troubleshooting, or to contribute:");
  console.log(`  ${REPO_URL}\n`);
  console.log(
    "──────────────────────────────────────────────────────────────\n"
  );
}

const program = new Command();

program
  .name("storybookify")
  .description("Generate Storybook stories from your React components.")
  .version("1.0.0")
  .option(
    "-c, --components-dir <dir>",
    "Directory with your components (default: example-components)",
    undefined
  )
  .option(
    "-o, --output-dir <dir>",
    "Output directory for generated stories (default: storybook-app/src/stories)",
    undefined
  )
  .option(
    "--config <path>",
    "Path to a storybookify config file (default: ./storybookify.config.js)"
  )
  .parse(process.argv);

const opts = program.opts();

// --- Config file loading ---
let config = {};
let configPath = opts.config || join(process.cwd(), "storybookify.config.js");

if (existsSync(configPath)) {
  try {
    let imported = await import(
      configPath.startsWith("file://") ? configPath : "file://" + configPath
    );
    config = imported.default || imported;
  } catch (e) {
    try {
      config = require(configPath);
    } catch (err) {
      console.error("Failed to load config file:", configPath, "\n", err);
      process.exit(1);
    }
  }
}

// --- Merge config values with CLI options (CLI > config > default) ---
const componentsDir =
  opts.componentsDir || config.componentsDir || "example-components";
const outputDir = resolve(
  process.cwd(),
  opts.outputDir || config.outputDir || "storybook-app/src/stories"
);

// --- CLI run ---
printWelcome();

if (!existsSync(componentsDir)) {
  console.error(`❌ Components directory not found: ${componentsDir}`);
  console.log(
    "Please check your path, or update your config/include patterns.\n"
  );
  console.log(`See ${REPO_URL} for help.`);
  process.exit(1);
}

console.log("🔍 Scanning components in:", componentsDir);

const components = await scanComponents(componentsDir, {
  include: config.include,
  exclude: config.exclude,
});

if (!components.length) {
  console.error("❌ No components found!");
  console.log(`Try editing your include/exclude patterns in your config.\n`);
  console.log(`See ${REPO_URL} for troubleshooting.`);
  process.exit(1);
}

console.log(
  `\n🧠 Found ${components.length} component${
    components.length !== 1 ? "s" : ""
  }:`
);
console.log(components.map((c) => `  - ${c.name}`).join("\n"));

fs.mkdirSync(outputDir, { recursive: true });

console.log("\n📝 Generating stories...");
for (const component of components) {
  const story = await generateStory(component, outputDir);
  writeStoryFile(component, story, outputDir);
  console.log("  ✔️", component.name);
}

printOutro(components.length, outputDir);
