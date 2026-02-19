import { LoginForm } from "@/components/login-form";
import { authUiHints } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div>
      <LoginForm
        initialMode="signin"
        showGoogle={authUiHints.showGoogle}
        showEmailMagicLink={authUiHints.showEmailMagicLink}
        showDemoLogin={authUiHints.showDemoLogin}
      />
    </div>
  );
}
