/** 240×169 WebP: sharp at every size the logo is shown (the full logo.png is kept for the PDF report). */
const LOGO_URL = `${import.meta.env.BASE_URL}images/logo-small.webp`;

export function Logo({ className = '' }: { className?: string }) {
  return <img src={LOGO_URL} alt="BECE Vault logo" width={240} height={169} decoding="async" className={`logo ${className}`} draggable={false} />;
}
