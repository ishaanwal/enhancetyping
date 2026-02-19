import { LoginForm } from "@/components/login-form";
import { authUiHints } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div>
      <LoginForm
        showGoogle={authUiHints.showGoogle}
        showEmailMagicLink={authUiHints.showEmailMagicLink}
        showDemoLogin={authUiHints.showDemoLogin}
        demoEmail={authUiHints.demoAccount.email}
        demoPassword={authUiHints.demoAccount.password}
      />
    </div>
  );
}
