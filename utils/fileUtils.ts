import fs from "fs";
import path from "path";

export function writeStoryFile(
  component,
  storyCode: string,
  outputDir: string
) {
  const filename = path.join(outputDir, `${component.name}.stories.tsx`);
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, storyCode, "utf-8");
}
