import styled from "styled-components";

export type Token = { text: string; type: "regular" | "bold" };

export const SIZE_COLUMN_WIDTH_PX = 64;
export const ROW_GAP_PX = 8;

export const RowLine = styled.div`
  display: flex;
  align-items: center;
  gap: ${ROW_GAP_PX}px;
`;

export const MetaGroup = styled.span`
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  flex-shrink: 0;
  gap: 6px;
  width: ${SIZE_COLUMN_WIDTH_PX}px;
  /* Match the height of one line of the row's text so dot+count
     occupy the same vertical space as the search result label's first line. */
  min-height: 1lh;
`;

export const CountLabel = styled.span`
  color: #999;
  font-size: 12px;
  /* Inherit line-height ratio so the smaller font-size doesn't reduce the
     line-box; keeps count text vertically centered with the cluster name. */
  line-height: inherit;
`;

export const TrailingIcon = styled.img`
  margin-left: auto;
`;
