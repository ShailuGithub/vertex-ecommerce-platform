// Small hand-written outline icons (24x24, stroke-based) to avoid pulling in an icon library.
type IconProps = { className?: string };

const base = "stroke-current stroke-[1.75] fill-none";

export function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5 12 4l9 7.5M5.5 10v9a1 1 0 0 0 1 1H9.5v-6h5v6h3a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function BoxIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 7.5 12 3l8.5 4.5M3.5 7.5v9L12 21m-8.5-4.5L12 12m0 9 8.5-4.5v-9M12 12l8.5-4.5M12 12v9" />
    </svg>
  );
}

export function TagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m20 12.5-7.5 7.5a1.5 1.5 0 0 1-2 0L4 13.5V4h9.5L20 10.5a1.5 1.5 0 0 1 0 2Z" />
      <circle cx="8.5" cy="8.5" r="1.25" />
    </svg>
  );
}

export function ReceiptIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12v18l-3-2-2 2-2-2-2 2-3-2Zm3 5h6M9 11h6m-6 4h4" />
    </svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <circle cx="9" cy="8" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 20a5.5 5.5 0 0 1 11 0M16 8.5a2.5 2.5 0 1 1 0-5M15.5 14.5a5 5 0 0 1 5 5" />
    </svg>
  );
}

export function GearIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 13.5a7.97 7.97 0 0 0 0-3l1.9-1.5-2-3.5-2.3.6a8 8 0 0 0-2.6-1.5L14 2h-4l-.4 2.6a8 8 0 0 0-2.6 1.5l-2.3-.6-2 3.5L4.6 10.5a7.97 7.97 0 0 0 0 3L2.7 15l2 3.5 2.3-.6a8 8 0 0 0 2.6 1.5L10 22h4l.4-2.6a8 8 0 0 0 2.6-1.5l2.3.6 2-3.5Z" />
    </svg>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3m4-14 5 6-5 6M20 12H9" />
    </svg>
  );
}

export function StoreIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5 4.5 4h15L21 9.5M3 9.5a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0M4.5 9.5V20h15V9.5" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CustomersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <circle cx="12" cy="8" r="3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20a7.5 7.5 0 0 1 15 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.5v3M10.3 14.2h3.4" />
    </svg>
  );
}

export function DiscountIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 15.5 15.5 8.5" />
      <circle cx="9" cy="9" r="1" />
      <circle cx="15" cy="15" r="1" />
    </svg>
  );
}

export function AnalyticsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10M10 20V4M16 20v-7M20 20H4" />
    </svg>
  );
}

export function EditIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19 3 20l1-4L16.5 3.5Z" />
    </svg>
  );
}

export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 4h6v6M20 4 10.5 13.5M9 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}
