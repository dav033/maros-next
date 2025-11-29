import { Icon as Iconify } from "@iconify/react";
import type { ComponentProps } from "react";

export type IconProps = {
  name: string;
  className?: string;
  inline?: boolean;
  size?: number;
} & Omit<ComponentProps<"span">, "children">;

export default function Icon({
  name,
  className = "",
  inline = false,
  size = 16,
  ...rest
}: IconProps) {
  return (
    <span className={`inline-flex items-center ${className}`} {...rest}>
      <Iconify icon={name} inline={inline} style={{ width: size, height: size }} />
    </span>
  );
}
