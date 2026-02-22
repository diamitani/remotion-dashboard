import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

const STORAGE_BASE = path.join(process.cwd(), 'storage', 'users')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const outputPath = path.join(STORAGE_BASE, userId, 'output')
    
    if (!fs.existsSync(outputPath)) {
      return NextResponse.json({ files: [] })
    }

    const files = fs.readdirSync(outputPath)
    const fileList = files
      .filter(f => !f.startsWith('.'))
      .map(f => {
        const stats = fs.statSync(path.join(outputPath, f))
        return { name: f, size: stats.size }
      })

    return NextResponse.json({ files: fileList })
  } catch (error) {
    console.error('Files API error:', error)
    return NextResponse.json({ error: 'Failed to load files' }, { status: 500 })
  }
}
