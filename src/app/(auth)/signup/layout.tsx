import { AuthSplitLayout } from "@/components/auth-split-layout";

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <AuthSplitLayout bgImage="/signup.png">{children}</AuthSplitLayout>;
}
