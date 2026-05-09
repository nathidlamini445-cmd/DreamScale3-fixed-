import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const imageData = formData.get('imageData') as string

    if (!file && !imageData) {
      return NextResponse.json(
        { error: 'No file or image data provided' },
        { status: 400 }
      )
    }

    // Check file size (limit to 10MB)
    if (file) {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 10MB.' },
          { status: 400 }
        )
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

    // Get image data
    let base64: string
    let mimeType: string

    if (imageData) {
      base64 = imageData
      mimeType = file?.type || 'image/png'
    } else if (file) {
      const arrayBuffer = await file.arrayBuffer()
      base64 = Buffer.from(arrayBuffer).toString('base64')
      mimeType = file.type || 'image/png'
    } else {
      return NextResponse.json(
        { error: 'No image data available' },
        { status: 400 }
      )
    }

    // Note: 'gemini-pro-vision' was removed from the API; use a current
    // multimodal model. Configurable via env, with sensible defaults.
    const primaryModel = process.env.GEMINI_MODEL || 'gemini-1.5-pro'
    const fallbackModel =
      primaryModel === 'gemini-1.5-pro' ? 'gemini-1.5-flash' : 'gemini-1.5-pro'

    const tryExtract = async (modelName: string) => {
      const model = genAI.getGenerativeModel({ model: modelName })
      const prompt =
        "Extract all text content from this image. If there's any text visible (including screenshots, documents, handwritten notes, etc.), return it exactly as it appears. If there's no text, describe what you see in the image."
      const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64, mimeType } },
      ])
      return (result.response.text() || '').trim()
    }

    try {
      const text = await tryExtract(primaryModel)
      return NextResponse.json({
        success: true,
        text: text || `[Image: ${file?.name || 'image'} - No text could be extracted]`,
      })
    } catch (error) {
      console.error('Image OCR error (primary model):', error)
      try {
        const text = await tryExtract(fallbackModel)
        return NextResponse.json({
          success: true,
          text: text || `[Image: ${file?.name || 'image'} - No text could be extracted]`,
        })
      } catch (fallbackError) {
        console.error('Image OCR fallback error:', fallbackError)
        return NextResponse.json(
          { error: 'Failed to extract text from image. Please ensure the image contains readable text.' },
          { status: 500 }
        )
      }
    }
  } catch (error) {
    console.error('Image processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
}

