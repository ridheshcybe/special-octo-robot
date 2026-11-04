import { cx } from "@/lib/cx";
import type { CSSProperties, ReactNode } from "react";

type EyebrowProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** The small uppercase label that sits above most section headings. */
export function Eyebrow({ children, className, style }: EyebrowProps) {
  return (
    <p className={cx("eyebrow", className)} style={style}>
      <span className="dot" aria-hidden="true" />
      {children}
    </p>
  );
}
