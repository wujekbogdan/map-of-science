import type { FC } from "react";
import type { ZodRawShape } from "zod";

export type FilterComponentProps<TValue> = {
  value: TValue;
  onChange: (next: TValue) => void;
};

type FilterContainerProps = {
  params: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
};

export type Filter = {
  id: string;
  routeSchema: ZodRawShape;
  Component: FC<FilterContainerProps>;
};

type FilterSpec<TValue> = {
  id: string;
  routeSchema: ZodRawShape;
  parse: (params: Record<string, unknown>) => TValue;
  serialize: (value: TValue) => Record<string, unknown>;
  Component: FC<FilterComponentProps<TValue>>;
};

export const defineFilter = <TValue,>(spec: FilterSpec<TValue>): Filter => {
  const Container: FC<FilterContainerProps> = ({ params, onChange }) => (
    <spec.Component
      value={spec.parse(params)}
      onChange={(next) => onChange(spec.serialize(next))}
    />
  );

  return {
    id: spec.id,
    routeSchema: spec.routeSchema,
    Component: Container,
  };
};
