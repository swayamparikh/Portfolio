import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-coral-from to-coral-to text-white shadow-[0_8px_20px_rgba(255,56,92,0.25)] hover:shadow-[0_10px_26px_rgba(255,56,92,0.35)] hover:-translate-y-0.5",
  secondary:
    "bg-ocean text-white shadow-[0_6px_16px_rgba(26,115,232,0.25)] hover:-translate-y-0.5",
  outline:
    "border border-border bg-white text-text-heading hover:border-text-heading",
  ghost: "text-text-heading hover:bg-surface",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-7 py-3.5",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ease-out disabled:opacity-50 disabled:pointer-events-none";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkProps = CommonProps &
  Omit<React.ComponentProps<typeof Link>, "href"> & { href: string };

export function Button(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const classes = cn(base, variantClasses[variant], sizeClasses[size], className);

  if ("href" in props && props.href) {
    const { href, ...linkRest } = rest as Omit<LinkProps, keyof CommonProps>;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
