#!/usr/bin/env node

import { Command } from "commander";
import { resolve, join } from "path";
import fs, { existsSync } from "fs";
import { scanComponents } from "../dist/core/componentScanner.js";
import { generateStory } from "../dist/core/storyGenerator.js";
import { writeStoryFile } from "../dist/utils/fileUtils.js";

// --- CLI argument parsing ---
const program = new Command();

program
  .name("storybookify")
  .description("Generate Storybook stories from your React components.")
  .version("1.0.0")
  .option(
    "-c, --components-dir <dir>",
    "Directory with your components (default: example-components)",
    undefined // We'll set a default below after merging with config!
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
    // Try dynamic import for both ESM and CJS
    let imported = await import(
      configPath.startsWith("file://") ? configPath : "file://" + configPath
    );
    config = imported.default || imported;
  } catch (e) {
    try {
      // Fallback: require (for CJS)
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

// --- Main logic ---
async function main() {
  // Ensure outputDir exists
  fs.mkdirSync(outputDir, { recursive: true });

  console.log("🔍 Scanning components in:", componentsDir);
  const components = await scanComponents(componentsDir, {
    include: config.include,
    exclude: config.exclude,
  });

  if (!components.length) {
    console.error("❌ No components found in", componentsDir);
    process.exit(1);
  }

  console.log("🧠 Found components:", components.map((c) => c.name).join(", "));

  for (const component of components) {
    const story = await generateStory(component, outputDir);
    writeStoryFile(component, story, outputDir);
    console.log("✅ Wrote story:", component.name);
  }

  console.log(
    "\n🎉 All stories generated!\nTo view them, run:\n\n  cd storybook-app\n  npm install\n  npm run storybook\n"
  );
}

main();
