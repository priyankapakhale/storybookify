#!/usr/bin/env node

import { Command } from "commander";
import { resolve, join, dirname } from "path";
import fs, { existsSync } from "fs";
import { scanComponents } from "../dist/core/componentScanner.js";
import { generateStory } from "../dist/core/storyGenerator.js";
import { writeStoryFile } from "../dist/utils/fileUtils.js";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import chalk from "chalk";
import ora from "ora";
import Table from "cli-table3";
import boxen from "boxen";
import path from "path"; // <-- Make sure this is here!

const REPO_URL = "https://github.com/priyankapakhale/storybookify";

// For __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Hardcoded output directory (ALWAYS points to library) ---
const outputDir = join(__dirname, "../storybook-app/src/stories");

// Print logo and welcome messages
function printLogo() {}

function printWelcome() {
  printLogo();
  console.log(
    chalk.cyan.bold("✨ storybookify ✨") +
      chalk.gray(" — The zero-config, plug-and-play Storybook generator!\n")
  );
}

function printOutro(componentsCount, storiesPath) {
  console.log(
    chalk.green(
      `\n🎉 All stories generated! (${componentsCount} component${
        componentsCount !== 1 ? "s" : ""
      })`
    )
  );
  console.log(chalk.gray("\n──────────────────────────────────────────\n"));
}

const program = new Command();

program
  .name("storybookify")
  .description("Generate Storybook stories from your React components.")
  .version("1.0.0")
  .option(
    "-c, --components-dir <dir>",
    "Directory with your components (default: src/components)",
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

// --- Resolve componentsDir (consumer app) ---
let componentsDir =
  opts.componentsDir ||
  (config.componentsDir
    ? resolve(process.cwd(), config.componentsDir)
    : null) ||
  "src/components";

// --- CLI run ---
printWelcome();

if (!existsSync(componentsDir)) {
  console.error(
    chalk.red(
      `✖ Components directory not found: ${chalk.yellow(componentsDir)}`
    )
  );
  console.log(
    chalk.gray(
      "Please check your path, or update your config/include patterns.\n"
    )
  );
  console.log(chalk.cyan(`See ${REPO_URL} for help.`));
  process.exit(1);
}

const spinner = ora("Scanning components...").start();
const components = await scanComponents(componentsDir, {
  include: config.include,
  exclude: config.exclude,
});
spinner.succeed(chalk.green(`Found ${components.length} components.`));

if (!components.length) {
  console.error(chalk.red("✖ No components found!"));
  console.log(
    chalk.gray(`Try editing your include/exclude patterns in your config.\n`)
  );
  console.log(chalk.cyan(`See ${REPO_URL} for troubleshooting.`));
  process.exit(1);
}

console.log(
  `\n🧠 Found ${components.length} component${
    components.length !== 1 ? "s" : ""
  }:`
);
console.log(components.map((c) => `  - ${c.name}`).join("\n"));

// --- Clean up existing stories in library ---
fs.mkdirSync(outputDir, { recursive: true });
fs.readdirSync(outputDir).forEach((file) => {
  fs.unlinkSync(join(outputDir, file));
});

console.log("\n📝 Generating stories...");
const generatedFiles = [];

for (const component of components) {
  const story = await generateStory(component, outputDir);
  const filePath = writeStoryFile(component, story, outputDir);
  generatedFiles.push({ name: component.name, file: filePath });
  console.log(chalk.green("✔"), chalk.bold(component.name));
}

// --- Pretty summary table ---
const table = new Table({
  head: [chalk.cyan("Component"), chalk.cyan("Story File")],
});
for (const entry of generatedFiles) {
  // Show path relative to the user's current directory
  const prettyStory = path.relative(process.cwd(), entry.file);
  table.push([entry.name, prettyStory]);
}
console.log("\n" + table.toString());

printOutro(components.length, outputDir);

// ---- Start Storybook automatically ----
console.log("🚀 Starting Storybook...\n");

const storybookProcess = spawn("npm", ["run", "storybook"], {
  cwd: join(__dirname, "../storybook-app"),
  stdio: "inherit",
  shell: true,
});

console.log(
  boxen(
    chalk.green("✨ All done! Storybook is running ✨") +
      "\n" +
      chalk.cyan("Visit http://localhost:6006/ to view your Storybook."),
    {
      padding: 1,
      borderColor: "green",
      borderStyle: "round",
    }
  )
);

storybookProcess.on("exit", (code) => {
  process.exit(code);
});
