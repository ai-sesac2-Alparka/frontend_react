import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders onboarding logo", () => {
  render(<App />);
  const logo = screen.getByAltText(/AIparkA/i);
  expect(logo).toBeInTheDocument();
});
