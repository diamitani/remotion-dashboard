'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'error'
  content: string
  code?: string
}

interface ChatPanelProps {
  userId: string
  onCodeGenerated: (code: string) => void
  isProcessing: boolean
  setIsProcessing: (v: boolean) => void
}

export default function ChatPanel({ 
  userId, 
  onCodeGenerated, 
  isProcessing, 
  setIsProcessing 
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I\'m your Remotion video assistant. Describe the video you want to create, and I\'ll build it for you using OpenCode with BigPickle model.'
    }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'Let me create that video for you...'
    }
    setMessages(prev => [...prev, assistantMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, prompt: input.trim() })
      })

      const result = await response.json()
      
      if (result.error) {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { 
                ...msg, 
                role: 'error',
                content: `Error: ${result.error}`
              }
            : msg
        ))
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { 
                ...msg, 
                content: result.response,
                code: result.code || undefined
              }
            : msg
        ))

        if (result.code) {
          onCodeGenerated(result.code)
        }
      }
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { 
              ...msg, 
              role: 'error',
              content: `Error: ${error instanceof Error ? error.message : 'Failed to process request'}`
            }
          : msg
      ))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className="header">
        <h1>
          <span className="status-indicator ready">●</span>
          Remotion Studio
          <span className="badge">BigPickle</span>
        </h1>
      </div>

      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role}`}>
            {msg.content}
            {msg.code && (
              <div className="code-block">
                {msg.code}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Describe your video..."
          disabled={isProcessing}
        />
        <button type="submit" disabled={isProcessing || !input.trim()}>
          {isProcessing ? 'Creating...' : 'Create'}
        </button>
      </form>
    </>
  )
}
