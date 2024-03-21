export default function CheckCircleIcon({ bgc = '#00b171' }: { bgc?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx='10' cy='10' r='8' stroke={bgc} strokeWidth='4' fill={bgc}/>
      <path
        d="M6.25 10L8.75 12.5L13.75 7.5"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
