import { Logo } from "@/components/logo";
import { SignUp } from "@clerk/nextjs";
export default function Page() {
  return (
    <main className="auth-page">
      <div className="auth-brand">
        <Logo />
      </div>
      <SignUp fallbackRedirectUrl="/dashboard" signInUrl="/sign-in" />
    </main>
  );
}
