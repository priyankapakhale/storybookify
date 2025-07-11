#!/usr/bin/env node

import boxen from "boxen";
import chalk from "chalk";
import Table from "cli-table3";
import { Command } from "commander";
import fs from "fs-extra";
import ora from "ora";
import path from "path";
import { fileURLToPath } from "url";
import { execa } from "execa";
import tmp from "tmp-promise";
import { scanComponents } from "../dist/core/componentScanner.js";
import { generateStory } from "../dist/core/storyGenerator.js";
import { writeStoryFile } from "../dist/utils/fileUtils.js";

const REPO_URL = "https://github.com/priyankapakhale/storybookify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runIsolatedStorybook() {
  // 1. CLI options
  const program = new Command();
  program
    .name("storybookify")
    .description(
      "Generate and run Storybook for your components in an isolated temp environment."
    )
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

  // 2. Resolve paths (from user project)
  const userRoot = process.cwd();
  let componentsDir = opts.componentsDir
    ? path.resolve(userRoot, opts.componentsDir)
    : path.join(userRoot, "src/components");

  // (Optional: custom config file support)
  let config = {};
  let configPath = opts.config || path.join(userRoot, "storybookify.config.js");
  if (fs.existsSync(configPath)) {
    try {
      let imported = await import(
        configPath.startsWith("file://") ? configPath : "file://" + configPath
      );
      config = imported.default || imported;
      if (config.componentsDir)
        componentsDir = path.resolve(userRoot, config.componentsDir);
    } catch (e) {
      try {
        config = require(configPath);
        if (config.componentsDir)
          componentsDir = path.resolve(userRoot, config.componentsDir);
      } catch (err) {
        console.error("Failed to load config file:", configPath, "\n", err);
        process.exit(1);
      }
    }
  }

  // 3. Scan components
  if (!fs.existsSync(componentsDir)) {
    console.error(
      chalk.red(
        `✖ Components directory not found: ${chalk.yellow(componentsDir)}`
      )
    );
    process.exit(1);
  }
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

  // 4. Setup temp dir
  const tmpDirObj = await tmp.dir({
    unsafeCleanup: true,
    prefix: "storybookify-",
  });
  const tmpDir = tmpDirObj.path;
  const tmpStories = path.join(tmpDir, "src/stories");
  console.log(
    chalk.yellow(`\n[storybookify] Using temp directory: ${tmpDir}\n`)
  );
  const tmpComponents = path.join(tmpDir, "src/components");

  // 5. Copy user components and generate stories
  await fs.ensureDir(tmpComponents);
  await fs.copy(componentsDir, tmpComponents);

  await fs.ensureDir(tmpStories);

  // Here’s the fix: For each component, calculate the new relative import path from story to component in temp dir
  for (const component of components) {
    const originalFile = component.filePath || component.path; // adjust per your scanner
    const relPath = path.relative(componentsDir, originalFile);
    const tempComponentPath = path.join(tmpComponents, relPath);
    let relativeImport = path
      .relative(tmpStories, tempComponentPath)
      .replace(/\.[tj]sx?$/, "");
    if (!relativeImport.startsWith(".")) relativeImport = "./" + relativeImport;

    const story = await generateStory(
      { ...component, importOverride: relativeImport },
      tmpStories
    );
    writeStoryFile(component, story, tmpStories);
  }

  // Pretty summary table
  const table = new Table({
    head: [chalk.cyan("Component"), chalk.cyan("Story File")],
  });
  for (const comp of components) {
    table.push([comp.name, `src/stories/${comp.name}.stories.tsx`]);
  }
  console.log("\n" + table.toString());

  // 6. Minimal Storybook config
  const sbDir = path.join(tmpDir, ".storybook");
  await fs.ensureDir(sbDir);
  await fs.writeFile(
    path.join(sbDir, "main.js"),
    `
export default {
  stories: ['../src/stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: { name: '@storybook/react-vite', options: {} }
};
    `.trim()
  );
  await fs.writeFile(
    path.join(sbDir, "preview.js"),
    `
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: { expanded: true },
};
    `.trim()
  );

  // 7. Minimal package.json (try to match user's react version)
  let userReact = "^18.0.0";
  let userReactDom = "^18.0.0";
  try {
    const userPkg = JSON.parse(
      fs.readFileSync(path.join(userRoot, "package.json"), "utf8")
    );
    userReact =
      userPkg.dependencies?.react ||
      userPkg.devDependencies?.react ||
      userReact;
    userReactDom =
      userPkg.dependencies?.["react-dom"] ||
      userPkg.devDependencies?.["react-dom"] ||
      userReactDom;
  } catch {}
  await fs.writeFile(
    path.join(tmpDir, "package.json"),
    JSON.stringify(
      {
        name: "storybookify-runner",
        private: true,
        scripts: { storybook: "storybook dev -p 6006" },
        dependencies: {
          react: userReact,
          "react-dom": userReactDom,
        },
        devDependencies: {
          "@storybook/react-vite": "^8.6.14",
          "@storybook/addon-essentials": "^8.6.14",
        },
      },
      null,
      2
    )
  );

  // 8. Minimal tsconfig (for TS/TSX support)
  await fs.writeFile(
    path.join(tmpDir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          jsx: "react-jsx",
          allowJs: true,
          esModuleInterop: true,
          resolveJsonModule: true,
          isolatedModules: true,
          module: "esnext",
          target: "esnext",
          moduleResolution: "node",
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
        },
        include: ["src"],
      },
      null,
      2
    )
  );

  // 9. Install and start Storybook
  console.log(
    chalk.cyan(
      "\n🚀 Setting up and launching Storybook in a fresh, isolated environment..."
    )
  );
  await execa("npm", ["install"], { cwd: tmpDir, stdio: "inherit" });
  console.log(
    boxen(
      chalk.green("✨ All done! Isolated Storybook is running ✨") +
        "\n" +
        chalk.cyan("Visit http://localhost:6006/ to view your Storybook."),
      {
        padding: 1,
        borderColor: "green",
        borderStyle: "round",
      }
    )
  );
  await execa("npm", ["run", "storybook"], { cwd: tmpDir, stdio: "inherit" });

  // Optional: clean up temp dir on exit
  tmpDirObj.cleanup();
}

runIsolatedStorybook();
