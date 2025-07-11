#!/usr/bin/env node

import boxen from "boxen";
import chalk from "chalk";
import { spawn } from "child_process";
import Table from "cli-table3";
import { Command } from "commander";
import fs from "fs";
import ora from "ora";
import path from "path";
import { fileURLToPath } from "url";
import { execa } from "execa";
import { scanComponents } from "../dist/core/componentScanner.js";
import { generateStory } from "../dist/core/storyGenerator.js";
import { writeStoryFile } from "../dist/utils/fileUtils.js";

const REPO_URL = "https://github.com/priyankapakhale/storybookify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const consumerRoot = process.cwd();
const outputDir = path.join(consumerRoot, "src/stories");
const storybookDir = path.join(consumerRoot, ".storybook");

// Helper: Install storybook if not present
async function ensureStorybookInstalled() {
  const pkgPath = path.join(consumerRoot, "package.json");
  let pkg = {};
  if (fs.existsSync(pkgPath)) {
    pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  }

  // Check if @storybook/react or storybook core is present
  const hasStorybookReact =
    (pkg.devDependencies && pkg.devDependencies["@storybook/react"]) ||
    (pkg.dependencies && pkg.dependencies["@storybook/react"]);

  const hasSBAddon =
    (pkg.devDependencies &&
      pkg.devDependencies["@storybook/addon-essentials"]) ||
    (pkg.dependencies && pkg.dependencies["@storybook/addon-essentials"]);

  // Already present: skip install, but maybe warn
  if (hasStorybookReact && hasSBAddon) {
    console.log(chalk.green("✔ Storybook already installed in your project."));
    return;
  }

  // If there are *some* Storybook packages but not all, warn about potential version mismatch
  if (hasStorybookReact || hasSBAddon) {
    console.log(
      chalk.red(
        "\n⚠️ Detected a partial Storybook install or potential version conflict.\n" +
          "Please install matching Storybook dependencies yourself, e.g.:\n" +
          chalk.yellow(
            "  npm install --save-dev @storybook/react @storybook/addon-essentials"
          ) +
          "\nOnce installed, re-run storybookify."
      )
    );
    process.exit(1);
  }

  // Otherwise, clean install both
  console.log(chalk.yellow("\n🚀 Installing Storybook in your project..."));
  try {
    await execa(
      "npm",
      [
        "install",
        "--save-dev",
        "@storybook/react",
        "@storybook/addon-essentials",
        "@storybook/react-vite",
      ],
      { cwd: consumerRoot, stdio: "inherit" }
    );
    console.log(chalk.green("✔ Storybook installed."));
  } catch (err) {
    console.log(chalk.red("\n❌ Failed to install Storybook dependencies."));
    console.log(
      chalk.gray(
        "If you see a dependency conflict, try running:\n" +
          "  npm install --save-dev @storybook/react @storybook/addon-essentials --legacy-peer-deps\n" +
          "Then re-run storybookify."
      )
    );
    process.exit(1);
  }
}

// Helper: Generate .storybook config
function generateStorybookConfig() {
  fs.mkdirSync(storybookDir, { recursive: true });

  // main.js (basic config)
  fs.writeFileSync(
    path.join(storybookDir, "main.js"),
    `
export default {
  stories: ['../src/stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: '@storybook/react-vite'
};
`.trim()
  );

  // preview.js (optional)
  fs.writeFileSync(
    path.join(storybookDir, "preview.js"),
    `
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: { expanded: true },
};
`.trim()
  );
}

// Helper: Patch package.json to add a script
function addStorybookScript() {
  const pkgPath = path.join(consumerRoot, "package.json");
  let pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["storybook"] = "storybook dev -p 6006";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}

async function main() {
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
  let configPath =
    opts.config || path.join(consumerRoot, "storybookify.config.js");
  if (fs.existsSync(configPath)) {
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

  let componentsDir =
    opts.componentsDir ||
    (config.componentsDir
      ? path.resolve(consumerRoot, config.componentsDir)
      : null) ||
    "src/components";

  // 1. Install Storybook if needed
  await ensureStorybookInstalled();

  // 2. Generate .storybook config
  generateStorybookConfig();

  // 3. Generate stories in consumer app
  if (!fs.existsSync(componentsDir)) {
    console.error(
      chalk.red(
        `✖ Components directory not found: ${chalk.yellow(componentsDir)}`
      )
    );
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.readdirSync(outputDir).forEach((file) => {
    fs.unlinkSync(path.join(outputDir, file));
  });

  const spinner = ora("Scanning components...").start();
  const components =
    (await scanComponents(componentsDir, {
      include: config.include,
      exclude: config.exclude,
    })) || [];
  spinner.succeed(chalk.green(`Found ${components.length} components.`));

  if (!components.length) {
    console.error(chalk.red("✖ No components found!"));
    process.exit(1);
  }

  console.log("\n📝 Generating stories...");
  const generatedFiles = [];

  for (const component of components) {
    const story = await generateStory(component, outputDir);
    const filePath = writeStoryFile(component, story, outputDir);
    generatedFiles.push({ name: component.name, file: filePath });
    console.log(chalk.green("✔"), chalk.bold(component.name));
  }

  // Pretty summary table
  const table = new Table({
    head: [chalk.cyan("Component"), chalk.cyan("Story File")],
  });
  for (const entry of generatedFiles) {
    const prettyStory = path.relative(consumerRoot, entry.file);
    table.push([entry.name, prettyStory]);
  }
  console.log("\n" + table.toString());

  // 4. Add script to package.json
  addStorybookScript();

  // 5. Start Storybook
  console.log("\n🚀 Starting Storybook...\n");
  const storybookProcess = spawn("npm", ["run", "storybook"], {
    cwd: consumerRoot,
    stdio: "inherit",
    shell: true,
  });

  storybookProcess.on("exit", (code) => {
    process.exit(code);
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
}

main();
