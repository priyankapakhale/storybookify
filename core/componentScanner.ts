import fg from "fast-glob";
import { join, extname, basename } from "path";
import fs from "fs";

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
  // Set sensible defaults if not provided
  const include =
    Array.isArray(options.include) && options.include.length > 0
      ? options.include
      : ["**/*.tsx", "**/*.jsx"];
  const exclude =
    Array.isArray(options.exclude) && options.exclude.length > 0
      ? options.exclude
      : ["**/*.test.*", "**/__mocks__/**", "**/deprecated/**"];

  // Use fast-glob to find matching files
  const entries = await fg(include, {
    cwd: componentsDir,
    ignore: exclude,
    onlyFiles: true,
    absolute: true,
  });

  // For each file, create a minimal component info object
  const components: { name: string; path: string }[] = [];
  for (const file of entries) {
    // Parse out component name from filename
    const name = basename(file, extname(file));

    // Optionally: Check file for a valid export (optional)
    const content = fs.readFileSync(file, "utf-8");
    if (!/export\s+(default|const|function|class)\s+/g.test(content)) continue;

    components.push({
      name,
      path: file,
    });
  }

  return components;
}
