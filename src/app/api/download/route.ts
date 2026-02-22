import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

const STORAGE_BASE = path.join(process.cwd(), 'storage', 'users')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const filename = searchParams.get('filename')

    if (!userId || !filename) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const filePath = path.join(STORAGE_BASE, userId, 'output', filename)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(filePath)
    const contentType = filename.endsWith('.mp4') ? 'video/mp4' 
      : filename.endsWith('.webm') ? 'video/webm'
      : filename.endsWith('.mov') ? 'video/quicktime'
      : 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
