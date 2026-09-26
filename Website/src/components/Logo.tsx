const LOGO_URL = `${import.meta.env.BASE_URL}logo.png`;

export function Logo({ className = '' }: { className?: string }) {
  return <img src={LOGO_URL} alt="BECE Vault logo" className={`logo ${className}`} draggable={false} />;
}
