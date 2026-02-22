'use client'

import { useState } from 'react'
import ChatPanel from '@/components/ChatPanel'
import PreviewPanel from '@/components/PreviewPanel'

function generateUserId(): string {
  return 'user_' + Math.random().toString(36).substring(2, 15)
}

export default function Dashboard() {
  const [userId] = useState(() => generateUserId())
  const [projectCode, setProjectCode] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleCodeGenerated = (code: string) => {
    setProjectCode(code)
  }

  const handlePreviewUpdate = (url: string | null) => {
    setPreviewUrl(url)
  }

  return (
    <div className="dashboard">
      <div className="chat-panel">
        <ChatPanel 
          userId={userId}
          onCodeGenerated={handleCodeGenerated}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
        />
      </div>
      <div className="preview-panel">
        <PreviewPanel 
          userId={userId}
          projectCode={projectCode}
          onPreviewUpdate={handlePreviewUpdate}
        />
      </div>
    </div>
  )
}
