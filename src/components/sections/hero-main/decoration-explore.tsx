import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * "Explore" vertical decoration with dotted arrow.
 * Ported 1:1 from Next.js.
 */
export function DecorationExplore({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const clipPathId = useId();

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 text-text-on-light-secondary",
        className
      )}
      {...props}
    >
      <span className="typography-body-bold uppercase [writing-mode:sideways-lr]">
        Explore
      </span>
      <svg
        width="17"
        height="58"
        viewBox="0 0 17 58"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="presentation"
      >
        <g clipPath={`url(#${clipPathId})`}>
          <path d="M9.50391 0.992188C9.50391 0.577975 9.16812 0.242188 8.75391 0.242188C8.3397 0.242188 8.00391 0.577975 8.00391 0.992188C8.00391 1.4064 8.3397 1.74219 8.75391 1.74219C9.16812 1.74219 9.50391 1.4064 9.50391 0.992188Z" fill="currentColor" />
          <path d="M9.50391 5.99219C9.50391 5.57797 9.16812 5.24219 8.75391 5.24219C8.3397 5.24219 8.00391 5.57797 8.00391 5.99219C8.00391 6.4064 8.3397 6.74219 8.75391 6.74219C9.16812 6.74219 9.50391 6.4064 9.50391 5.99219Z" fill="currentColor" />
          <path d="M9.50391 10.9922C9.50391 10.578 9.16812 10.2422 8.75391 10.2422C8.3397 10.2422 8.00391 10.578 8.00391 10.9922C8.00391 11.4064 8.3397 11.7422 8.75391 11.7422C9.16812 11.7422 9.50391 11.4064 9.50391 10.9922Z" fill="currentColor" />
          <path d="M8.01171 17.7422L8.01171 55.1212L4.30338 51.7009L3.25391 52.669L7.39788 56.4914C8.16385 57.1979 9.34396 57.1979 10.1099 56.4914L14.2539 52.669L13.2044 51.7009L9.49611 55.1212L9.49611 17.7422L8.01171 17.7422Z" fill="currentColor" />
        </g>
        <defs>
          <clipPath id={clipPathId}>
            <rect
              width="58"
              height="17"
              fill="white"
              transform="translate(2.53526e-06 58) rotate(-90)"
            />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
