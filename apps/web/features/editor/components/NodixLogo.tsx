import type { ReactElement } from "react";

export interface NodixLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: number;
}

export const NodixIcon = ({ className = "size-6", size }: { className?: string; size?: number }): ReactElement => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Nodix Icon"
  >
    {/* Diagonal line */}
    <line x1="25" y1="26" x2="75" y2="74" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
    {/* Left vertical line */}
    <line x1="25" y1="74" x2="25" y2="40" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
    {/* Right vertical line */}
    <line x1="75" y1="26" x2="75" y2="60" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
    {/* 4 Nodes */}
    <circle cx="25" cy="26" r="8.5" fill="currentColor" />
    <circle cx="25" cy="74" r="8.5" fill="currentColor" />
    <circle cx="75" cy="26" r="8.5" fill="currentColor" />
    <circle cx="75" cy="74" r="8.5" fill="currentColor" />
  </svg>
);

export const NodixLogo = ({ className = "h-7", iconOnly = false, size }: NodixLogoProps): ReactElement => {
  if (iconOnly) {
    return <NodixIcon className={className} {...(size !== undefined ? { size } : {})} />;
  }

  return (
    <div className={`inline-flex items-center gap-1 text-gray-900 select-none ${className}`}>
      <NodixIcon className="size-[22px] text-gray-900 shrink-0" />
      <span className="font-bold text-[17px] tracking-tight text-gray-950 font-sans leading-none">
        Nodix
      </span>
    </div>
  );
};
