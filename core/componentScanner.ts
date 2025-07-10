import fg from "fast-glob";
import fs from "fs";
import { basename, extname } from "path";

export interface ScanOptions {
  include?: string[];
  exclude?: string[];
}

/**
 * Scans a directory for component files, applying include/exclude patterns.
 * Returns an array of component info objects.
 */
export async function scanComponents(
  componentsDir: string,
  options: ScanOptions = {}
): Promise<{ name: string; path: string }[]> {
  try {
    // Debug: log what is being scanned
    // console.log("scanComponents:", { componentsDir, options });

    const include =
      Array.isArray(options.include) && options.include.length > 0
        ? options.include
        : ["**/*.tsx", "**/*.jsx"];
    const exclude =
      Array.isArray(options.exclude) && options.exclude.length > 0
        ? options.exclude
        : ["**/*.test.*", "**/__mocks__/**", "**/deprecated/**"];

    if (!fs.existsSync(componentsDir)) {
      console.warn(`⚠️ Components directory does not exist: ${componentsDir}`);
      return [];
    }

    const entries = await fg(include, {
      cwd: componentsDir,
      ignore: exclude,
      onlyFiles: true,
      absolute: true,
    });

    const components: { name: string; path: string }[] = [];
    for (const file of entries) {
      const name = basename(file, extname(file));
      try {
        const content = fs.readFileSync(file, "utf-8");
        if (!/export\s+(default|const|function|class)\s+/g.test(content))
          continue;
        components.push({ name, path: file });
      } catch (err) {
        console.warn(`⚠️ Failed to read file: ${file} - Skipping.`, err);
      }
    }

    return components;
  } catch (err) {
    console.error("❌ scanComponents failed:", err);
    return [];
  }
}
