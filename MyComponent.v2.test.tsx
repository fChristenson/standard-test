import React from "react";
import { MyComponent } from "./MyComponent";
import { enhancedRender } from "./testUtils";

describe("MyComponent test v2", () => {
  it("has a first child", async () => {
    const { container } = await enhancedRender(<MyComponent />);
    expect(container.firstChild).toBeTruthy();
  });

  it("has a first child with disabled checks", () => {
    const { container } = enhancedRender(<MyComponent />, {
      disableA11yTest: true,
      disableSnapshotTest: true,
    });
    expect(container.firstChild).toBeTruthy();
  });
});
