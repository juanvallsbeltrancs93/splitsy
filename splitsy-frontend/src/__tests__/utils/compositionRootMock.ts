let _testCompositionRoot: unknown = null;

export function setTestCompositionRoot(root: unknown) {
  _testCompositionRoot = root;
}

export function getTestCompositionRoot(): unknown {
  return _testCompositionRoot;
}

export function clearTestCompositionRoot() {
  _testCompositionRoot = null;
}
