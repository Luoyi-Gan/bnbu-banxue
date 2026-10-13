import type { CSSProperties, ReactNode } from 'react';

// Product tokens from src/v2/studentTheme.css.
export const P = {
  canvas: '#F2F2F7',
  surface: '#FFFFFF',
  ink: '#1C1C1E',
  muted: '#636366',
  blue: '#007AFF',
  action: '#0865D1',
  accentSoft: '#E8F2FF',
  accentInk: '#003E7D',
  success: '#248A3D',
  soft: '#F8F8FA',
  outline: '#8E8E93',
  line: 'rgba(198,198,200,0.48)',
  brand: '#0166A4',
  font: '"PingFang SC", Inter, -apple-system, "Helvetica Neue", sans-serif',
};

const ICONS: Record<string, ReactNode> = {
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  megaphone: <><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></>,
  heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  bookmark: <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />,
  arrow: <path d="M5 12h14M12 5l7 7-7 7" />,
  arrowLeft: <path d="M19 12H5M12 19l-7-7 7-7" />,
  arrowUp: <path d="M12 19V5M5 12l7-7 7 7" />,
  check: <path d="M20 6 9 17l-5-5" />,
  book: <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
  message: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
  plus: <path d="M5 12h14M12 5v14" />,
  imagePlus: <><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" /><path d="M16 5h6M19 2v6" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
};

export const Icon = ({ name, size = 16, color = 'currentColor', stroke = 2, fill = 'none', style }: { name: keyof typeof ICONS | string; size?: number; color?: string; stroke?: number; fill?: string; style?: CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', display: 'block', ...style }}>
    {ICONS[name]}
  </svg>
);

export const Box = ({ x, y, w, h, style, children }: { x: number; y: number; w?: number; h?: number; style?: CSSProperties; children?: ReactNode }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, ...style }}>{children}</div>
);

export const Txt = ({ size = 13, weight = 400, color = P.ink, style, children }: { size?: number; weight?: number; color?: string; style?: CSSProperties; children: ReactNode }) => (
  <div style={{ fontFamily: P.font, fontSize: size, fontWeight: weight, color, lineHeight: 1.35, whiteSpace: 'nowrap', ...style }}>{children}</div>
);

export const Kicker = ({ children, color = P.muted, style }: { children: ReactNode; color?: string; style?: CSSProperties }) => (
  <Txt size={10.5} weight={700} color={color} style={{ letterSpacing: '0.14em', ...style }}>{children}</Txt>
);

export const Card = ({ w, h, radius = 16, pad, style, children }: { w: number; h?: number; radius?: number; pad?: number; style?: CSSProperties; children?: ReactNode }) => (
  <div style={{ position: 'relative', width: w, height: h, borderRadius: radius, background: P.surface, border: `1px solid ${P.line}`, boxShadow: '0 12px 32px rgba(36,36,36,0.07)', padding: pad, boxSizing: 'border-box', overflow: 'hidden', ...style }}>{children}</div>
);

export const Chip = ({ label, active = 0, style }: { label: string; active?: number; style?: CSSProperties }) => (
  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', height: 30, padding: '0 13px', borderRadius: 15, fontFamily: P.font, fontSize: 12, fontWeight: 600, color: active > 0.5 ? P.accentInk : '#3A3A3C', background: P.surface, border: `1px solid ${P.line}`, overflow: 'hidden', boxSizing: 'border-box', ...style }}>
    <div style={{ position: 'absolute', inset: 0, background: P.accentSoft, transform: `scale(${active})`, borderRadius: 15 }} />
    <span style={{ position: 'relative' }}>{label}</span>
  </div>
);

export const Tag = ({ label, tone = 'blue', style }: { label: string; tone?: 'blue' | 'grey' | 'green' | 'white'; style?: CSSProperties }) => {
  const c = { blue: [P.accentSoft, P.accentInk], grey: ['#F2F2F4', '#48484A'], green: ['#E9F6EC', P.success], white: ['#FFFFFF', P.ink] }[tone];
  return <div style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 6, background: c[0], color: c[1], fontFamily: P.font, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', ...style }}>{label}</div>;
};

export const Btn = ({ label, kind = 'primary', icon, w, style }: { label: string; kind?: 'primary' | 'secondary' | 'disabled'; icon?: string; w?: number; style?: CSSProperties }) => {
  const s = {
    primary: { background: P.action, color: '#fff', border: 'none' },
    secondary: { background: P.surface, color: P.action, border: `1px solid ${P.line}` },
    disabled: { background: '#F2F2F4', color: '#8E8E93', border: 'none' },
  }[kind];
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 38, width: w, padding: w ? 0 : '0 16px', borderRadius: 9, fontFamily: P.font, fontSize: 13, fontWeight: 700, boxSizing: 'border-box', whiteSpace: 'nowrap', ...s, ...style }}>
      {label}
      {icon && <Icon name={icon} size={15} stroke={2.2} />}
    </div>
  );
};

export const Avatar = ({ ch, size = 28, style }: { ch: string; size?: number; style?: CSSProperties }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: P.accentSoft, color: '#1D4F91', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: P.font, fontSize: size * 0.42, fontWeight: 600, flex: 'none', ...style }}>{ch}</div>
);

export const Divider = ({ style }: { style?: CSSProperties }) => <div style={{ height: 1, background: P.line, ...style }} />;
