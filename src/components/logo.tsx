import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  height?: number;
  invert?: boolean;
  src?: string;
  aspectRatio?: number;
}

export function Logo({ className, height = 40, invert = true, src = "/pirvy-logo-final.png", aspectRatio = 3.4 }: LogoProps) {
  return (
    <Image
      src={src}
      alt="PRVY"
      height={height}
      width={Math.round(height * aspectRatio)}
      className={cn("w-auto object-contain", invert && "brightness-0 invert", className)}
      priority
    />
  );
}
