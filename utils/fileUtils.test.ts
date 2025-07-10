import { describe, it, expect, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { writeStoryFile } from "./fileUtils";

const tmpDir = path.resolve(__dirname, "../__fixtures__/tmp-stories");

afterEach(() => {
  // Cleanup: remove files created during tests
  if (fs.existsSync(tmpDir)) {
    fs.readdirSync(tmpDir).forEach((f) => fs.unlinkSync(path.join(tmpDir, f)));
    fs.rmdirSync(tmpDir);
  }
});

describe("writeStoryFile", () => {
  it("writes a story to the correct location", () => {
    fs.mkdirSync(tmpDir, { recursive: true });
    const fakeComponent = { name: "TestCard" };
    const storyContent = "// story content";
    const filePath = writeStoryFile(fakeComponent, storyContent, tmpDir);

    expect(fs.existsSync(filePath)).toBe(true);
    const contents = fs.readFileSync(filePath, "utf8");
    expect(contents).toBe(storyContent);
    expect(path.basename(filePath)).toBe("TestCard.stories.tsx");
  });

  it("throws or handles error for invalid outputDir", () => {
    const fakeComponent = { name: "InvalidDir" };
    const storyContent = "// story content";
    expect(() =>
      writeStoryFile(fakeComponent, storyContent, "/no/such/dir/should/exist")
    ).toThrow();
  });

  it("overwrites an existing story file", () => {
    const tmpDir = path.resolve(__dirname, "../__fixtures__/tmp-stories");
    fs.mkdirSync(tmpDir, { recursive: true });
    const fakeComponent = { name: "OverwriteMe" };
    const filePath = path.join(tmpDir, "OverwriteMe.stories.tsx");

    fs.writeFileSync(filePath, "old content");

    const newContent = "// new content";
    writeStoryFile(fakeComponent, newContent, tmpDir);

    const result = fs.readFileSync(filePath, "utf8");
    expect(result).toBe(newContent);
  });
});
