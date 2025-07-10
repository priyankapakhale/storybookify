export function handleLibrarySpecifics(component: any) {
  if (component.filePath.includes("@mui")) {
    // e.g., skip `ref` props or inject theme provider
  }
}
