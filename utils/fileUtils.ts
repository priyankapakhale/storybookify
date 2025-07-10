import fs from "fs";
import path from "path";

// utils/fileUtils.js
export function writeStoryFile(component, story, outputDir) {
  const fileName = `${component.name}.stories.tsx`;
  const filePath = path.join(outputDir, fileName);
  fs.writeFileSync(filePath, story);
  return filePath;
}
