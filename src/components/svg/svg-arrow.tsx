export function SvgArrow(props: React.ComponentProps<"svg">) {
  return (
    <svg
      role="presentation"
      width="21"
      height="14"
      viewBox="0 0 15 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M0 5.67473L12.6874 5.67473L9.66948 9.04593L10.5236 10L13.8057 6.33403C14.4856 5.57462 14.4856 4.42538 13.8057 3.66596L10.5236 0L9.66948 0.954064L12.6874 4.32527L0 4.32527L0 5.67473Z"
        fill="currentColor"
      />
    </svg>
  );
}
