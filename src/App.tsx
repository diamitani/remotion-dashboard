import { useMemo, useState } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { PreviewPanel } from './components/PreviewPanel';
import type { ChatMessage } from './components/types';

const baseMessages: ChatMessage[] = [
  {
    id: 'm1',
    role: 'system',
    text: 'Connected to OpenCode worker. Remotion project bootstrap and style libraries are loaded.',
    timestamp: '09:14',
  },
  {
    id: 'm2',
    role: 'assistant',
    text: 'Ready. I can update compositions, run render previews, and sync brand tokens.',
    timestamp: '09:14',
  },
];

export const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(baseMessages);
  const [running, setRunning] = useState(false);
  const [promptText, setPromptText] = useState('Design-system-first motion dashboard');

  const previewUrl = useMemo(() => 'https://your-remotion-dashboard.example.com/preview/session-123', []);

  const pushMessage = (role: ChatMessage['role'], text: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role,
        text,
        timestamp,
      },
    ]);
  };

  const handleSend = (text: string) => {
    pushMessage('user', text);
    setRunning(true);

    window.setTimeout(() => {
      setPromptText(text);
      pushMessage('assistant', 'Patch generated and preview re-rendered. Style tokens + animation timing updated.');
      setRunning(false);
    }, 1400);
  };

  return (
    <main className="layout">
      <aside>
        <ChatPanel messages={messages} onSend={handleSend} running={running} />
      </aside>
      <section>
        <PreviewPanel previewUrl={previewUrl} promptText={promptText} />
      </section>
    </main>
  );
};
