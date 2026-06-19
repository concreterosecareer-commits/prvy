import { AuthSplitLayout } from "@/components/auth-split-layout";

export default function VerifyOtpLayout({ children }: { children: React.ReactNode }) {
  return <AuthSplitLayout bgImage="/log-in-bg.png">{children}</AuthSplitLayout>;
}
