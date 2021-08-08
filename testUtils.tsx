import React from "react";
import { toHaveNoViolations, axe } from "jest-axe";
import { render, RenderOptions, RenderResult } from "@testing-library/react";

expect.extend(toHaveNoViolations);

interface OptionsProps extends RenderOptions {
  disableSnapshotTest?: boolean;
  disableA11yTest?: boolean;
  disableEventListenerTest?: boolean;
}

interface DisalbeA11yTestOptionsProps extends OptionsProps {
  disableA11yTest: true;
}

export function enhancedRender(ui: React.ReactElement): Promise<RenderResult>;

export function enhancedRender(
  ui: React.ReactElement,
  options?: DisalbeA11yTestOptionsProps
): RenderResult;

export function enhancedRender(
  ui: React.ReactElement,
  options?: OptionsProps
): Promise<RenderResult>;

export function enhancedRender(
  ui: React.ReactElement,
  options: OptionsProps | DisalbeA11yTestOptionsProps = {}
): Promise<RenderResult> | RenderResult {
  const { disableEventListenerTest, disableSnapshotTest, disableA11yTest } =
    options;
  const { mockedAddEventListener, mockedRemoveEventListener, map } =
    getEventListeners(disableEventListenerTest);

  const { unmount } = render(ui, options);
  unmount();

  validateEventListeners({
    disableEventListenerTest,
    mockedAddEventListener,
    mockedRemoveEventListener,
    map,
  });

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

const getEventListeners = (disableEventListenerTest?: boolean) => {
  let map: undefined | Map<string, boolean> = undefined;
  let mockedAddEventListener;
  let mockedRemoveEventListener;

  if (!disableEventListenerTest) {
    map = new Map();
    mockedAddEventListener = jest
      .spyOn(window, "addEventListener")
      .mockImplementation((type) => map?.set(type, true));

    mockedRemoveEventListener = jest
      .spyOn(window, "removeEventListener")
      .mockImplementation((type) => map?.delete(type));
  }

  return { mockedAddEventListener, mockedRemoveEventListener, map };
};

const validateEventListeners = ({
  disableEventListenerTest,
  mockedAddEventListener,
  mockedRemoveEventListener,
  map,
}: {
  disableEventListenerTest?: boolean;
  mockedAddEventListener?: any;
  mockedRemoveEventListener?: any;
  map?: Map<string, boolean>;
}) => {
  if (!disableEventListenerTest) {
    const expected = getLeakedEventListenerMessage([]);
    const actual = getLeakedEventListenerMessage(Array.from(map?.keys() || []));
    expect(actual).toEqual(expected);

    mockedAddEventListener?.mockRestore();
    mockedRemoveEventListener?.mockRestore();
  }
};
