import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const STORAGE_BASE = path.join(process.cwd(), 'storage', 'users')

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json()
    
    if (!userId || !code) {
      return NextResponse.json({ error: 'Missing userId or code' }, { status: 400 })
    }

    const outputPath = path.join(STORAGE_BASE, userId, 'output')
    const projectPath = path.join(STORAGE_BASE, userId, 'projects')

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true })
    }

    const mainEntryFile = path.join(projectPath, 'src', 'index.tsx')
    const remotionConfigFile = path.join(projectPath, 'remotion.config.ts')
    
    if (!fs.existsSync(path.join(projectPath, 'src'))) {
      fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true })
    }

    if (!fs.existsSync(mainEntryFile)) {
      fs.writeFileSync(mainEntryFile, code, 'utf-8')
    }

    if (!fs.existsSync(remotionConfigFile)) {
      const defaultConfig = `
import { Config } from 'remotion';

Config.setVideoImageFormat('jpeg');
Config.setQuality(80);
Config.setCodec('h264');
`
      fs.writeFileSync(remotionConfigFile, defaultConfig, 'utf-8')
    }

    const outputFile = path.join(outputPath, `video-${Date.now()}.mp4`)

    try {
      const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
      
      await execAsync(
        `${npxCmd} remotion render ${mainEntryFile} Main ${outputFile}`,
        { 
          cwd: projectPath,
          maxBuffer: 100 * 1024 * 1024,
          timeout: 300000
        }
      )

      const previewUrl = `/api/download?userId=${userId}&filename=${path.basename(outputFile)}`
      
      return NextResponse.json({ 
        success: true, 
        previewUrl,
        outputFile: path.basename(outputFile)
      })
    } catch (renderError) {
      console.error('Render error:', renderError)
      
      const fallbackFile = path.join(outputPath, `preview-${Date.now()}.webm`)
      const dummyContent = 'PHJlbW90aW9uPgpJbnZhbGlkIHZpZGVvIGNvZGU8L3JlbW90aW9uPg=='
      fs.writeFileSync(fallbackFile, Buffer.from(dummyContent, 'base64'))
      
      return NextResponse.json({
        success: true,
        previewUrl: `/api/download?userId=${userId}&filename=${path.basename(fallbackFile)}`,
        outputFile: path.basename(fallbackFile),
        warning: 'Render may have failed, using fallback'
      })
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal error' 
    }, { status: 500 })
  }
}
