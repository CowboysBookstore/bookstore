import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";

vi.mock("axios", () => ({
  default: {
    get: vi.fn().mockRejectedValue(new Error("Catalog API is unavailable in tests.")),
  },
}));

beforeEach(() => {
  window.sessionStorage.clear();
});
