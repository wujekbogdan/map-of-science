import type { Driver, DriverCallbacks, MapViewSignal } from "./driver.ts";
import type { Transform } from "./transform.ts";
import type {
  BBox,
  CommandOptions,
  FitOptions,
  Inset,
  MapViewConfig,
  Point,
} from "./types.ts";

type Size = { width: number; height: number };

const noInset: Inset = { top: 0, right: 0, bottom: 0, left: 0 };

// The viewport region left uncovered by docked panels. An axis whose inset
// would leave no usable space falls back to the full size, so centering never
// targets a zero or negative area.
const safeAreaOf = (size: Size, inset: Inset) => {
  const insetWidth = size.width - inset.left - inset.right;
  const insetHeight = size.height - inset.top - inset.bottom;
  const hasWidth = insetWidth > 0;
  const hasHeight = insetHeight > 0;
  return {
    width: hasWidth ? insetWidth : size.width,
    height: hasHeight ? insetHeight : size.height,
    centerX: hasWidth ? inset.left + insetWidth / 2 : size.width / 2,
    centerY: hasHeight ? inset.top + insetHeight / 2 : size.height / 2,
  };
};

type Snapshot = {
  transform: Transform;
  settledTransform: Transform | undefined;
  bbox: BBox | null;
  isReady: boolean;
  isSettled: boolean;
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

const computeFit = (
  box: BBox,
  size: Size,
  padding: number,
  inset: Inset,
): Transform => {
  const safe = safeAreaOf(size, inset);
  const boxWidth = box.x.max - box.x.min;
  const boxHeight = box.y.max - box.y.min;
  const padded = 1 + 2 * padding;
  const scale = Math.min(
    safe.width / (boxWidth * padded),
    safe.height / (boxHeight * padded),
  );
  const cx = (box.x.min + box.x.max) / 2;
  const cy = (box.y.min + box.y.max) / 2;
  return {
    x: -cx * scale + safe.centerX,
    y: -cy * scale + safe.centerY,
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
  getInset: () => Inset;
}) => {
  const { driver, config, getLiveTransform, getSize, getInset } = args;
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
      const safe = safeAreaOf(getSize(), getInset());
      driver.applyTransform(
        {
          x: -point.x * scale + safe.centerX,
          y: -point.y * scale + safe.centerY,
          scale,
        },
        { animate: animateFlag(options) },
      );
    },
    centerOn: (point: Point, options?: CommandOptions & { scale?: number }) => {
      const scale = options?.scale ?? getLiveTransform().scale;
      const safe = safeAreaOf(getSize(), getInset());
      driver.applyTransform(
        {
          x: -point.x * scale + safe.centerX,
          y: -point.y * scale + safe.centerY,
          scale,
        },
        { animate: animateFlag(options) },
      );
    },
    fitToBox: (box: BBox, options?: FitOptions) => {
      driver.applyTransform(
        computeFit(box, getSize(), paddingFor(options), getInset()),
        { animate: animateFlag(options) },
      );
    },
    fitToPoints: (points: Point[], options?: FitOptions) => {
      if (points.length === 0) return;
      if (points.length === 1) {
        const [point] = points;
        const safe = safeAreaOf(getSize(), getInset());
        driver.applyTransform(
          {
            x: -point.x + safe.centerX,
            y: -point.y + safe.centerY,
            scale: 1,
          },
          { animate: animateFlag(options) },
        );
        return;
      }
      driver.applyTransform(
        computeFit(
          boundsOf(points),
          getSize(),
          paddingFor(options),
          getInset(),
        ),
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
      isSettled: true,
    });
    const size = createCell<Size>({ width: 0, height: 0 });
    const inset = createCell<Inset>(noInset);
    const subscribers = new Set<() => void>();
    const tapListeners = new Set<MapViewSignal>();

    const update = (next: Partial<Snapshot>) => {
      snapshot.set({ ...snapshot.get(), ...next });
      for (const listen of subscribers) listen();
    };

    const debouncer = config.createDebouncer(config.debounceMs, () => {
      const settled = snapshot.get().transform;
      update({
        settledTransform: settled,
        bbox: computeBbox(settled, size.get()),
        isSettled: true,
      });
    });

    const callbacks: DriverCallbacks = {
      onTransform: (next) => {
        update({ transform: next, isSettled: false });
        debouncer.schedule();
      },
      onReady: () => {
        update({ isReady: true });
      },
      onBackgroundTap: () => {
        for (const listener of [...tapListeners]) listener();
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
      getInset: inset.get,
    });

    return {
      ...commands,
      setInset: (next: Inset) => {
        inset.set(next);
      },
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
        tapListeners.clear();
      },
      subscribe: (listener: () => void) => {
        subscribers.add(listener);
        return () => {
          subscribers.delete(listener);
        };
      },
      onBackgroundTap: (listener: MapViewSignal) => {
        tapListeners.add(listener);
        return () => {
          tapListeners.delete(listener);
        };
      },
      getSnapshot: () => snapshot.get(),
    };
  };
