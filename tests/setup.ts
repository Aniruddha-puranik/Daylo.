import '@testing-library/jest-dom/vitest';
Object.defineProperty(window, 'matchMedia', { writable: true, value: (query: string) => ({ matches: query.includes('reduce') ? false : false, media: query, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false }) });
