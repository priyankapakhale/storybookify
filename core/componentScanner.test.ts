import { describe, it, expect } from "vitest";
import { scanComponents } from "./componentScanner";
import path from "path";
import fs from "fs";

describe("scanComponents", () => {
  it("finds components in the sample directory", async () => {
    const components = await scanComponents("__fixtures__/sample-components", {
      include: ["**/*.tsx"],
      exclude: [],
    });
    expect(components.length).toBeGreaterThan(0);
    expect(components[0]).toHaveProperty("name");
  });

  it("returns empty array when directory is empty", async () => {
    // Create a temporary empty directory
    const emptyDir = path.resolve(__dirname, "../__fixtures__/empty-dir");
    if (!fs.existsSync(emptyDir)) {
      fs.mkdirSync(emptyDir, { recursive: true });
    }

    const components = await scanComponents(emptyDir, {
      include: ["**/*.tsx"],
      exclude: [],
    });
    expect(Array.isArray(components)).toBe(true);
    expect(components.length).toBe(0);
  });

  it("returns empty array when all files are excluded", async () => {
    const sampleDir = path.resolve(
      __dirname,
      "../__fixtures__/sample-components"
    );
    const components = await scanComponents(sampleDir, {
      include: ["**/*.tsx"],
      exclude: ["**/*.tsx"], // Exclude everything
    });
    expect(Array.isArray(components)).toBe(true);
    expect(components.length).toBe(0);
  });

  it("returns only included, non-excluded files", async () => {
    const sampleDir = path.resolve(
      __dirname,
      "../__fixtures__/sample-components"
    );
    const components = await scanComponents(sampleDir, {
      include: ["**/Button.tsx", "**/NoProps.tsx"],
      exclude: ["**/NoProps.tsx"],
    });
    expect(components.some((c) => c.name === "Button")).toBe(true);
    expect(components.some((c) => c.name === "NoProps")).toBe(false);
  });
});
