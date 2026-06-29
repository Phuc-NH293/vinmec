import Link from "next/link";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand-logo" aria-label="Vinmec">
      <span className="brand-mark">
        <span />
      </span>
      {!compact && (
        <span className="brand-copy">
          <strong>VINMEC</strong>
          <small>INTERNATIONAL HOSPITAL</small>
        </span>
      )}
    </Link>
  );
}
