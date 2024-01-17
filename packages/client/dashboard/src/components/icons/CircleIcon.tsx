export default function CircleIcon ({ bgc = '#5BA85A' }: { bgc?: string }) {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle cx='10' cy='10' r='8' stroke={bgc} stroke-width='4' />
    </svg>
  )
}
