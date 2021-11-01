import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Tulip heading", () => {
  render(<App />);
  const linkElement = screen.getByText("Tulip 🌷");
  expect(linkElement).toBeInTheDocument();
});
