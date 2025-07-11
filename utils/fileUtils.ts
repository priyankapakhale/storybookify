import fs from "fs";
import path from "path";

/**
 * Writes a generated Storybook story to disk.
 * Ensures the output directory exists. Warns if file is overwritten.
 * @param {object} component - { name }
 * @param {string} story - The source code to write.
 * @param {string} outputDir - Where to place the story file.
 * @returns {string} filePath - The absolute path to the story file.
 */
export function writeStoryFile(component, story, outputDir) {
  const fileName = `${component.name}.stories.tsx`;
  const filePath = path.join(outputDir, fileName);

  // Ensure the output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Warn if file already exists (optional)
  if (fs.existsSync(filePath)) {
    console.warn(`⚠️ Overwriting existing story file: ${filePath}`);
  }

  try {
    fs.writeFileSync(filePath, story, "utf8");
    return filePath;
  } catch (err) {
    console.error(`❌ Failed to write story file: ${filePath}\n`, err);
    throw err;
  }
}
