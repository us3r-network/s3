export default function ChartIcon({ isActive }: { isActive?: boolean }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.5 14.5H4.63333C3.8866 14.5 3.51323 14.5 3.22801 14.3547C2.97713 14.2268 2.77316 14.0229 2.64532 13.772C2.5 13.4868 2.5 13.1134 2.5 12.3667V2.5M5.16667 10.1667V12.1667M8.16667 8.16667V12.1667M11.1667 6.16667V12.1667M14.1667 4.16667V12.1667"
        stroke={isActive ? '#ffffff' : '#718096'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
