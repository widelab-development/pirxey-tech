import { useId } from "react";

export function SvgBlockchain(props: React.ComponentProps<"svg">) {
  const id = useId();

  return (
    <svg
      role="presentation"
      width="35"
      height="32"
      viewBox="0 0 35 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath={`url(#${id})`}>
        <path
          d="M1.90039 30.459H8.09961V24.1875H1.90039V30.459ZM23.9004 30.459H30.0996V24.1875H23.9004V30.459ZM12.9004 19.3271H19.0996V13.0557H12.9004V19.3271ZM1.90039 8.19531H8.09961V1.92383H1.90039V8.19531ZM23.9004 8.19531H30.0996V1.92383H23.9004V8.19531ZM11.0996 12.5068L11.0713 12.4785L8.6709 10.0498L8.6416 10.0195H0.0996094V0.0996094H9.90039V8.74414L9.92871 8.77344L12.3291 11.2021L12.3584 11.2314H19.6416L19.6709 11.2021L22.0713 8.77344L22.0996 8.74414V0.0996094H31.9004V10.0195H23.3584L23.3291 10.0498L20.9287 12.4785L20.9004 12.5068V19.876L20.9287 19.9043L23.3291 22.333L23.3584 22.3633H31.9004V32.2832H22.0996V23.6387L22.0713 23.6094L19.6709 21.1807L19.6416 21.1514H12.3584L12.3291 21.1807L9.92871 23.6094L9.90039 23.6387V32.2832H0.0996094V22.3633H8.6416L8.6709 22.333L11.0713 19.9043L11.0996 19.876V12.5068Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.2"
        />
      </g>
      <defs>
        <clipPath id={id}>
          <rect width="35" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
