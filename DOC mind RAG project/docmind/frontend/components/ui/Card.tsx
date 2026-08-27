import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-instrument border border-hairline bg-white shadow-sm transition-shadow duration-200",
        "hover:shadow-red-glow",
        className
      )}
      {...props}
    />
  );
}
