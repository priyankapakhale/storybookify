export function generateSampleValue(type: string) {
  if (type.includes("string")) return "Sample Text";
  if (type.includes("number")) return 42;
  if (type.includes("boolean")) return true;
  if (type.includes("ReactNode")) return "React Content";
  return "Sample";
}
