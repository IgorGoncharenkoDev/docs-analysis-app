import { SimpleIcon as SimpleIconType } from 'simple-icons'

type SimpleIconProps = {
  icon: SimpleIconType
  width?: number
  height?: number
}

export function SimpleIcon(
  { icon, width = 16, height = 16 }: SimpleIconProps,
) {
  return (
    <svg fill="currentColor" height={height} viewBox="0 0 24 24" width={width}>
      <path d={icon.path} />
    </svg>
  )
}
