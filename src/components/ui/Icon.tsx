/**
 * Conjunto mínimo de iconos de trazo (SVG en línea, sin dependencias).
 */
const paths = {
  bank: "M3 10h18M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18M12 3 3 8h18z",
  table: "M4 4h16v16H4zM4 9.5h16M4 15h16M10 9.5V20",
  trending: "M3 17l6-6 4 4 8-8M15 7h6v6",
  piggy:
    "M19 11c0-3.3-3.1-6-7-6S5 7.7 5 11c0 1.8.9 3.4 2.3 4.5V19h3v-2h3.4v2h3v-3.5c.8-.6 1.4-1.4 1.8-2.3H21v-3h-1.6c-.1-.4-.2-.8-.4-1.2M3 9.5c0 1 .7 1.5 2 1.5M15 9h.01",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  tag: "M3 12V4h8l10 10-8 8L3 12zM7.5 7.5h.01",
  scale: "M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0L5 7zM19 7l-3 7a3 3 0 0 0 6 0l-3-7z",
  percent: "M19 5 5 19M7 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  discount: "M3 12V4h8l10 10-8 8L3 12zM15 9l-6 6M9.5 9.5h.01M14.5 14.5h.01",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  receipt: "M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3zM9 8h6M9 12h6M9 16h3",
  wallet: "M3 7a2 2 0 0 1 2-2h13v4M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2zM16.5 14.5h.01",
  briefcase: "M3 8h18v12H3zM8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3M3 13h18",
  calculator: "M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8 7h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  chevronDown: "m6 9 6 6 6-6",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  share: "M12 3v12M7 8l5-5 5 5M5 14v6h14v-6",
  refresh: "M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5h.01",
  alert: "M12 3 2 20h20L12 3zM12 10v4M12 17h.01",
  check: "M5 12.5 10 17 19 7",
  close: "M6 6l12 12M18 6 6 18",
  menu: "M4 7h16M4 12h16M4 17h16",
  plus: "M12 5v14M5 12h14",
  shield: "M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6l-8-3zM9 12l2 2 4-4",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7l1-8z",
  formula: "M5 4h9M9.5 4 7 20M4 20h6M14 12l6 6M20 12l-6 6",
} as const;

export type IconName = keyof typeof paths;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  /** Si el icono transmite información, pasa un título accesible. */
  title?: string;
}

export function Icon({ name, size = 20, className, strokeWidth = 1.8, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path d={paths[name]} />
    </svg>
  );
}
