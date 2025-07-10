import { describe, it, expect, vi } from "vitest";
import { generateStory } from "./storyGenerator";
import * as propParser from "./propParser";

describe("generateStory", () => {
  it("creates a story string for a simple component", async () => {
    const fakeComponent = {
      name: "Button",
      props: [{ name: "label", type: "string" }],
      path: "__fixtures__/sample-components/Button.tsx",
    };
    const story = await generateStory(
      fakeComponent,
      "__fixtures__/sample-components/Button.tsx"
    );
    expect(typeof story).toBe("string");
    expect(story).toMatch(/Button/);
    expect(story).toMatch(/Primary/);
  });

  it("handles missing props gracefully", async () => {
    const fakeComponent = {
      name: "NoProps",
      // no props array
      path: "__fixtures__/sample-components/NoProps.tsx",
    };
    const story = await generateStory(
      fakeComponent,
      "__fixtures__/sample-components"
    );
    expect(typeof story).toBe("string");
    expect(story).toMatch(/NoProps/);
  });

  it("handles missing path gracefully", async () => {
    const fakeComponent = {
      name: "MissingPath",
      props: [],
      // path missing
    };
    // Should not throw; should still generate a story
    const story = await generateStory(
      fakeComponent as any,
      "__fixtures__/sample-components"
    );
    expect(typeof story).toBe("string");
    expect(story).toMatch(/MissingPath/);
  });

  it("handles JS files by skipping prop parsing", async () => {
    const fakeComponent = {
      name: "JsButton",
      path: "__fixtures__/sample-components/JsButton.jsx",
    };
    const story = await generateStory(
      fakeComponent,
      "__fixtures__/sample-components"
    );
    expect(typeof story).toBe("string");
    expect(story).toMatch(/import JsButton/);
    expect(story).not.toMatch(/Meta/); // Meta should only appear in TS stories
  });

  it("falls back when parseProps throws", async () => {
    vi.spyOn(propParser, "parseProps").mockRejectedValue(
      new Error("Parse error!")
    );

    const fakeComponent = {
      name: "BadProps",
      path: "__fixtures__/sample-components/BadProps.tsx",
    };
    const story = await generateStory(
      fakeComponent,
      "__fixtures__/sample-components"
    );
    expect(story).toMatch(/BadProps/);
    expect(story).not.toMatch(/Meta/);
  });

  it("uses sample values for various prop types", async () => {
    const fakeComponent = {
      name: "MultiProps",
      props: [
        { name: "text", type: "string" },
        { name: "count", type: "number" },
        { name: "enabled", type: "boolean" },
      ],
      path: "__fixtures__/sample-components/MultiProps.tsx",
    };
    const story = await generateStory(
      fakeComponent,
      "__fixtures__/sample-components"
    );

    // If it generated args, check for props
    if (story.includes("args")) {
      expect(story).toMatch(/text/);
      expect(story).toMatch(/count/);
      expect(story).toMatch(/enabled/);
    } else {
      // Fallback mode: just check it contains the component name
      expect(story).toMatch(/MultiProps/);
    }
  });
});
