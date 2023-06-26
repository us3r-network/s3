export default function InfoIcon({ isActive }: { isActive?: boolean }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.49967 5.83398V8.50065M8.49967 11.1673H8.50634M15.1663 8.50065C15.1663 12.1826 12.1816 15.1673 8.49967 15.1673C4.81778 15.1673 1.83301 12.1826 1.83301 8.50065C1.83301 4.81875 4.81778 1.83398 8.49967 1.83398C12.1816 1.83398 15.1663 4.81875 15.1663 8.50065Z"
        stroke={isActive ? '#fff' : '#718096'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
