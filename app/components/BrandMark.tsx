type BrandMarkProps = { dark?: boolean; className?: string };

/** The supplied Daylo wordmark, extracted from the user's light/dark logo artwork. */
export function BrandMark({ dark = false, className = '' }: BrandMarkProps) {
  return (
    <img
      className={`brandmark-img ${className}`.trim()}
      src={dark ? '/daylo-logo-dark-transparent.png' : '/daylo-logo-light.webp'}
      alt="Daylo — Make every day count"
      decoding="async"
    />
  );
}
