import type React from "react";

type ClickSparkProps = {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: string;
  extraScale?: number;
  children?: React.ReactNode;
};

declare const ClickSpark: React.FC<ClickSparkProps>;
export default ClickSpark;
