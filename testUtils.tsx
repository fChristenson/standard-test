import React from "react";
import { toHaveNoViolations, axe } from "jest-axe";
import { render, RenderOptions, RenderResult } from "@testing-library/react";

expect.extend(toHaveNoViolations);

interface OptionsProps {
  disableSnapshotTest?: boolean;
  disableA11yTest?: boolean;
}

type Options = RenderOptions & OptionsProps;
type OptionsWithoutA11yTest = Options & { disableA11yTest: true };

export function enhancedRender(
  ui: React.ReactElement,
  options?: OptionsWithoutA11yTest
): RenderResult;

export function enhancedRender(
  ui: React.ReactElement,
  options?: Options
): Promise<RenderResult>;

export function enhancedRender(
  ui: React.ReactElement,
  options: Options | OptionsWithoutA11yTest = {}
): Promise<RenderResult> | RenderResult {
  const { disableSnapshotTest, disableA11yTest } = options;
  const map = new Map();
  const mockedAddEventListener = jest
    .spyOn(window, "addEventListener")
    .mockImplementation((type) => map.set(type, true));

  const mockedRemoveEventListener = jest
    .spyOn(window, "removeEventListener")
    .mockImplementation((type) => map.delete(type));

  const { unmount } = render(ui, options);
  unmount();

  const expected = getLeakedEventListenerMessage([]);
  const actual = getLeakedEventListenerMessage(Array.from(map.keys()));
  expect(actual).toEqual(expected);

  mockedAddEventListener.mockRestore();
  mockedRemoveEventListener.mockRestore();
  jest.useRealTimers();

  const result = render(ui, options);

  if (!disableSnapshotTest)
    expect(result.container.firstChild).toMatchSnapshot();

  if (!disableA11yTest)
    return axe(result.container).then((axeResult) => {
      expect(axeResult).toHaveNoViolations();
      return result;
    });

  return result;
}

const getLeakedEventListenerMessage = (array: string[]) =>
  `Found leaked event listeners [${array}]`;
