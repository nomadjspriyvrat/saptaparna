import type { ReactNode } from "react";

export interface IconProps {
  size?: number;
  className?: string;
  sw?: number;
}

function S({ children, size = 18, className = "", sw = 1.7 }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const LogoSigma = (p: IconProps) => (
  <S {...p}>
    <path d="M18 5.5V4H6.5L12 12l-5.5 8H18v-1.5" />
  </S>
);

export const IconGrid = (p: IconProps) => (
  <S {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </S>
);

export const IconBook = (p: IconProps) => (
  <S {...p}>
    <path d="M12 6.5C10.4 5 8.2 4.5 4 4.5v13.6c4.2 0 6.4.6 8 2 1.6-1.4 3.8-2 8-2V4.5c-4.2 0-6.4.5-8 2Z" />
    <path d="M12 6.5v13.6" />
  </S>
);

export const IconUsers = (p: IconProps) => (
  <S {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20c.6-3.4 2.8-5.2 5.5-5.2s4.9 1.8 5.5 5.2" />
    <path d="M15.5 5.4a3.2 3.2 0 1 1 0 5.9" />
    <path d="M17 14.9c2 .5 3.2 2.2 3.6 4.6" />
  </S>
);

export const IconCalendar = (p: IconProps) => (
  <S {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
  </S>
);

export const IconChart = (p: IconProps) => (
  <S {...p}>
    <path d="M4 4v16h16" />
    <path d="M8.5 16v-5M13 16V7.5M17.5 16v-3" />
  </S>
);

export const IconReceipt = (p: IconProps) => (
  <S {...p}>
    <path d="M6 3.5h12V21l-2.4-1.6L13.2 21l-2.4-1.6L8.4 21 6 19.4V3.5Z" />
    <path d="M9 8h6M9 11.5h6M9 15h3.5" />
  </S>
);

export const IconVideo = (p: IconProps) => (
  <S {...p}>
    <rect x="3" y="6" width="13" height="12" rx="2" />
    <path d="m16 10.5 5-3v9l-5-3" />
  </S>
);

export const IconCard = (p: IconProps) => (
  <S {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="M3 10h18M7 14.5h4" />
  </S>
);

export const IconShield = (p: IconProps) => (
  <S {...p}>
    <path d="M12 3 5 5.8v5.4c0 4.4 2.9 7.6 7 9.3 4.1-1.7 7-4.9 7-9.3V5.8L12 3Z" />
    <path d="m9 11.8 2.2 2.2L15.5 9.5" />
  </S>
);

export const IconWand = (p: IconProps) => (
  <S {...p}>
    <path d="m5 19 9.5-9.5M17 4.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
    <path d="M8 4.8l.5 1.2 1.2.5-1.2.5L8 8.2 7.5 7 6.3 6.5l1.2-.5.5-1.2ZM19 13.8l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5.5-1.2Z" />
  </S>
);

export const IconFileTex = (p: IconProps) => (
  <S {...p}>
    <path d="M6 3.5h8L19 8.5V20.5H6V3.5Z" />
    <path d="M14 3.5v5h5" />
    <path d="M9 12.5h4M11 12.5v5M14.5 17.5c1-1.5 1-3.5 0-5" />
  </S>
);

export const IconDownload = (p: IconProps) => (
  <S {...p}>
    <path d="M12 4v10M8 10.5l4 4 4-4" />
    <path d="M4.5 17v2.5A1.5 1.5 0 0 0 6 21h12a1.5 1.5 0 0 0 1.5-1.5V17" />
  </S>
);

export const IconEdit = (p: IconProps) => (
  <S {...p}>
    <path d="M14.5 5 19 9.5 8.5 20H4v-4.5L14.5 5Z" />
    <path d="m12.5 7 4.5 4.5" />
  </S>
);

export const IconCheck = (p: IconProps) => (
  <S {...p} sw={2.2}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </S>
);

export const IconCheckCircle = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="m8.2 12.4 2.6 2.6 5-5.6" />
  </S>
);

export const IconLock = (p: IconProps) => (
  <S {...p}>
    <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    <circle cx="12" cy="15.2" r="1.1" fill="currentColor" stroke="none" />
  </S>
);

export const IconPlay = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M10 8.8v6.4l5.2-3.2L10 8.8Z" />
  </S>
);

export const IconClock = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 7.5V12l3 2.2" />
  </S>
);

export const IconArrowLeft = (p: IconProps) => (
  <S {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </S>
);

export const IconArrowRight = (p: IconProps) => (
  <S {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </S>
);

export const IconLogout = (p: IconProps) => (
  <S {...p}>
    <path d="M14 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" />
    <path d="M17 8.5 20.5 12 17 15.5M20 12h-9" />
  </S>
);

export const IconPlus = (p: IconProps) => (
  <S {...p} sw={2}>
    <path d="M12 5v14M5 12h14" />
  </S>
);

export const IconTrash = (p: IconProps) => (
  <S {...p}>
    <path d="M4.5 6.5h15M9.5 6V4.5A1.5 1.5 0 0 1 11 3h2a1.5 1.5 0 0 1 1.5 1.5V6M6.5 6.5l.8 12A2 2 0 0 0 9.3 20.5h5.4a2 2 0 0 0 2-1.9l.8-12.1" />
    <path d="M10 10.5v6M14 10.5v6" />
  </S>
);

export const IconChevron = (p: IconProps) => (
  <S {...p}>
    <path d="m6 9 6 6 6-6" />
  </S>
);

export const IconSearch = (p: IconProps) => (
  <S {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </S>
);

export const IconEye = (p: IconProps) => (
  <S {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </S>
);

export const IconEyeOff = (p: IconProps) => (
  <S {...p}>
    <path d="M4 4l16 16" />
    <path d="M9.9 5.9A9.4 9.4 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-3.2 3.9M6 8.3A16.6 16.6 0 0 0 2.5 12S6 18.5 12 18.5c1 0 1.9-.2 2.8-.5" />
    <path d="M9.5 9.8a3 3 0 0 0 4.2 4.2" />
  </S>
);

export const IconBolt = (p: IconProps) => (
  <S {...p}>
    <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8Z" />
  </S>
);

export const IconStar = (p: IconProps) => (
  <S {...p}>
    <path d="m12 3.5 2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9l-5.3 2.7 1-5.8-4.2-4.1 5.9-.9L12 3.5Z" />
  </S>
);

export const IconQuote = (p: IconProps) => (
  <S {...p}>
    <path d="M5 13.5C5 9 7.5 6.5 10.5 5.5v2.6C9 8.7 8.2 9.9 8.1 11.2c.3-.1.6-.2 1-.2 1.7 0 2.9 1.2 2.9 3s-1.4 3.2-3.2 3.2C6.4 17.2 5 15.7 5 13.5Z" />
    <path d="M13.5 13.5c0-4.5 2.5-7 5.5-8v2.6c-1.5.6-2.3 1.8-2.4 3.1.3-.1.6-.2 1-.2 1.7 0 2.9 1.2 2.9 3s-1.4 3.2-3.2 3.2c-2.4 0-3.8-1.5-3.8-3.7Z" />
  </S>
);

export const IconInfinity = (p: IconProps) => (
  <S {...p}>
    <path d="M8.2 15.8c-2.1 0-3.7-1.7-3.7-3.8s1.6-3.8 3.7-3.8c3.4 0 4.2 7.6 7.6 7.6 2.1 0 3.7-1.7 3.7-3.8s-1.6-3.8-3.7-3.8c-3.4 0-4.2 7.6-7.6 7.6Z" />
  </S>
);

export const IconX = (p: IconProps) => (
  <S {...p} sw={2}>
    <path d="M6 6l12 12M18 6 6 18" />
  </S>
);

export const IconSpark = (p: IconProps) => (
  <S {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.8 5.8l2.5 2.5M15.7 15.7l2.5 2.5M18.2 5.8l-2.5 2.5M8.3 15.7l-2.5 2.5" />
  </S>
);
