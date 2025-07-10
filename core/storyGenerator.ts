import path from "path";
import { parseProps } from "./propParser.js";
import { generateSampleValue } from "./sampleData.js";

export async function generateStory(component, outputDir: string) {
  const { name, path: filePath } = component;
  if (!filePath) {
    console.warn(`⚠️ No path for component "${name}", defaulting to ".tsx"`);
  }
  // Add a fallback to ".tsx" if filePath is missing
  const ext = filePath ? path.extname(filePath) : ".tsx";
  const isJS = ext === ".js" || ext === ".jsx";

  let relativeImportPath: string;

  if (filePath) {
    const importPath = path
      .relative(outputDir, filePath)
      .replace(/\.[tj]sx?$/, "");
    relativeImportPath = importPath.startsWith(".")
      ? importPath
      : "./" + importPath;
  } else {
    // Fallback: Assume component is importable by name from the current directory
    relativeImportPath = `./${name}`;
  }

  // ✅ JS fallback
  if (isJS) {
    console.warn(`⚠️ Skipping prop parsing for JS file: ${filePath}`);
    return `\
import ${name} from "${relativeImportPath}";

export default {
  title: "Components/${name}",
  component: ${name},
};

export const Primary = () => <${name} />;
`;
  }

  // ✅ TS parsing with fallback
  try {
    const props = await parseProps(filePath, name);

    const sampleArgs = Object.fromEntries(
      props.map((prop) => [prop.name, generateSampleValue(prop.type)])
    );

    return `\
import type { Meta, StoryObj } from "@storybook/react";
import { ${name} } from "${relativeImportPath}";

const meta: Meta<typeof ${name}> = {
  title: "Components/${name}",
  component: ${name},
  tags: ["autodocs"],
  args: ${JSON.stringify(sampleArgs, null, 2)}
};

export default meta;
type Story = StoryObj<typeof ${name}>;

export const Primary: Story = {};
`;
  } catch (err) {
    console.warn(`⚠️ Failed to parse props for ${name}: ${err.message}`);
    return `\
import { ${name} } from "${relativeImportPath}";

export default {
  title: "Components/${name}",
  component: ${name},
};

export const Primary = () => <${name} />;
`;
  }
}
