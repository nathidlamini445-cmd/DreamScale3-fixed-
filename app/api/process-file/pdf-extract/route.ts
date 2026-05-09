import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Use Google Gemini to extract text from PDF
    // Since Gemini can handle PDFs, we'll send it to the vision API
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    // Convert PDF to base64
    const base64 = buffer.toString('base64')
    const mimeType = file.type || 'application/pdf'

    try {
      // Use Gemini Pro Vision for PDF text extraction
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })
      
      const prompt = "Extract all text content from this PDF document. Return only the extracted text, preserving the structure and formatting as much as possible."
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64,
            mimeType: mimeType
          }
        }
      ])

      const response = result.response
      const text = response.text() || ''

      return NextResponse.json({
        success: true,
        text: text.trim() || `[PDF File: ${file.name} - No text could be extracted]`
      })
    } catch (error) {
      console.error('PDF extraction error:', error)
      // Fallback: try using gemini-1.5-pro which has better PDF support
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
        const result = await model.generateContent([
          "Extract all text from this PDF. Return only the text content.",
          {
            inlineData: {
              data: base64,
              mimeType: mimeType
            }
          }
        ])
        const text = result.response.text() || ''
        return NextResponse.json({
          success: true,
          text: text.trim() || `[PDF File: ${file.name} - No text could be extracted]`
        })
      } catch (fallbackError) {
        console.error('PDF extraction fallback error:', fallbackError)
        return NextResponse.json(
          { error: 'Failed to extract text from PDF. Please ensure the PDF contains readable text.' },
          { status: 500 }
        )
      }
    }
  } catch (error) {
    console.error('PDF processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    )
  }
}

