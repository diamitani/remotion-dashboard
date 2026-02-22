import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { getUserStorage, getUserProjectPath } from '@/lib/storage'

const OPENCODE_BIN = process.env.OPENCODE_BIN || '/home/diamitani/.opencode/bin/opencode'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId, prompt } = await request.json()
    
    if (!userId || !prompt) {
      return NextResponse.json({ error: 'Missing userId or prompt' }, { status: 400 })
    }

    const userProjects = getUserProjectPath(userId)
    getUserStorage(userId)

    if (!fs.existsSync(userProjects)) {
      fs.mkdirSync(userProjects, { recursive: true })
    }

    const systemPrompt = `You are an expert Remotion developer. Create video projects using React and Remotion.

When the user asks for a video, you MUST:
1. Create a complete Remotion project with all necessary files
2. Use TypeScript and follow best practices
3. Include animations using framer-motion, gsap, or lottie
4. Save all files to the user's project directory

Available libraries:
- remotion: Video rendering
- framer-motion: Smooth animations  
- gsap: Timeline control
- lottie-react: Pre-made animations
- @remotion/three: 3D content
- @remotion/gltf: 3D models
- @remotion/maps: Maps with Mapbox
- @remotion/player: Video player component

User project directory: ${userProjects}

When creating code, output it in a structured format with clear file names.
Always create complete, working code that can be rendered.`

    return new Promise<NextResponse>((resolve) => {
      const args = [
        'run',
        '--model', 'big-pickle',
        prompt
      ]

      console.log('Executing OpenCode with:', args)

      const proc = spawn(OPENCODE_BIN, args, {
        cwd: userProjects,
        env: {
          ...process.env,
          OPENCODE_MODEL: 'big-pickle'
        }
      })

      let stdout = ''
      let stderr = ''

      proc.stdout.on('data', (data) => {
        const text = data.toString()
        stdout += text
        console.log('OpenCode:', text)
      })

      proc.stderr.on('data', (data) => {
        stderr += data.toString()
        console.error('OpenCode stderr:', data.toString())
      })

      proc.on('close', (code) => {
        console.log('OpenCode exit code:', code)
        
        try {
          const files = fs.readdirSync(userProjects)
          const codeFiles = files.filter(f => 
            f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.js')
          )

          let extractedCode = ''
          if (codeFiles.length > 0) {
            const mainFile = codeFiles.find(f => f.includes('Video') || f.includes('Composition')) || codeFiles[0]
            if (mainFile) {
              extractedCode = fs.readFileSync(path.join(userProjects, mainFile), 'utf-8')
            }
          }

          resolve(NextResponse.json({
            response: stdout || 'Video project created successfully!',
            code: extractedCode,
            files: codeFiles
          }))
        } catch (parseError) {
          resolve(NextResponse.json({
            response: stdout || 'Project created. Check the preview panel.',
            code: undefined
          }))
        }
      })

      proc.on('error', (err) => {
        console.error('OpenCode process error:', err)
        resolve(NextResponse.json({ error: err.message }, { status: 500 }))
      })

      setTimeout(() => {
        proc.kill()
        resolve(NextResponse.json({ 
          response: 'Request timed out. Project may still be created.',
          warning: 'timeout'
        }, { status: 200 }))
      }, 180000)
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal error' 
    }, { status: 500 })
  }
}
