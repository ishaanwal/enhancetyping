import { LoginForm } from "@/components/login-form";
import { authUiHints } from "@/lib/auth";

export default function SignupPage() {
  return (
    <LoginForm
      initialMode="signup"
      showGoogle={authUiHints.showGoogle}
      showEmailMagicLink={authUiHints.showEmailMagicLink}
      showDemoLogin={authUiHints.showDemoLogin}
    />
  );
}
