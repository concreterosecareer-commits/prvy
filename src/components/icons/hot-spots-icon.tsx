import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";

export const HotSpotsIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ className, size = 24, strokeWidth = 2, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Map-pin outline */}
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      {/* Flame inner shape — solid fill, no stroke */}
      <path
        d="M12 6c-1.2 1.6-2 3-2 4.2a2 2 0 0 0 4 0C14 8.8 13.2 7.4 12 6Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  )
);

HotSpotsIcon.displayName = "HotSpotsIcon";
