import type { Driver, DriverCallbacks } from "./driver.ts";
import type {
  BBox,
  CommandOptions,
  FitOptions,
  MapViewConfig,
  Point,
} from "./mapView.tsx";
import type { Transform } from "./transform.ts";

type Size = { width: number; height: number };

type Snapshot = {
  transform: Transform;
  settledTransform: Transform | undefined;
  bbox: BBox | null;
  isReady: boolean;
};

const createCell = <T>(initial: T) => {
  let value = initial;
  return {
    get: () => value,
    set: (next: T) => {
      value = next;
    },
  };
};

const computeFit = (box: BBox, size: Size, padding: number): Transform => {
  const boxWidth = box.x.max - box.x.min;
  const boxHeight = box.y.max - box.y.min;
  const padded = 1 + 2 * padding;
  const scale = Math.min(
    size.width / (boxWidth * padded),
    size.height / (boxHeight * padded),
  );
  const cx = (box.x.min + box.x.max) / 2;
  const cy = (box.y.min + box.y.max) / 2;
  return {
    x: -cx * scale + size.width / 2,
    y: -cy * scale + size.height / 2,
    scale,
  };
};

const boundsOf = (points: Point[]): BBox => {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    x: { min: Math.min(...xs), max: Math.max(...xs) },
    y: { min: Math.min(...ys), max: Math.max(...ys) },
  };
};

const computeBbox = (transform: Transform, size: Size): BBox => ({
  x: {
    min: -transform.x / transform.scale,
    max: (size.width - transform.x) / transform.scale,
  },
  y: {
    min: -transform.y / transform.scale,
    max: (size.height - transform.y) / transform.scale,
  },
});

const createCommands = <Surface>(args: {
  driver: Driver;
  config: MapViewConfig<Surface>;
  getLiveTransform: () => Transform;
  getSize: () => Size;
}) => {
  const { driver, config, getLiveTransform, getSize } = args;
  const animateFlag = (options?: CommandOptions) =>
    options?.animate ?? config.defaults.animate;
  const paddingFor = (options?: FitOptions) =>
    options?.padding ?? config.defaults.padding;

  return {
    zoomBy: (factor: number, options?: CommandOptions) => {
      driver.scaleBy(factor, { animate: animateFlag(options) });
    },
    zoomTo: (target: Transform, options?: CommandOptions) => {
      driver.applyTransform(target, { animate: animateFlag(options) });
    },
    panTo: (point: Point, options?: CommandOptions) => {
      const { scale } = getLiveTransform();
      const { width, height } = getSize();
      driver.applyTransform(
        {
          x: -point.x * scale + width / 2,
          y: -point.y * scale + height / 2,
          scale,
        },
        { animate: animateFlag(options) },
      );
    },
    fitToBox: (box: BBox, options?: FitOptions) => {
      driver.applyTransform(computeFit(box, getSize(), paddingFor(options)), {
        animate: animateFlag(options),
      });
    },
    fitToPoints: (points: Point[], options?: FitOptions) => {
      if (points.length === 0) return;
      if (points.length === 1) {
        const [point] = points;
        const { width, height } = getSize();
        driver.applyTransform(
          {
            x: -point.x + width / 2,
            y: -point.y + height / 2,
            scale: 1,
          },
          { animate: animateFlag(options) },
        );
        return;
      }
      driver.applyTransform(
        computeFit(boundsOf(points), getSize(), paddingFor(options)),
        { animate: animateFlag(options) },
      );
    },
  };
};

export const createController =
  <Surface>(config: MapViewConfig<Surface>) =>
  (surface: Surface) => {
    const snapshot = createCell<Snapshot>({
      transform: config.initial,
      settledTransform: undefined,
      bbox: null,
      isReady: false,
    });
    const size = createCell<Size>({ width: 0, height: 0 });
    const subscribers = new Set<() => void>();

    const update = (next: Partial<Snapshot>) => {
      snapshot.set({ ...snapshot.get(), ...next });
      for (const listen of subscribers) listen();
    };

    const debouncer = config.createDebouncer(config.debounceMs, () => {
      const settled = snapshot.get().transform;
      update({
        settledTransform: settled,
        bbox: computeBbox(settled, size.get()),
      });
    });

    const callbacks: DriverCallbacks = {
      onTransform: (next) => {
        update({ transform: next });
        debouncer.schedule();
      },
      onReady: () => {
        update({ isReady: true });
      },
    };

    const driver = config.createDriver({
      surface,
      callbacks,
      initial: config.initial,
      scaleExtent: config.scaleExtent,
    });

    const commands = createCommands({
      driver,
      config,
      getLiveTransform: () => snapshot.get().transform,
      getSize: size.get,
    });

    return {
      ...commands,
      setSize: (next: Size) => {
        size.set(next);
        const { settledTransform } = snapshot.get();
        if (settledTransform) {
          update({ bbox: computeBbox(settledTransform, next) });
        }
      },
      detach: () => {
        debouncer.cancel();
        driver.detach();
      },
      subscribe: (listener: () => void) => {
        subscribers.add(listener);
        return () => {
          subscribers.delete(listener);
        };
      },
      getSnapshot: () => snapshot.get(),
    };
  };
