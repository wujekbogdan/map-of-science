import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMapCluster } from "../../../cluster/test-utils/createMapCluster.ts";
import { ClusterHoverOverlay } from "./ClusterHoverOverlay.tsx";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

afterEach(() => {
  cleanup();
});

describe("ClusterHoverOverlay", () => {
  it("should render nothing when no cluster is hovered", () => {
    const { queryByText } = render(<ClusterHoverOverlay cluster={null} />);
    expect(queryByText(/Hovered Cluster/)).toBeNull();
  });

  it("should render a tooltip with the hovered cluster's display name", () => {
    const { queryByText } = render(
      <ClusterHoverOverlay
        cluster={createMapCluster({
          id: "hovered",
          displayName: "Hovered Cluster",
        })}
      />,
    );
    expect(queryByText("Hovered Cluster")).toBeTruthy();
  });
});
