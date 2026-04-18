import { cleanup, render } from "@testing-library/react";
import i18next, { type i18n } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { RouterOutputs } from "../../api-client/index.ts";
import { ArticleWithVideos } from "./ArticleWithVideos.tsx";

type Item = RouterOutputs["content"]["byArea"][number];

const buildItem = (overrides: Partial<Item> = {}): Item => ({
  id: "item-1",
  type: "youtube-segment",
  title: "Qubits explained",
  url: "https://www.youtube.com/watch?v=abc123&t=42s",
  metadata: {
    videoId: "abc123",
    segmentUrl: "https://www.youtube.com/watch?v=abc123&t=42s",
    segmentName: "Qubits explained",
    date: "2026-01-15",
  },
  entityRefs: [],
  ...overrides,
});

let instance: i18n;

beforeEach(async () => {
  instance = i18next.createInstance();
  await instance.use(initReactI18next).init({
    lng: "en",
    resources: {
      en: {
        translation: {
          article: {
            youtubeRelated: "Related videos",
            youtubeNone: "No related videos",
          },
        },
      },
    },
  });
});

afterEach(() => {
  cleanup();
});

const renderPanel = (props: React.ComponentProps<typeof ArticleWithVideos>) =>
  render(
    <I18nextProvider i18n={instance}>
      <ArticleWithVideos {...props} />
    </I18nextProvider>,
  );

describe("ArticleWithVideos", () => {
  it("should render the related header and a thumbnail link per item", () => {
    const { getByText, getAllByRole } = renderPanel({
      html: null,
      items: [
        buildItem({
          id: "a",
          metadata: {
            ...buildItem().metadata,
            videoId: "vid-a",
            segmentName: "A",
          },
        }),
        buildItem({
          id: "b",
          metadata: {
            ...buildItem().metadata,
            videoId: "vid-b",
            segmentName: "B",
          },
        }),
      ],
    });

    expect(getByText("Related videos")).toBeTruthy();
    const thumbs = getAllByRole("img");
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0].getAttribute("src")).toContain("vid-a");
    expect(thumbs[1].getAttribute("src")).toContain("vid-b");
  });

  it("should render the empty header when there are no items", () => {
    const { getByText, queryAllByRole } = renderPanel({
      html: null,
      items: [],
    });

    expect(getByText("No related videos")).toBeTruthy();
    expect(queryAllByRole("img")).toHaveLength(0);
  });
});
