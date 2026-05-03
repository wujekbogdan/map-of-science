import { act, render, renderHook } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { describe, expect, it } from "vitest";
import {
  useBindZoomable,
  useMapView,
  useMapViewBbox,
  useMapViewIsReady,
  useMapViewScale,
  useMapViewTransform,
} from "./hooks.ts";
import { MapView } from "./mapView.tsx";
import type { BBox } from "./mapView.tsx";
import { createFakeDebouncer } from "./test-utils/createFakeDebouncer.ts";
import { createFakeDriver } from "./test-utils/createFakeDriver.ts";

const baseConfig = () => {
  const fake = createFakeDriver();
  const debouncer = createFakeDebouncer();
  return {
    fake,
    debouncer,
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

describe("MapView", () => {
  it("should throw when useMapView is called outside MapView", () => {
    expect(() => renderHook(() => useMapView())).toThrow();
  });

  it("should proxy zoomBy to the driver", () => {
    const { fake, config } = baseConfig();

    const Harness = () => {
      const view = useMapView();
      useEffect(() => {
        view.zoomBy(2);
      }, [view]);
      return null;
    };

    render(
      <MapView config={config} size={{ width: 800, height: 600 }}>
        <Harness />
      </MapView>,
    );

    expect(fake.scaleBy).toHaveBeenCalledWith(2, { animate: true });
  });

  it("should detach the driver when unmounted", () => {
    const { fake, config } = baseConfig();

    const { unmount } = render(
      <MapView config={config} size={{ width: 800, height: 600 }} />,
    );

    expect(fake.detach).not.toHaveBeenCalled();

    unmount();

    expect(fake.detach).toHaveBeenCalledTimes(1);
  });

  it("should pipe size changes to the controller", () => {
    const { fake, config } = baseConfig();

    const Harness = ({ trigger }: { trigger: number }) => {
      const view = useMapView();
      useEffect(() => {
        if (trigger > 0) view.panTo({ x: 0, y: 0 });
      }, [trigger, view]);
      return null;
    };

    const { rerender } = render(
      <MapView config={config} size={{ width: 800, height: 600 }}>
        <Harness trigger={0} />
      </MapView>,
    );

    rerender(
      <MapView config={config} size={{ width: 1000, height: 800 }}>
        <Harness trigger={1} />
      </MapView>,
    );

    expect(fake.applyTransform).toHaveBeenLastCalledWith(
      { x: 500, y: 400, scale: 1 },
      { animate: true },
    );
  });

  it("should set the svg's width and height attributes from the size prop", () => {
    const { config } = baseConfig();

    const { container } = render(
      <MapView config={config} size={{ width: 800, height: 600 }} />,
    );

    const svg = container.querySelector("svg");
    if (!svg) throw new Error("svg not found");
    expect(svg.getAttribute("width")).toBe("800");
    expect(svg.getAttribute("height")).toBe("600");
  });

  it("should render chrome as a DOM sibling that comes before the svg, with the view context available", () => {
    const { config } = baseConfig();

    let viewWasAccessible = false;
    const Chrome = () => {
      useMapView();
      viewWasAccessible = true;
      return <div data-testid="chrome">chrome</div>;
    };

    const { container, getByTestId } = render(
      <MapView
        config={config}
        size={{ width: 800, height: 600 }}
        chrome={<Chrome />}
      />,
    );

    expect(viewWasAccessible).toBe(true);

    const svg = container.querySelector("svg");
    if (!svg) throw new Error("svg not found");
    const chromeNode = getByTestId("chrome");
    expect(svg.contains(chromeNode)).toBe(false);
    // Chrome must precede the svg so fixed-positioned chrome with no explicit
    // top/left falls in flow at the top of the layout.
    expect(
      chromeNode.compareDocumentPosition(svg) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("should apply the background image and update its position on every transform change", () => {
    const { fake, config } = baseConfig();

    const { container } = render(
      <MapView
        config={config}
        size={{ width: 800, height: 600 }}
        background={{
          imageUrl: "http://example.test/map.svg",
          scaleFactor: 0.1,
          offset: { x: 0, y: 0 },
        }}
      />,
    );

    const svg = container.querySelector("svg");
    if (!svg) throw new Error("svg not found");

    expect(svg.style.backgroundImage).toBe(
      'url("http://example.test/map.svg")',
    );
    expect(svg.style.backgroundRepeat).toBe("no-repeat");

    const initialSize = svg.style.backgroundSize;

    act(() => {
      fake.fireTransform({ x: 100, y: 50, scale: 2 });
    });

    expect(svg.style.backgroundSize).not.toBe(initialSize);
  });

  it("should write the transform attribute on the bound element on every driver tick", () => {
    const { fake, config } = baseConfig();

    const Harness = () => {
      const ref = useRef<SVGGElement | null>(null);
      useBindZoomable(ref);
      return <g ref={ref} data-testid="bound" />;
    };

    const { getByTestId } = render(
      <MapView config={config} size={{ width: 800, height: 600 }}>
        <Harness />
      </MapView>,
    );

    expect(getByTestId("bound").getAttribute("transform")).toBe(
      "translate(0,0) scale(1)",
    );

    act(() => {
      fake.fireTransform({ x: 100, y: 50, scale: 2 });
    });

    expect(getByTestId("bound").getAttribute("transform")).toBe(
      "translate(100,50) scale(2)",
    );
  });

  it("should expose isReady via useMapViewIsReady, flipping when the driver fires onReady", () => {
    const { fake, config } = baseConfig();

    let lastReady: boolean | undefined;
    const Harness = () => {
      lastReady = useMapViewIsReady();
      return null;
    };

    render(
      <MapView config={config} size={{ width: 800, height: 600 }}>
        <Harness />
      </MapView>,
    );

    expect(lastReady).toBe(false);

    act(() => {
      fake.fireReady();
    });

    expect(lastReady).toBe(true);
  });

  it("should expose the bbox via useMapViewBbox once the debouncer fires", () => {
    const { fake, debouncer, config } = baseConfig();

    let lastBbox: BBox | null | undefined;
    const Harness = () => {
      lastBbox = useMapViewBbox();
      return null;
    };

    render(
      <MapView config={config} size={{ width: 800, height: 600 }}>
        <Harness />
      </MapView>,
    );

    expect(lastBbox).toBeNull();

    act(() => {
      fake.fireTransform({ x: 100, y: 50, scale: 2 });
      debouncer.fire();
    });

    expect(lastBbox).toEqual({
      x: { min: -50, max: 350 },
      y: { min: -25, max: 275 },
    });
  });

  it("should return a transform whose reference is stable while scale is unchanged", () => {
    const { fake, config } = baseConfig();

    let lastTransform: { x: number; y: number; scale: number } | undefined;
    const Harness = () => {
      lastTransform = useMapViewTransform();
      return null;
    };

    render(
      <MapView config={config} size={{ width: 800, height: 600 }}>
        <Harness />
      </MapView>,
    );

    const initial = lastTransform;
    expect(initial).toEqual({ x: 0, y: 0, scale: 1 });

    act(() => {
      fake.fireTransform({ x: 100, y: 50, scale: 1 });
    });
    expect(lastTransform).toBe(initial);

    act(() => {
      fake.fireTransform({ x: 100, y: 50, scale: 2 });
    });
    expect(lastTransform).not.toBe(initial);
    expect(lastTransform?.scale).toBe(2);
  });

  it("should expose the current scale via useMapViewScale", () => {
    const { fake, config } = baseConfig();

    const Harness = () => {
      const scale = useMapViewScale();
      return <div data-testid="scale">{scale}</div>;
    };

    const { getByTestId } = render(
      <MapView config={config} size={{ width: 800, height: 600 }}>
        <Harness />
      </MapView>,
    );

    expect(getByTestId("scale").textContent).toBe("1");

    act(() => {
      fake.fireTransform({ x: 0, y: 0, scale: 2 });
    });

    expect(getByTestId("scale").textContent).toBe("2");
  });
});
