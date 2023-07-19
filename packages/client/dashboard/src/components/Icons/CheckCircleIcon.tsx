export default function CheckCircleIcon({ bgc = '#5BA85A' }: { bgc?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.0003 18.3327C14.6027 18.3327 18.3337 14.6017 18.3337 9.99935C18.3337 5.39698 14.6027 1.66602 10.0003 1.66602C5.39795 1.66602 1.66699 5.39698 1.66699 9.99935C1.66699 14.6017 5.39795 18.3327 10.0003 18.3327Z"
        fill={bgc}
      />
      <path
        d="M6.25 10L8.75 12.5L13.75 7.5"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
