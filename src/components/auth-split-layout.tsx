import Link from "next/link";
import { Logo } from "@/components/logo";

export function AuthSplitLayout({
  children,
  bgImage,
}: {
  children: React.ReactNode;
  bgImage: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[var(--brand-black)] p-12 text-white lg:flex">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgImage}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, oklch(0.08 0.01 25 / 60%) 0%, oklch(0.08 0.01 25 / 40%) 50%, oklch(0.08 0.01 25 / 75%) 100%)",
          }}
        />
        <Link href="/" className="relative z-10">
          <Logo height={96} />
        </Link>
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Private. Discreet. Connected.
          </h2>
          <p className="mt-4 text-white/60">
            Join a curated network of entertainers and patrons — message, tip,
            and connect without ever sharing a phone number.
          </p>
        </div>
        <p className="relative z-10 text-sm text-white/40">
          © {new Date().getFullYear()} PRVY. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
