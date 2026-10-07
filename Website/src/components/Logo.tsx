/** 240×169 WebP: sharp at every size the logo is shown (the full logo.png is kept for the PDF report). */
const LOGO_URL = `${import.meta.env.BASE_URL}images/logo-small.webp`;
// The logo is never shown wider than ~80 px: ordinary screens get the 120 px file, sharp ones the 240 px one.
const LOGO_SRCSET = `${import.meta.env.BASE_URL}images/logo-120.webp 120w, ${LOGO_URL} 240w`;

export function Logo({ className = '' }: { className?: string }) {
  return <img src={LOGO_URL} srcSet={LOGO_SRCSET} sizes="80px" alt="BECE Vault logo" width={240} height={169} decoding="async" className={`logo ${className}`} draggable={false} />;
}
