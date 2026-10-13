// Extiende `expect` con los matchers de Testing Library (toBeInTheDocument, etc.)
// para los tests de componentes (Tier 2). Inofensivo para los tests puros.
import "@testing-library/jest-dom/vitest";

if (typeof window !== "undefined") {
  // jsdom no implementa matchMedia; `configurable` deja que cada test lo redefina (p. ej. reduced motion).
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
