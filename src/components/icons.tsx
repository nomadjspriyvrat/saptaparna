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

export const LogoMark = (p: IconProps) => (
  <S {...p}>
    <path d="M3.5 18.5 9 8l4 6.5L20 5" />
    <circle cx="20" cy="5" r="2.3" fill="currentColor" stroke="none" />
    <circle cx="3.5" cy="18.5" r="1.6" fill="currentColor" stroke="none" />
  </S>
);

export const IconRoute = (p: IconProps) => (
  <S {...p}>
    <circle cx="6" cy="18.5" r="2.2" />
    <circle cx="18" cy="5.5" r="2.2" />
    <path d="M8.2 17.5c5.6-1.2 2.4-8.6 7.6-11" />
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

export const IconBook = (p: IconProps) => (
  <S {...p}>
    <path d="M12 6.5C10.4 5 8.2 4.5 4 4.5v13.6c4.2 0 6.4.6 8 2 1.6-1.4 3.8-2 8-2V4.5c-4.2 0-6.4.5-8 2Z" />
    <path d="M12 6.5v13.6" />
  </S>
);

export const IconQuiz = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M9.6 9.2a2.5 2.5 0 1 1 3.5 2.6c-.8.4-.9 1-.9 1.7" />
    <circle cx="12" cy="16.6" r="0.4" fill="currentColor" />
  </S>
);

export const IconTask = (p: IconProps) => (
  <S {...p}>
    <rect x="3" y="4.5" width="18" height="15" rx="2" />
    <path d="m7 9.5 3 2.7-3 2.8" />
    <path d="M12.5 15H17" />
  </S>
);

export const IconProject = (p: IconProps) => (
  <S {...p}>
    <path d="M12 3 4 7.2v9.6L12 21l8-4.2V7.2L12 3Z" />
    <path d="M4 7.2 12 11.5l8-4.3M12 11.5V21" />
  </S>
);

export const IconLock = (p: IconProps) => (
  <S {...p}>
    <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    <circle cx="12" cy="15.2" r="1.1" fill="currentColor" stroke="none" />
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

export const IconVideo = (p: IconProps) => (
  <S {...p}>
    <rect x="3" y="6" width="13" height="12" rx="2" />
    <path d="m16 10.5 5-3v9l-5-3" />
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

export const IconSave = (p: IconProps) => (
  <S {...p}>
    <path d="M5 3.5h11L20.5 8v11a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5Z" />
    <path d="M7.5 3.5V9h8V3.5M7.5 20.5v-7h9v7" />
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

export const IconBolt = (p: IconProps) => (
  <S {...p}>
    <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8Z" />
  </S>
);

export const IconEye = (p: IconProps) => (
  <S {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </S>
);

export const IconSpark = (p: IconProps) => (
  <S {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.8 5.8l2.5 2.5M15.7 15.7l2.5 2.5M18.2 5.8l-2.5 2.5M8.3 15.7l-2.5 2.5" />
  </S>
);
