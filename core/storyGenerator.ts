import path from "path";
import { parseProps } from "./propParser.js";
import { generateSampleValue } from "./sampleData.js";

/**
 * Generate a Storybook story file for a given component (temp runner version).
 * Always imports from '../components/{name}' to work in the isolated temp dir.
 * @param {object} component - { name, ... }
 * @param {string} outputDir - (Not used; import is always ../components/NAME)
 * @returns {Promise<string>} Storybook story source
 */
export async function generateStory(component, outputDir) {
  const { name, filePath } = component;

  // ALWAYS import from ../components/ComponentName
  // (For JS/TS: extension is omitted on import)
  const importPath = `../components/${name}`;

  // --- Detect JS or TS for fallback behavior ---
  const ext = filePath ? path.extname(filePath) : ".tsx";
  const isJS = ext === ".js" || ext === ".jsx";

  if (isJS) {
    return `\
import ${name} from "${importPath}";

export default {
  title: "Components/${name}",
  component: ${name},
};

export const Primary = () => <${name} />;
`;
  }

  // --- Try to parse props for TS/TSX ---
  try {
    const props = filePath ? await parseProps(filePath, name) : [];
    const sampleArgs = Object.fromEntries(
      props.map((prop) => [prop.name, generateSampleValue(prop.type)])
    );

    return `\
import type { Meta, StoryObj } from "@storybook/react";
import { ${name} } from "${importPath}";

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
    // Fallback for TS: parsing failed
    console.warn(`⚠️ Failed to parse props for ${name}: ${err.message}`);
    return `\
import { ${name} } from "${importPath}";

export default {
  title: "Components/${name}",
  component: ${name},
};

export const Primary = () => <${name} />;
`;
  }
}
