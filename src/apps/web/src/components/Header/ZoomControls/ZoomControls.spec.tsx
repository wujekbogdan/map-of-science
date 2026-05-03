import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useMapStore } from "../../../map/mapStore.ts";
import { MapView } from "../../../map/view/mapView.tsx";
import { createFakeDebouncer } from "../../../map/view/test-utils/createFakeDebouncer.ts";
import { createFakeDriver } from "../../../map/view/test-utils/createFakeDriver.ts";
import { ZoomControls } from "./ZoomControls.tsx";

const baseConfig = () => {
  const fake = createFakeDriver();
  const debouncer = createFakeDebouncer();
  return {
    fake,
    config: {
      scaleExtent: { min: 0.5, max: 100 },
      debounceMs: 0,
      initial: { x: 0, y: 0, scale: 1 },
      defaults: { animate: true, padding: 0.1 },
      createDriver: fake.create,
      createDebouncer: debouncer.create,
    },
  };
};

afterEach(() => {
  cleanup();
});

describe("ZoomControls", () => {
  it("should call view.zoomBy with the configured step factor when + is clicked", () => {
    const { fake, config } = baseConfig();
    const stepFactor = useMapStore.getState().zoomStepFactor;

    const { getByText } = render(
      <MapView
        config={config}
        size={{ width: 800, height: 600 }}
        chrome={<ZoomControls />}
      />,
    );

    fireEvent.click(getByText("+"));

    expect(fake.scaleBy).toHaveBeenCalledWith(stepFactor, { animate: true });
  });

  it("should call view.zoomBy with the inverse step factor when − is clicked", () => {
    const { fake, config } = baseConfig();
    const stepFactor = useMapStore.getState().zoomStepFactor;

    const { getByText } = render(
      <MapView
        config={config}
        size={{ width: 800, height: 600 }}
        chrome={<ZoomControls />}
      />,
    );

    fireEvent.click(getByText("−"));

    expect(fake.scaleBy).toHaveBeenCalledWith(1 / stepFactor, {
      animate: true,
    });
  });
});
