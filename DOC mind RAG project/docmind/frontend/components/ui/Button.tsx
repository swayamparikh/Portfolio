import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "danger" | "console";
}

export function Button({ className, variant = "outline", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-instrument border px-4 py-2 text-sm font-medium tracking-tight transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "outline" &&
          "border-signal bg-white text-signal hover:bg-signal hover:text-white hover:shadow-red-glow",
        variant === "primary" && "border-signal bg-signal text-white hover:shadow-red-glow",
        variant === "danger" && "border-signal bg-white text-signal hover:bg-signal hover:text-white",
        variant === "console" &&
          "border-white bg-transparent text-white hover:bg-white hover:text-black hover:shadow-white-glow",
        className
      )}
      {...props}
    />
  );
}
