import "@testing-library/dom";
import { beforeEach } from "vitest";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
