import { useId } from "react";

export function SvgShape(props: React.ComponentProps<"svg">) {
  const id = useId();

  return (
    <svg
      role="presentation"
      width="48"
      height="79"
      viewBox="0 0 48 79"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath={`url(#${id})`}>
        <path
          d="M43.5643 44.2572C37.9764 42.3316 33.2872 38.4192 30.3844 33.2611H48C36.8506 28.063 28.6184 18.1224 25.5748 6.18138L23.9996 0.000976562V14.1633C23.9996 18.2227 20.7169 21.513 16.6669 21.513H0L4.84349 22.7791C10.8273 24.3436 16.0294 28.0579 19.4596 33.2152H0L4.4357 34.7431C10.0236 36.6687 14.7128 40.581 17.6156 45.7392H0C11.1494 50.9372 19.3816 60.8779 22.4252 72.8189L24.0004 78.9993V64.837C24.0004 60.7776 27.2831 57.4873 31.3331 57.4873H48L43.1565 56.2211C37.1727 54.6567 31.9706 50.9423 28.5404 45.785H48L43.5643 44.2572Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id={id}>
          <rect width="48" height="79" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
