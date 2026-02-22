import path from 'path'
import fs from 'fs'

const STORAGE_BASE = path.join(process.cwd(), 'storage', 'users')

export function generateUserId(): string {
  return 'user_' + Math.random().toString(36).substring(2, 15)
}

export function getUserStorage(userId: string): string {
  const userPath = path.join(STORAGE_BASE, userId)
  if (!fs.existsSync(userPath)) {
    fs.mkdirSync(userPath, { recursive: true })
    fs.mkdirSync(path.join(userPath, 'projects'), { recursive: true })
    fs.mkdirSync(path.join(userPath, 'output'), { recursive: true })
  }
  return userPath
}

export function getUserProjectPath(userId: string): string {
  return path.join(STORAGE_BASE, userId, 'projects')
}

export function getUserOutputPath(userId: string): string {
  return path.join(STORAGE_BASE, userId, 'output')
}

export async function getUserFiles(userId: string): Promise<{name: string, size: number}[]> {
  const outputPath = getUserOutputPath(userId)
  
  if (!fs.existsSync(outputPath)) {
    return []
  }

  const files = fs.readdirSync(outputPath)
  return files
    .filter(f => !f.startsWith('.'))
    .map(f => {
      const stats = fs.statSync(path.join(outputPath, f))
      return { name: f, size: stats.size }
    })
}

export function saveUserProject(userId: string, filename: string, content: string): string {
  const projectPath = getUserProjectPath(userId)
  const filePath = path.join(projectPath, filename)
  fs.writeFileSync(filePath, content, 'utf-8')
  return filePath
}
