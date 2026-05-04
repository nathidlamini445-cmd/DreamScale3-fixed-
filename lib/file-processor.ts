// File processing utilities.
//
// SAFE TO IMPORT FROM CLIENT COMPONENTS.
// All Gemini calls are delegated to server-side API routes
// (`/api/process-file/pdf-extract`, `/api/process-file/image-ocr`) so the
// `GEMINI_API_KEY` is never bundled into the browser. Buffer / process.env
// are not used directly — base64 conversion uses browser-safe APIs.

export interface ProcessedFile {
  name: string
  type: string
  content: string
  size: number
  isImage?: boolean
  isPdf?: boolean
  imageData?: string // base64 for PDFs and images (no data: prefix)
}

// Browser-safe ArrayBuffer → base64. Works in both browser and Node 18+.
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  if (typeof btoa === 'function') {
    let binary = ''
    const chunkSize = 0x8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize)
      binary += String.fromCharCode(...chunk)
    }
    return btoa(binary)
  }
  // Node fallback (typeof Buffer guarded so module remains client-bundleable)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const NodeBuffer: any = (globalThis as any).Buffer
  if (NodeBuffer) return NodeBuffer.from(buffer).toString('base64')
  throw new Error('No base64 encoder available in this environment')
}

async function extractViaApi(
  endpoint: '/api/process-file/pdf-extract' | '/api/process-file/image-ocr',
  file: File
): Promise<string | null> {
  try {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(endpoint, { method: 'POST', body: form })
    if (!res.ok) return null
    const data = (await res.json()) as { success?: boolean; text?: string; error?: string }
    if (data?.success && typeof data.text === 'string') return data.text
    return null
  } catch {
    return null
  }
}

export async function processFile(file: File): Promise<ProcessedFile> {
  const fileType = file.type
  const fileName = file.name
  const fileSize = file.size

  try {
    let content = ''
    let isImage = false
    let imageData: string | undefined

    if (fileType === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer()
        imageData = arrayBufferToBase64(arrayBuffer)

        const extracted = await extractViaApi('/api/process-file/pdf-extract', file)
        content = extracted || `[PDF File: ${fileName} - Ready for analysis]`
      } catch (error) {
        console.error('PDF processing error:', error)
        content = `[PDF File: ${fileName} - Error processing PDF]`
      }
    } else if (fileType.startsWith('image/')) {
      isImage = true
      try {
        const arrayBuffer = await file.arrayBuffer()
        imageData = arrayBufferToBase64(arrayBuffer)

        const extracted = await extractViaApi('/api/process-file/image-ocr', file)
        content = extracted || `[Image: ${fileName} - Processing image...]`
      } catch (error) {
        console.error('Image processing error:', error)
        content = `[Image: ${fileName} - Processing image...]`
      }
    } else if (fileType.startsWith('text/') || fileType === 'application/json') {
      content = await file.text()
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword'
    ) {
      // Word docs: best-effort. Server-side extraction is not implemented for
      // .docx in this codebase; surface a helpful placeholder.
      content = `[Word Document: ${fileName} - Please convert to PDF or text file for better results]`
    } else if (
      fileType === 'text/csv' ||
      fileType === 'application/vnd.ms-excel' ||
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      try {
        content = await file.text()
        if (!content || content.trim().length === 0) {
          content = `[Spreadsheet: ${fileName} - Please export as CSV for full content extraction]`
        }
      } catch {
        content = `[Spreadsheet: ${fileName} - Please export as CSV for full content extraction]`
      }
    } else {
      try {
        content = await file.text()
        if (!content || content.trim().length === 0) {
          content = `[File: ${fileName} - Type: ${fileType} - Binary file, content extraction limited]`
        }
      } catch {
        content = `[File: ${fileName} - Type: ${fileType} - Content extraction not supported for this file type]`
      }
    }

    return {
      name: fileName,
      type: fileType,
      content: content.trim(),
      size: fileSize,
      isImage,
      isPdf: fileType === 'application/pdf',
      imageData,
    }
  } catch (error) {
    console.error('Error processing file:', error)
    return {
      name: fileName,
      type: fileType,
      content: `[Error processing file: ${fileName}]`,
      size: fileSize,
    }
  }
}

export function getFileTypeIcon(fileType: string): string {
  if (fileType === 'application/pdf') return '📄'
  if (fileType.startsWith('text/')) return '📝'
  if (fileType.includes('word') || fileType.includes('document')) return '📄'
  if (fileType.startsWith('image/')) return '🖼️'
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊'
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📈'
  return '📎'
}
