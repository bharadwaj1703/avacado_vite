export type MouthVariant = 'smile' | 'open' | 'grin'

interface MascotMouthProps {
  variant?: MouthVariant
  className?: string
  style?: React.CSSProperties
}

export function MascotMouth({ variant = 'smile', className, style }: MascotMouthProps) {
  return (
    <svg
      viewBox={variants[variant].viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {variants[variant].paths}
    </svg>
  )
}

const variants: Record<MouthVariant, { viewBox: string; paths: React.ReactNode }> = {
  smile: {
    viewBox: '0 0 33 11',
    paths: (
      <path d="M0.346191 0.360809C4.00176 3.86796 12.6614 10.7785 18.0552 10.3635C23.449 9.94848 28.5755 6.13618 31.8603 3.37003" stroke="black" />
    ),
  },
  open: {
    viewBox: '0 0 32 40',
    paths: (
      <>
        <path d="M6.64992 39.1924C-0.930443 38.8479 -0.384866 12.9206 0.835468 0C12.0343 4.95263 12.788 4.95287 30.7691 4.95287C33.8145 4.95287 16.1254 39.623 6.64992 39.1924Z" fill="black" />
        <path d="M6.95953 39.2694C1.48615 39.0207 -0.691468 27.6718 0.18967 18.3425C8.86809 17.8998 10.4487 18.3425 22.8331 22.0606C24.9391 22.6929 13.8012 39.5804 6.95953 39.2694Z" fill="white" />
      </>
    ),
  },
  grin: {
    viewBox: '0 0 48 38',
    paths: (
      <>
        <path d="M0.124512 12.6525L46.6714 0.676941C44.5627 12.8786 37.1849 33.1978 26.336 36.1522C14.4555 39.3875 7.88254 30.4551 1.9326 20.5611" stroke="black" />
        <path d="M42.137 16.933L29.4678 21.3004" stroke="black" />
      </>
    ),
  },
}
