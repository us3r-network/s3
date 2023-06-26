export const createImageFromInitials = (
  size: number,
  name: string,
  color: string
) => {
  if (name == null) return

  const canvas = document.createElement('canvas')
  const context: CanvasRenderingContext2D = canvas.getContext('2d')!
  canvas.width = canvas.height = size

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, size, size)

  context.fillStyle = `${color}50`
  context.fillRect(0, 0, size, size)

  context.fillStyle = color
  context.textBaseline = 'middle'
  context.textAlign = 'center'
  context.font = `${size / 1.5}px Arial`
  context.fillText(name, size / 2, size / 1.8)

  return canvas.toDataURL()
}
