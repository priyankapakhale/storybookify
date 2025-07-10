export default {
  componentsDir: "./example-components", // stories will be scanned from this directory
  outputDir: "storybook-app/src/stories", // generated stories will be saved here
  exclude: ["**/*.test.tsx", "**/__mocks__/**", "**/deprecated/**"], // glob patterns
  include: ["**/*.tsx", "**/*.jsx"], // optional, default: all component files
}