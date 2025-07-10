import { Project } from "ts-morph";
import path from "path";

export async function parseProps(filePath: string, componentName: string) {
  console.log("📄 Parsing:", filePath);

  // If it's a JS/JSX file, we skip prop parsing
  const ext = path.extname(filePath);
  if (ext === ".js" || ext === ".jsx") {
    console.warn(`⚠️ Skipping prop parsing for JS file: ${filePath}`);
    return []; // Return empty props, or you could add placeholder props
  }

  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
  });

  const sourceFile = project.addSourceFileAtPath(filePath);
  const propsName = `${componentName}Props`;

  console.log("🔍 Looking for props:", propsName);

  const typeAlias = sourceFile.getTypeAlias(propsName);
  const interfaceDecl = sourceFile.getInterface(propsName);

  if (typeAlias) {
    console.log("✅ Found type alias for:", propsName);
    const type = typeAlias.getType();
    return type.getProperties().map((prop) => {
      const name = prop.getName();
      const typeText = prop.getValueDeclarationOrThrow().getType().getText();
      return { name, type: typeText };
    });
  }

  if (interfaceDecl) {
    console.log("✅ Found interface for:", propsName);
    return interfaceDecl.getProperties().map((prop) => {
      const name = prop.getName();
      const typeText = prop.getType().getText();
      return { name, type: typeText };
    });
  }

  // Debugging logs
  const typeAliases = sourceFile.getTypeAliases().map((t) => t.getName());
  const interfaces = sourceFile.getInterfaces().map((i) => i.getName());

  console.error("❌ Could not find props definition for:", propsName);
  console.log("📃 TypeAliases:", typeAliases);
  console.log("📘 Interfaces:", interfaces);

  throw new Error(`Could not find props definition for ${propsName}`);
}
