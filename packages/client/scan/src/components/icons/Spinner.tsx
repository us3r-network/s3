export default function Spinner({ stroke = '#718096' }: { stroke?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      color="#fff"
      width="32"
    >
      <path opacity=".1" d="M14 0 H18 V8 H14 z" transform="rotate(0 16 16)">
        <animate
          attributeName="opacity"
          from="1"
          to=".1"
          dur="1s"
          repeatCount="indefinite"
          begin="0"
        ></animate>
      </path>
      <path opacity=".1" d="M14 0 H18 V8 H14 z" transform="rotate(45 16 16)">
        <animate
          attributeName="opacity"
          from="1"
          to=".1"
          dur="1s"
          repeatCount="indefinite"
          begin="0.125s"
        ></animate>
      </path>
      <path opacity=".1" d="M14 0 H18 V8 H14 z" transform="rotate(90 16 16)">
        <animate
          attributeName="opacity"
          from="1"
          to=".1"
          dur="1s"
          repeatCount="indefinite"
          begin="0.25s"
        ></animate>
      </path>
      <path opacity=".1" d="M14 0 H18 V8 H14 z" transform="rotate(135 16 16)">
        <animate
          attributeName="opacity"
          from="1"
          to=".1"
          dur="1s"
          repeatCount="indefinite"
          begin="0.375s"
        ></animate>
      </path>
      <path opacity=".1" d="M14 0 H18 V8 H14 z" transform="rotate(180 16 16)">
        <animate
          attributeName="opacity"
          from="1"
          to=".1"
          dur="1s"
          repeatCount="indefinite"
          begin="0.5s"
        ></animate>
      </path>
      <path opacity=".1" d="M14 0 H18 V8 H14 z" transform="rotate(225 16 16)">
        <animate
          attributeName="opacity"
          from="1"
          to=".1"
          dur="1s"
          repeatCount="indefinite"
          begin="0.675s"
        ></animate>
      </path>
      <path opacity=".1" d="M14 0 H18 V8 H14 z" transform="rotate(270 16 16)">
        <animate
          attributeName="opacity"
          from="1"
          to=".1"
          dur="1s"
          repeatCount="indefinite"
          begin="0.75s"
        ></animate>
      </path>
      <path opacity=".1" d="M14 0 H18 V8 H14 z" transform="rotate(315 16 16)">
        <animate
          attributeName="opacity"
          from="1"
          to=".1"
          dur="1s"
          repeatCount="indefinite"
          begin="0.875s"
        ></animate>
      </path>
    </svg>
  )
}
