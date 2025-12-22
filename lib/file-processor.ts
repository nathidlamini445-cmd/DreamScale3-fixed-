// PDF parsing and image OCR will be handled here

export interface ProcessedFile {
  name: string
  type: string
  content: string
  size: number
  isImage?: boolean
  isPdf?: boolean
  imageData?: string // base64 for PDFs and images
}

export async function processFile(file: File): Promise<ProcessedFile> {
  const fileType = file.type
  const fileName = file.name
  const fileSize = file.size

  try {
    let content = ''
    let isImage = false
    let imageData: string | undefined = undefined

    if (fileType === 'application/pdf') {
      // For PDFs, we'll send them directly to Gemini Vision API
      // Convert PDF to base64 for direct processing
      try {
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        imageData = base64 // Store as imageData so it can be sent to Gemini Vision
        
        // Also try to extract text as a preview/fallback
        try {
          const formData = new FormData()
          formData.append('file', file)
          
          const response = await fetch('/api/process-file/pdf-extract', {
            method: 'POST',
            body: formData
          })
          
          if (response.ok) {
            const result = await response.json()
            content = result.text || `[PDF File: ${fileName} - Ready for analysis]`
          } else {
            const errorData = await response.json().catch(() => ({}))
            console.error('PDF extraction error:', errorData)
            content = `[PDF File: ${fileName} - Ready for analysis]`
          }
        } catch (error) {
          console.error('PDF extraction error:', error)
          content = `[PDF File: ${fileName} - Ready for analysis]`
        }
      } catch (error) {
        console.error('PDF processing error:', error)
        content = `[PDF File: ${fileName} - Error processing PDF]`
      }
    } else if (fileType.startsWith('image/')) {
      // Handle images - convert to base64 and extract text using Gemini Vision
      isImage = true
      try {
        // Convert image to base64
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        imageData = base64
        
        // Extract text from image using Gemini Vision API
        const formData = new FormData()
        formData.append('file', file)
        formData.append('imageData', base64)
        
        const response = await fetch('/api/process-file/image-ocr', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const result = await response.json()
          content = result.text || `[Image: ${fileName} - Text extracted from image]`
        } else {
          content = `[Image: ${fileName} - Processing image...]`
        }
      } catch (error) {
        console.error('Image OCR error:', error)
        content = `[Image: ${fileName} - Processing image...]`
      }
    } else if (fileType.startsWith('text/') || fileType === 'application/json') {
      // Process text files
      content = await file.text()
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               fileType === 'application/msword') {
      // For Word documents, we'll extract basic text (this is a simplified approach)
      // In production, you'd want to use a more robust library like mammoth
      content = `[Word Document: ${fileName} - Content extraction not fully implemented]`
    } else {
      content = `[File: ${fileName} - Type: ${fileType} - Content extraction not supported for this file type]`
    }

    return {
      name: fileName,
      type: fileType,
      content: content.trim(),
      size: fileSize,
      isImage,
      isPdf: fileType === 'application/pdf',
      imageData
    }
  } catch (error) {
    console.error('Error processing file:', error)
    return {
      name: fileName,
      type: fileType,
      content: `[Error processing file: ${fileName}]`,
      size: fileSize
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
