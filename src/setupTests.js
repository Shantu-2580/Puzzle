// Vitest setup file
// Any global setup for tests can go here

// Mock resizeObserver if needed
if (typeof window !== 'undefined') {
  window.ResizeObserver = window.ResizeObserver || class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}