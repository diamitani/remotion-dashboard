'use client'

import { useState, useEffect } from 'react'

interface PreviewPanelProps {
  userId: string
  projectCode: string
  onPreviewUpdate: (url: string | null) => void
}

export default function PreviewPanel({ userId, projectCode, onPreviewUpdate }: PreviewPanelProps) {
  const [files, setFiles] = useState<{name: string, size: number}[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isRendering, setIsRendering] = useState(false)

  const loadFiles = async () => {
    try {
      const response = await fetch(`/api/files?userId=${userId}`)
      const data = await response.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error('Failed to load files:', error)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [userId])

  useEffect(() => {
    if (projectCode) {
      loadFiles()
    }
  }, [projectCode, userId])

  const handleRender = async () => {
    if (!projectCode) return
    
    setIsRendering(true)
    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: projectCode })
      })
      
      if (response.ok) {
        const data = await response.json()
        setPreviewUrl(data.previewUrl)
        onPreviewUpdate(data.previewUrl)
        loadFiles()
      }
    } catch (error) {
      console.error('Render failed:', error)
    } finally {
      setIsRendering(false)
    }
  }

  const handleDownload = async (filename: string) => {
    window.open(`/api/download?userId=${userId}&filename=${filename}`, '_blank')
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <>
      <div className="preview-header">
        <h2>Visual Preview</h2>
        <div className="preview-actions">
          <button onClick={handleRender} disabled={!projectCode || isRendering}>
            {isRendering ? 'Rendering...' : 'Render Video'}
          </button>
          <button onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      </div>

      <div className="preview-content">
        {previewUrl ? (
          <iframe 
            className="preview-frame" 
            src={previewUrl}
            title="Video Preview"
          />
        ) : (
          <div className="preview-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p>{projectCode ? 'Click "Render Video" to preview' : 'Chat with the AI to create a video'}</p>
          </div>
        )}
      </div>

      <div className="download-section">
        <h3>Generated Files</h3>
        <div className="file-list">
          {files.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              No files yet
            </p>
          ) : (
            files.map((file, i) => (
              <div key={i} className="file-item">
                <span className="filename">{file.name}</span>
                <div>
                  <span className="filesize">{formatSize(file.size)}</span>
                  <button 
                    className="download-btn" 
                    onClick={() => handleDownload(file.name)}
                    style={{ marginLeft: '8px' }}
                  >
                    Download
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
