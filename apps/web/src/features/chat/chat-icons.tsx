import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon(props: IconProps) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    />
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </BaseIcon>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 12 20 4l-4 16-4.5-6.5L4 12Z" />
      <path d="M11.5 13.5 20 4" />
    </BaseIcon>
  );
}

export function PaperclipIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m10.5 13.5 5.7-5.7a3 3 0 1 0-4.2-4.2l-7.1 7.1a5 5 0 0 0 7.1 7.1l7.4-7.4" />
    </BaseIcon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </BaseIcon>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m12 3 1.8 4.9L19 9.7l-4.3 3.1L16.5 18 12 14.9 7.5 18l1.8-5.2L5 9.7l5.2-1.8L12 3Z" />
    </BaseIcon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m6 9 6 6 6-6" />
    </BaseIcon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </BaseIcon>
  );
}
