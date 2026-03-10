export interface PDFData {
  title: string
  subtitle?: string
  companyName?: string
  analysisDate: string
  competitorUrl: string
  content: string
  metadata?: {
    author?: string
    version?: string
    category?: string
  }
}

export function generateProfessionalPDF(data: PDFData): string {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Libre+Baskerville:wght@400;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        p, h1, h2, h3, h4, h5, h6, div, span, li, td, th, label, strong, em, b, i, u, small, sub, sup {
            color: #000000 !important;
        }
        
        a {
            color: #005DFF !important;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: #1a1a1a !important;
            background: #ffffff;
            font-size: 14px;
        }
        
        .pdf-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
        }
        
        .pdf-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: #005DFF;
        }
        
        .header {
            padding: 0 0 25px 0;
            margin-bottom: 35px;
            border-bottom: 2px solid #e5e7eb;
            position: relative;
        }
        
        .header::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 60px;
            height: 2px;
            background: #005DFF;
        }
        
        .header h1 {
            font-size: 32px;
            font-weight: 700;
            color: #1a1a1a !important;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
        }
        
        .header .subtitle {
            font-size: 15px;
            color: #6b7280 !important;
            font-weight: 400;
            margin-bottom: 20px;
        }
        
        .header .company-info {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .company-info .left {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        
        .company-info .left > div {
            color: #4b5563 !important;
            font-size: 13px;
        }
        
        .company-info .right {
            text-align: right;
            color: #6b7280 !important;
            font-size: 12px;
        }
        
        .url-badge {
            display: inline-block;
            background: #f3f4f6;
            color: #1a1a1a !important;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            border: 1px solid #e5e7eb;
        }
        
        .content {
            margin-top: 20px;
        }
        
        .content h1 {
            font-size: 26px;
            font-weight: 700;
            color: #1a1a1a !important;
            margin: 35px 0 20px 0;
            padding-bottom: 12px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .content h2 {
            font-size: 20px;
            font-weight: 600;
            color: #1a1a1a !important;
            margin: 30px 0 15px 0;
            padding-left: 12px;
            border-left: 3px solid #005DFF;
        }
        
        .content h3 {
            font-size: 17px;
            font-weight: 600;
            color: #1a1a1a !important;
            margin: 25px 0 12px 0;
        }
        
        .content h4 {
            font-size: 15px;
            font-weight: 600;
            color: #374151 !important;
            margin: 20px 0 10px 0;
            text-transform: none;
            letter-spacing: 0;
        }
        
        .content p {
            margin-bottom: 14px;
            color: #374151 !important;
            text-align: left;
            line-height: 1.8;
        }
        
        .content ul, .content ol {
            margin: 15px 0 15px 25px;
            color: #374151 !important;
            padding-left: 10px;
        }
        
        .content li {
            margin-bottom: 8px;
            line-height: 1.7;
            position: relative;
            padding-left: 4px;
        }
        
        .content ul li::marker {
            color: #6b7280;
        }
        
        .content ol li::marker {
            color: #6b7280;
            font-weight: 600;
        }
        
        .content strong {
            color: #1a1a1a !important;
            font-weight: 600;
        }
        
        .content em {
            color: #374151 !important;
            font-style: italic;
        }
        
        .highlight-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-left: 3px solid #005DFF;
            padding: 20px;
            margin: 25px 0;
            border-radius: 6px;
        }
        
        .highlight-box h4 {
            color: #1a1a1a !important;
            margin-top: 0;
            margin-bottom: 12px;
            font-weight: 600;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
            margin: 25px 0;
        }
        
        .stat-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            padding: 18px;
            border-radius: 6px;
            text-align: center;
        }
        
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: #005DFF;
        }
        
        .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: #1a1a1a !important;
            margin-bottom: 6px;
        }
        
        .stat-label {
            font-size: 12px;
            color: #6b7280 !important;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 500;
        }
        
        .tactics-list {
            counter-reset: tactic-counter;
        }
        
        .tactic-item {
            counter-increment: tactic-counter;
            margin-bottom: 16px;
            padding: 18px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-left: 3px solid #005DFF;
            border-radius: 6px;
            position: relative;
        }
        
        .tactic-item::before {
            content: counter(tactic-counter);
            position: absolute;
            top: 18px;
            left: 18px;
            background: #005DFF;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 600;
        }
        
        .tactic-content {
            margin-left: 44px;
        }
        
        .tactic-title {
            font-weight: 600;
            color: #1a1a1a !important;
            margin-bottom: 8px;
            font-size: 15px;
        }
        
        .tactic-details {
            font-size: 13px;
            color: #6b7280 !important;
            line-height: 1.7;
        }
        
        .footer {
            margin-top: 50px;
            padding: 25px 0 20px 0;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280 !important;
            font-size: 12px;
        }
        
        .footer::before {
            content: '';
            position: absolute;
            top: -1px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 2px;
            background: #005DFF;
        }
        
        .footer .logo {
            font-weight: 700;
            color: #1a1a1a !important;
            font-size: 16px;
            margin-bottom: 6px;
            letter-spacing: -0.01em;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .executive-summary {
            background: #f9fafb;
            padding: 24px;
            border-radius: 6px;
            margin: 25px 0;
            border: 1px solid #e5e7eb;
            border-left: 3px solid #005DFF;
        }
        
        .executive-summary h2 {
            color: #1a1a1a !important;
            margin-top: 0;
            border: none;
            padding: 0;
            font-size: 20px;
        }
        
        .competitive-advantage {
            background: #f9fafb;
            padding: 24px;
            border-radius: 6px;
            margin: 25px 0;
            border: 1px solid #e5e7eb;
            border-left: 3px solid #005DFF;
        }
        
        .competitive-advantage h3 {
            color: #1a1a1a !important;
            margin-top: 0;
            font-size: 18px;
        }
        
        .risk-assessment {
            background: #fef2f2;
            padding: 24px;
            border-radius: 6px;
            margin: 25px 0;
            border: 1px solid #fecaca;
            border-left: 3px solid #ef4444;
        }
        
        .risk-assessment h3 {
            color: #991b1b !important;
            margin-top: 0;
            font-size: 18px;
        }
        
        .implementation-timeline {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 24px;
            margin: 25px 0;
        }
        
        .timeline-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 14px;
            padding: 14px;
            background: #f9fafb;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            position: relative;
        }
        
        .timeline-item::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: #005DFF;
            border-radius: 0;
        }
        
        .timeline-badge {
            background: #005DFF;
            color: white;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            margin-right: 14px;
            min-width: 60px;
            text-align: center;
        }
        
        .timeline-content {
            flex: 1;
        }
        
        .timeline-title {
            font-weight: 600;
            color: #1a1a1a !important;
            margin-bottom: 4px;
            font-size: 14px;
        }
        
        .timeline-description {
            font-size: 13px;
            color: #6b7280 !important;
            line-height: 1.6;
        }
        
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            
            .pdf-container {
                box-shadow: none;
                margin: 0;
                padding: 15mm;
            }
            
            .page-break {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    <div class="pdf-container">
        <div class="header">
            <h1>${data.title}</h1>
            ${data.subtitle ? `<div class="subtitle">${data.subtitle}</div>` : ''}
            <div class="company-info">
                <div class="left">
                    ${data.companyName ? `<div><strong>Company:</strong> ${data.companyName}</div>` : ''}
                    <div class="url-badge">${data.competitorUrl}</div>
                </div>
                <div class="right">
                    <div><strong>Analysis Date:</strong> ${data.analysisDate}</div>
                    ${data.metadata?.author ? `<div><strong>Analyst:</strong> ${data.metadata.author}</div>` : ''}
                    ${data.metadata?.version ? `<div><strong>Version:</strong> ${data.metadata.version}</div>` : ''}
                </div>
            </div>
        </div>
        
        <div class="content">
            ${formatContentForPDF(data.content)}
        </div>
        
        <div class="footer">
            <div class="logo">DreamScale AI</div>
            <div style="margin-top: 6px;">Generated by DreamScale Intelligence Platform</div>
            <div style="margin-top: 4px; font-size: 11px; opacity: 0.8;">${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</div>
        </div>
    </div>
</body>
</html>`

  return htmlContent
}

function formatContentForPDF(content: string): string {
  // Convert markdown-style content to HTML with enhanced styling
  let html = content
  
  // Convert headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // Convert bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // Convert italic text
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  
  // Convert bullet points
  html = html.replace(/^• (.*$)/gim, '<li>$1</li>')
  html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$1. $2</li>')
  
  // Handle special bullet points for value proposition analysis
  html = html.replace(/^Convenience-Driven Consumers:/gim, '<h4>Convenience-Driven Consumers:</h4>')
  html = html.replace(/^Families with Children:/gim, '<h4>Families with Children:</h4>')
  
  // Wrap consecutive list items in ul/ol tags
  html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
    const listItems = match.match(/<li>.*?<\/li>/g) || []
    if (listItems.length > 0) {
      const isNumbered = /^\d+\./.test(listItems[0])
      const tag = isNumbered ? 'ol' : 'ul'
      return `<${tag}>${match}</${tag}>`
    }
    return match
  })
  
  // Convert line breaks
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')
  
  // Wrap paragraphs
  html = html.replace(/^(?!<[h|u|o|l])/gm, '<p>')
  html = html.replace(/(?<!>)$/gm, '</p>')
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '')
  html = html.replace(/<p><br><\/p>/g, '')
  
  // Add special styling for specific sections
  html = html.replace(/<h2>Executive Summary<\/h2>/g, '<div class="executive-summary"><h2>Executive Summary</h2>')
  html = html.replace(/<h2>Value Proposition Assessment<\/h2>/g, '</div><div class="highlight-box"><h2>Value Proposition Assessment</h2>')
  html = html.replace(/<h2>Strategic Differentiation Roadmap<\/h2>/g, '</div><div class="competitive-advantage"><h2>Strategic Differentiation Roadmap</h2>')
  html = html.replace(/<h2>Risk Assessment<\/h2>/g, '</div><div class="risk-assessment"><h2>Risk Assessment</h2>')
  html = html.replace(/<h2>Implementation Roadmap<\/h2>/g, '</div><div class="implementation-timeline"><h2>Implementation Roadmap</h2>')
  
  // Add closing divs for special sections
  html = html.replace(/<h2>(?!Executive Summary|Value Proposition Assessment|Strategic Differentiation Roadmap|Risk Assessment|Implementation Roadmap)/g, '</div><h2>')
  html += '</div>'
  
  // Format tactics list
  html = html.replace(/<h2>10 Actionable Tactics to Outperform<\/h2>/g, '<h2>10 Actionable Tactics to Outperform</h2><div class="tactics-list">')
  html = html.replace(/<h3>Quick Wins \(0-30 days\)<\/h3>/g, '</div><h3>Quick Wins (0-30 days)</h3>')
  
  // Add stats grid for website ratings
  html = html.replace(/<h2>Digital Experience Audit<\/h2>/g, '<h2>Digital Experience Audit</h2><div class="stats-grid">')
  html = html.replace(/<h3>Website Performance Scores<\/h3>/g, '</div><h3>Website Performance Scores</h3>')
  
  // Add special formatting for competitive analysis sections
  html = html.replace(/<h2>Market Positioning Analysis<\/h2>/g, '</div><div class="highlight-box"><h2>Market Positioning Analysis</h2>')
  html = html.replace(/<h2>Competitive Advantage Deep Dive<\/h2>/g, '</div><div class="competitive-advantage"><h2>Competitive Advantage Deep Dive</h2>')
  html = html.replace(/<h2>Trust & Conversion Analysis<\/h2>/g, '</div><div class="highlight-box"><h2>Trust & Conversion Analysis</h2>')
  html = html.replace(/<h2>Pricing Strategy Intelligence<\/h2>/g, '</div><div class="highlight-box"><h2>Pricing Strategy Intelligence</h2>')
  
  return html
}

export async function downloadPDF(data: PDFData, filename?: string): Promise<void> {
  try {
    // Dynamically import html2pdf.js and html2canvas
    const html2pdfModule = await import('html2pdf.js')
    const html2pdf = html2pdfModule.default || html2pdfModule
    
    const htmlContent = generateProfessionalPDF(data)
    
    // Create a temporary container div (off-screen but visible for html2canvas)
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.style.width = '210mm'
    container.style.minHeight = '297mm'
    container.style.padding = '0'
    container.style.margin = '0'
    container.style.backgroundColor = '#ffffff'
    container.style.zIndex = '-9999'
    
    // Extract body content and styles from the HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    const bodyContent = doc.body.innerHTML
    const styles = Array.from(doc.head.querySelectorAll('style')).map(style => style.textContent).join('\n')
    
    // Create a wrapper with all styles and content
    container.innerHTML = `
      <style>${styles}</style>
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; width: 210mm; padding: 20mm; background: white; color: #000000 !important; font-size: 14px; line-height: 1.6; box-sizing: border-box;">
        ${bodyContent}
      </div>
    `
    
    document.body.appendChild(container)
    
    // Force layout calculation
    container.offsetHeight
    
    // Wait for fonts to load
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready
    }
    
    // Wait for images and content to render
    await new Promise(resolve => {
      // Wait for any images to load
      const images = container.querySelectorAll('img')
      if (images.length === 0) {
        setTimeout(resolve, 500)
      } else {
        let loadedCount = 0
        images.forEach(img => {
          if (img.complete) {
            loadedCount++
          } else {
            img.onload = () => {
              loadedCount++
              if (loadedCount === images.length) {
                setTimeout(resolve, 200)
              }
            }
            img.onerror = () => {
              loadedCount++
              if (loadedCount === images.length) {
                setTimeout(resolve, 200)
              }
            }
          }
        })
        if (loadedCount === images.length) {
          setTimeout(resolve, 500)
        }
      }
    })
    
    // Get the inner content div
    const contentDiv = container.querySelector('div') || container
    
    // Configure PDF options
    const opt = {
      margin: [0, 0, 0, 0],
      filename: filename?.replace(/\.html$/, '.pdf') || `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: true,
        width: contentDiv.scrollWidth,
        height: contentDiv.scrollHeight,
        windowWidth: contentDiv.scrollWidth,
        windowHeight: contentDiv.scrollHeight
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }
    
    console.log('Starting PDF generation...', {
      containerWidth: container.offsetWidth,
      containerHeight: container.offsetHeight,
      contentWidth: contentDiv.scrollWidth,
      contentHeight: contentDiv.scrollHeight,
      hasContent: contentDiv.textContent?.trim().length > 0
    })
    
    // Generate and download PDF
    await html2pdf().set(opt).from(contentDiv).save()
    
    console.log('PDF generation completed')
    
    // Clean up
    setTimeout(() => {
      if (document.body.contains(container)) {
        document.body.removeChild(container)
      }
    }, 1000)
  } catch (error) {
    console.error('PDF generation error:', error)
    // Fallback to HTML download if PDF generation fails
    const htmlContent = generateProfessionalPDF(data)
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename?.replace(/\.html$/, '.html') || `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export function printPDF(data: PDFData): void {
  const htmlContent = generateProfessionalPDF(data)
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }
}
