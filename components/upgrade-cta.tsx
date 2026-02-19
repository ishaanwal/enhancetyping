import Link from "next/link";

export function UpgradeCTA({ disabled = false }: { disabled?: boolean }) {
  if (disabled) {
    return (
      <button className="btn-secondary cursor-not-allowed opacity-60" disabled>
        Coming Soon (Billing not configured)
      </button>
    );
  }

  return (
    <Link href="/pricing" className="btn-primary">
      Upgrade to Premium
    </Link>
  );
}
