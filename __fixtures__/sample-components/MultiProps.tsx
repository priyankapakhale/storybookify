import React from "react";

export interface MultiPropsProps {
  text: string;
  count: number;
  enabled: boolean;
}

export const MultiProps: React.FC<MultiPropsProps> = ({
  text,
  count,
  enabled,
}) => (
  <div>
    <p>Text: {text}</p>
    <p>Count: {count}</p>
    <p>Enabled: {enabled ? "Yes" : "No"}</p>
  </div>
);
