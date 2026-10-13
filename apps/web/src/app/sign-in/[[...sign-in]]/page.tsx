import { Logo } from "@/components/logo";
import { SignIn } from "@clerk/nextjs";
export default function Page() {
  return (
    <main className="auth-page">
      <div className="auth-brand">
        <Logo />
      </div>
      <SignIn fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" />
      <p>Everything important, in one place.</p>
    </main>
  );
}
