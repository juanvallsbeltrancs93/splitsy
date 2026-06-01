import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { clearMockLoaderData } from './utils/RenderComponent';
import { clearTestCompositionRoot } from './utils/compositionRootMock';

afterEach(() => {
  cleanup();
  clearMockLoaderData();
  clearTestCompositionRoot();
});
