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
      // For PDFs, convert to base64 for Gemini Vision API
      try {
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        imageData = base64
        
        // Try to extract text using Gemini API directly (server-side)
        if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) {
          try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai')
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
            
            // Try gemini-1.5-pro first (better PDF support)
            try {
              const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
              const result = await model.generateContent([
                "Extract all text from this PDF document. Return only the extracted text content, preserving structure and formatting.",
                {
                  inlineData: {
                    data: base64,
                    mimeType: 'application/pdf'
                  }
                }
              ])
              content = result.response.text() || `[PDF File: ${fileName} - Ready for analysis]`
            } catch (error) {
              // Fallback to gemini-pro-vision
              console.log('Trying gemini-pro-vision fallback for PDF')
              const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })
              const result = await model.generateContent([
                "Extract all text content from this PDF. Return only the text.",
                {
                  inlineData: {
                    data: base64,
                    mimeType: 'application/pdf'
                  }
                }
              ])
              content = result.response.text() || `[PDF File: ${fileName} - Ready for analysis]`
            }
          } catch (error) {
            console.error('PDF extraction error:', error)
            content = `[PDF File: ${fileName} - Ready for analysis]`
          }
        } else {
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
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        imageData = base64
        
        // Extract text from image using Gemini Vision API (server-side)
        if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) {
          try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai')
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
            const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })
            
            const result = await model.generateContent([
              "Extract all text from this image. Return only the extracted text content.",
              {
                inlineData: {
                  data: base64,
                  mimeType: fileType || 'image/png'
                }
              }
            ])
            content = result.response.text() || `[Image: ${fileName} - Text extracted from image]`
          } catch (error) {
            console.error('Image OCR error:', error)
            content = `[Image: ${fileName} - Processing image...]`
          }
        } else {
          content = `[Image: ${fileName} - Processing image...]`
        }
      } catch (error) {
        console.error('Image processing error:', error)
        content = `[Image: ${fileName} - Processing image...]`
      }
    } else if (fileType.startsWith('text/') || fileType === 'application/json') {
      // Process text files directly
      content = await file.text()
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               fileType === 'application/msword') {
      // For Word documents, try to extract text using Gemini if available
      // Note: This is a workaround - ideally use a library like mammoth for .docx
      try {
        // Convert to base64 and try Gemini
        if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) {
          const arrayBuffer = await file.arrayBuffer()
          const base64 = Buffer.from(arrayBuffer).toString('base64')
          
          try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai')
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
            
            const result = await model.generateContent([
              "Extract all text content from this Word document. Return only the extracted text.",
              {
                inlineData: {
                  data: base64,
                  mimeType: fileType
                }
              }
            ])
            content = result.response.text() || `[Word Document: ${fileName} - Content extracted]`
          } catch (error) {
            console.error('Word document extraction error:', error)
            content = `[Word Document: ${fileName} - Please convert to PDF or text file for better results]`
          }
        } else {
          content = `[Word Document: ${fileName} - Please convert to PDF or text file for better results]`
        }
      } catch (error) {
        console.error('Word document processing error:', error)
        content = `[Word Document: ${fileName} - Please convert to PDF or text file for better results]`
      }
    } else if (fileType === 'text/csv' || fileType === 'application/vnd.ms-excel' || 
               fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      // Try to read CSV/Excel as text (basic support)
      try {
        content = await file.text()
        if (!content || content.trim().length === 0) {
          content = `[Spreadsheet: ${fileName} - Please export as CSV for full content extraction]`
        }
      } catch (error) {
        content = `[Spreadsheet: ${fileName} - Please export as CSV for full content extraction]`
      }
    } else {
      // For other file types, try to read as text if possible
      try {
        content = await file.text()
        if (!content || content.trim().length === 0 || content.includes('')) {
          content = `[File: ${fileName} - Type: ${fileType} - Binary file, content extraction limited]`
        }
      } catch (error) {
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
