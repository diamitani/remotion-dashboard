import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link2, LoaderCircle, Plus } from 'lucide-react';
import { RemotionPreview } from '../remotion/RemotionPreview';
import type { PlatformApi } from '../services/platformApi';
import type { Project, User } from '../types/platform';

type Props = {
  user: User;
  api: PlatformApi;
  onSignOut: () => void;
};

const toTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const WorkspacePage: React.FC<Props> = ({ user, api, onSignOut }) => {
  const workspaceId = useMemo(() => `ws_${user.id}`, [user.id]);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [busy, setBusy] = useState(false);
  const [promptDraft, setPromptDraft] = useState('Create a high-energy launch cut with title intro, KPI scene, and final CTA bumper.');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const selectedProject = projects.find((project) => project.id === selectedId) ?? null;

  useEffect(() => {
    const load = async () => {
      setLoadingProjects(true);
      try {
        const list = await api.listProjects(workspaceId);
        setProjects(list);
        setSelectedId((current) => current ?? list[0]?.id ?? null);
      } finally {
        setLoadingProjects(false);
      }
    };

    void load();
  }, [api, workspaceId]);

  const updateProject = (next: Project) => {
    setProjects((current) => {
      const index = current.findIndex((item) => item.id === next.id);
      if (index < 0) {
        return [next, ...current];
      }
      const copy = [...current];
      copy[index] = next;
      return copy.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    });
    setSelectedId(next.id);
  };

  const handleCreateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newProjectName.trim() || !newProjectDescription.trim()) {
      return;
    }

    setBusy(true);
    try {
      const created = await api.createProject({
        workspaceId,
        name: newProjectName.trim(),
        description: newProjectDescription.trim(),
      });
      updateProject(created);
      setNewProjectName('');
      setNewProjectDescription('');
    } finally {
      setBusy(false);
    }
  };

  const handlePromptSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProject || !promptDraft.trim()) {
      return;
    }

    setBusy(true);
    try {
      const response = await api.sendPrompt({
        projectId: selectedProject.id,
        prompt: promptDraft.trim(),
      });
      updateProject(response.project);
      setPromptDraft('');
    } finally {
      setBusy(false);
    }
  };

  const handleTokenMode = async (mode: Project['tokenMode']) => {
    if (!selectedProject) {
      return;
    }
    setBusy(true);
    try {
      const updated = await api.updateTokenMode(selectedProject.id, mode);
      updateProject(updated);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="workspace-shell">
      <header className="workspace-topbar">
        <div>
          <p className="workspace-brand">MotionForge AI</p>
          <h1>{user.displayName}&apos;s Workspace</h1>
        </div>
        <button onClick={onSignOut} className="ghost-button" type="button">
          Sign out
        </button>
      </header>

      <div className="workspace-grid">
        <aside className="workspace-panel sidebar">
          <div className="panel-title-row">
            <h2>Projects</h2>
            <Plus size={16} />
          </div>

          <form className="project-form" onSubmit={handleCreateProject}>
            <input
              value={newProjectName}
              onChange={(event) => setNewProjectName(event.target.value)}
              placeholder="Project name"
            />
            <textarea
              rows={3}
              value={newProjectDescription}
              onChange={(event) => setNewProjectDescription(event.target.value)}
              placeholder="What video are you building?"
            />
            <button disabled={busy || !newProjectName.trim() || !newProjectDescription.trim()} type="submit">
              Create project
            </button>
          </form>

          {loadingProjects ? (
            <p className="empty-state">Loading projects...</p>
          ) : (
            <div className="project-list">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={`project-item ${project.id === selectedId ? 'active' : ''}`}
                  onClick={() => setSelectedId(project.id)}
                >
                  <strong>{project.name}</strong>
                  <span>{project.description}</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="workspace-panel chat">
          <div className="panel-title-row">
            <h2>Agent Chat</h2>
            {busy ? (
              <span className="running-pill">
                <LoaderCircle size={14} />
                Running
              </span>
            ) : (
              <span className="running-pill idle">Idle</span>
            )}
          </div>

          <div className="chat-thread">
            {selectedProject?.messages.map((message) => (
              <article className={`chat-message ${message.role}`} key={message.id}>
                <header>
                  <strong>{message.role}</strong>
                  <time>{toTime(message.createdAt)}</time>
                </header>
                <p>{message.text}</p>
              </article>
            )) ?? <p className="empty-state">Choose a project to start chatting.</p>}
          </div>

          <form className="chat-composer" onSubmit={handlePromptSubmit}>
            <textarea
              rows={4}
              value={promptDraft}
              onChange={(event) => setPromptDraft(event.target.value)}
              placeholder="Describe the edit you want..."
            />
            <button disabled={busy || !selectedProject || !promptDraft.trim()} type="submit">
              Send Prompt
            </button>
          </form>
        </section>

        <section className="workspace-panel preview">
          <div className="panel-title-row">
            <h2>Preview + Runtime</h2>
            <a href="https://remotion.dev" target="_blank" rel="noreferrer" className="inline-link">
              <Link2 size={14} />
              Remotion docs
            </a>
          </div>

          <RemotionPreview promptText={selectedProject?.previewPrompt ?? 'Select a project to render preview'} />

          <div className="runtime-card">
            <h3>Token Mode</h3>
            <p>Choose if this project uses your platform account or user-provided API keys.</p>

            <label>
              <input
                type="radio"
                checked={selectedProject?.tokenMode === 'platform-managed'}
                onChange={() => handleTokenMode('platform-managed')}
                disabled={!selectedProject || busy}
              />
              Platform-managed billing
            </label>

            <label>
              <input
                type="radio"
                checked={selectedProject?.tokenMode === 'bring-your-own-key'}
                onChange={() => handleTokenMode('bring-your-own-key')}
                disabled={!selectedProject || busy}
              />
              Bring-your-own-key (BYOK)
            </label>

            <p className="runtime-note">
              Shared Remotion runtime stays on your infrastructure; users are isolated by workspace + project IDs.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
