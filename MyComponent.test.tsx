import React from "react";
import { toHaveNoViolations, axe } from "jest-axe";
import { render } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

expect.extend(toHaveNoViolations);

describe("MyComponent", () => {
  it("renders", () => {
    const { container } = render(<MyComponent />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("passes a11y checks", async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
