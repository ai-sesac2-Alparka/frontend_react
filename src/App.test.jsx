import { render, screen } from "@testing-library/react";
import App from "./App";
import { vi, expect } from "vitest";
import matchers from "@testing-library/jest-dom/matchers";

// Vitest 환경에서 CRA setupTests.js 경로를 찾지 못해 발생하는 모듈 에러를 방지
vi.mock("./setupTests.js", () => ({}));
vi.mock("./setupTests", () => ({}));

expect.extend(matchers || {});

test("renders app shell", () => {
  render(<App />);
  const logo = screen.getByAltText(/AIparkA/i);
  expect(logo).toBeTruthy();
});
