import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import type { ChatMessage } from './types';

type Props = {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  running: boolean;
};

export const ChatPanel: React.FC<Props> = ({ messages, onSend, running }) => {
  const [draft, setDraft] = useState('Give this video a bolder cinematic palette, kinetic title reveal, and chart-driven scene transition.');

  return (
    <section className="panel chat-panel">
      <div className="panel-head">
        <h2>Editor Chat</h2>
        <span className={running ? 'status status-live' : 'status'}>
          <Sparkles size={14} />
          {running ? 'Agent Running' : 'Idle'}
        </span>
      </div>

      <div className="messages">
        {messages.map((message) => (
          <article key={message.id} className={`message message-${message.role}`}>
            <header>
              <strong>{message.role}</strong>
              <time>{message.timestamp}</time>
            </header>
            <p>{message.text}</p>
          </article>
        ))}
      </div>

      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          onSend(draft.trim());
          setDraft('');
        }}
      >
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={4}
          placeholder="Describe the video change you want..."
        />
        <button type="submit" disabled={running || !draft.trim()}>
          <Send size={16} />
          Queue edit
        </button>
      </form>
    </section>
  );
};
