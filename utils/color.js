export function getContrastColor(hexColor) {
  if (!hexColor) return "#000" // fallback

  // Elimina el #
  const color = hexColor.replace("#", "")
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)

  // Luminancia relativa
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b)

  return luminance > 186 ? "#000" : "#fff"
}