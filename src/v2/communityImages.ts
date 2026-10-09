const MAX_EDGE = 800
const QUALITY = 0.66
const MAX_DATA_URL_LENGTH = 240_000

export async function prepareCommunityImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('只能添加图片文件')
  const source = await createImageBitmap(file)
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) throw new Error('无法处理图片')
    let edge = MAX_EDGE
    let quality = QUALITY
    let result = ''
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const scale = Math.min(1, edge / Math.max(source.width, source.height))
      canvas.width = Math.max(1, Math.round(source.width * scale))
      canvas.height = Math.max(1, Math.round(source.height * scale))
      context.fillStyle = '#fff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(source, 0, 0, canvas.width, canvas.height)
      result = canvas.toDataURL('image/jpeg', quality)
      if (result.length <= MAX_DATA_URL_LENGTH) break
      edge = Math.round(edge * 0.8)
      quality = Math.max(0.48, quality - 0.06)
    }
    return result
  } finally {
    source.close()
  }
}
