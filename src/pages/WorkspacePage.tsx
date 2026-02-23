import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link2, LoaderCircle, Plus } from 'lucide-react';
import { RemotionPreview } from '../remotion/RemotionPreview';
import type { PlatformApi } from '../services/platformApi';
import type {
  BillingPlan,
  BillingProfile,
  ByokProvider,
  Project,
  SubscriptionStatus,
  User,
} from '../types/platform';
import { estimatePromptCreditCost } from '../utils/billing';

type Props = {
  user: User;
  api: PlatformApi;
  onSignOut: () => void;
};

const toTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const toDateTime = (iso: string) => new Date(iso).toLocaleString();

const statusLabel: Record<SubscriptionStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  canceled: 'Canceled',
};

const planLabel: Record<BillingPlan, string> = {
  starter: 'Starter',
  pro: 'Pro',
  studio: 'Studio',
};

const providerLabel: Record<ByokProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  other: 'Other',
};

export const WorkspacePage: React.FC<Props> = ({ user, api, onSignOut }) => {
  const workspaceId = useMemo(() => `ws_${user.id}`, [user.id]);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingProfile | null>(null);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [promptDraft, setPromptDraft] = useState('Create a high-energy launch cut with title intro, KPI scene, and final CTA bumper.');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const [subscriptionPlanDraft, setSubscriptionPlanDraft] = useState<BillingPlan>('pro');
  const [subscriptionStatusDraft, setSubscriptionStatusDraft] = useState<SubscriptionStatus>('active');
  const [paymentMethodAttachedDraft, setPaymentMethodAttachedDraft] = useState(true);
  const [autoTopUpEnabledDraft, setAutoTopUpEnabledDraft] = useState(true);
  const [autoTopUpThresholdDraft, setAutoTopUpThresholdDraft] = useState('150');
  const [autoTopUpAmountDraft, setAutoTopUpAmountDraft] = useState('600');
  const [byokProviderDraft, setByokProviderDraft] = useState<ByokProvider>('openai');
  const [byokKeyDraft, setByokKeyDraft] = useState('');

  const selectedProject = projects.find((project) => project.id === selectedId) ?? null;
  const promptCreditEstimate = useMemo(() => estimatePromptCreditCost(promptDraft), [promptDraft]);

  const hydrateBillingDrafts = (profile: BillingProfile) => {
    setBilling(profile);
    setSubscriptionPlanDraft(profile.plan);
    setSubscriptionStatusDraft(profile.subscriptionStatus);
    setPaymentMethodAttachedDraft(profile.paymentMethodAttached);
    setAutoTopUpEnabledDraft(profile.autoTopUpEnabled);
    setAutoTopUpThresholdDraft(String(profile.autoTopUpThreshold));
    setAutoTopUpAmountDraft(String(profile.autoTopUpAmount));
    setByokProviderDraft(profile.byokProvider ?? 'openai');
  };

  useEffect(() => {
    const load = async () => {
      setLoadingWorkspace(true);
      setActionError(null);
      try {
        const [list, billingProfile] = await Promise.all([
          api.listProjects(workspaceId),
          api.getBillingProfile(workspaceId),
        ]);
        setProjects(list);
        setSelectedId((current) => current ?? list[0]?.id ?? null);
        hydrateBillingDrafts(billingProfile);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load workspace';
        setActionError(message);
      } finally {
        setLoadingWorkspace(false);
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
    setActionError(null);
    try {
      const created = await api.createProject({
        workspaceId,
        name: newProjectName.trim(),
        description: newProjectDescription.trim(),
      });
      updateProject(created);
      setNewProjectName('');
      setNewProjectDescription('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create project';
      setActionError(message);
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
    setActionError(null);
    try {
      const response = await api.sendPrompt({
        projectId: selectedProject.id,
        prompt: promptDraft.trim(),
      });
      updateProject(response.project);
      hydrateBillingDrafts(response.billing);
      setPromptDraft('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to run prompt';
      setActionError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleTokenMode = async (mode: Project['tokenMode']) => {
    if (!selectedProject) {
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      const updated = await api.updateTokenMode(selectedProject.id, mode);
      updateProject(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update token mode';
      setActionError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleSubscriptionSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setActionError(null);
    try {
      const updated = await api.updateBillingProfile({
        workspaceId,
        plan: subscriptionPlanDraft,
        subscriptionStatus: subscriptionStatusDraft,
        paymentMethodAttached: paymentMethodAttachedDraft,
      });
      hydrateBillingDrafts(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update subscription settings';
      setActionError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleAutoTopUpSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const threshold = Number.parseInt(autoTopUpThresholdDraft, 10);
    const amount = Number.parseInt(autoTopUpAmountDraft, 10);
    if (!Number.isFinite(threshold) || !Number.isFinite(amount) || threshold < 1 || amount < 1) {
      setActionError('Auto top-up threshold and amount must be at least 1 credit.');
      return;
    }

    setBusy(true);
    setActionError(null);
    try {
      const updated = await api.updateBillingProfile({
        workspaceId,
        autoTopUpEnabled: autoTopUpEnabledDraft,
        autoTopUpThreshold: threshold,
        autoTopUpAmount: amount,
      });
      hydrateBillingDrafts(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update auto top-up settings';
      setActionError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleConnectByok = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!byokKeyDraft.trim()) {
      return;
    }

    setBusy(true);
    setActionError(null);
    try {
      const updated = await api.connectByok({
        workspaceId,
        provider: byokProviderDraft,
        apiKey: byokKeyDraft.trim(),
      });
      hydrateBillingDrafts(updated);
      setByokKeyDraft('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect BYOK key';
      setActionError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnectByok = async () => {
    setBusy(true);
    setActionError(null);
    try {
      const updated = await api.disconnectByok(workspaceId);
      hydrateBillingDrafts(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to disconnect BYOK key';
      setActionError(message);
    } finally {
      setBusy(false);
    }
  };

  const byokSelectedButNotConnected = selectedProject?.tokenMode === 'bring-your-own-key' && !billing?.byokConnected;

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

          {loadingWorkspace ? (
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
            <p className="composer-note">
              {selectedProject?.tokenMode === 'platform-managed'
                ? `Estimated cost: ${promptCreditEstimate} credits`
                : 'BYOK mode: prompt uses user-provided provider tokens'}
            </p>
            <button disabled={busy || !selectedProject || !promptDraft.trim() || byokSelectedButNotConnected} type="submit">
              Send Prompt
            </button>
          </form>
          {actionError ? <p className="form-error">{actionError}</p> : null}
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

          <div className="runtime-grid">
            <div className="runtime-card">
              <h3>Token Mode</h3>
              <p>Choose if this project uses your platform subscription credits or user-provided API keys.</p>

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

            <div className="runtime-card billing-card">
              <div className="panel-title-row">
                <h3>Billing + Subscription</h3>
                <span className={`status-chip ${billing?.subscriptionStatus ?? 'paused'}`}>
                  {billing ? statusLabel[billing.subscriptionStatus] : 'Loading'}
                </span>
              </div>

              {billing ? (
                <>
                  <p className="credit-balance">{billing.creditBalance.toLocaleString()} credits available</p>
                  <p className="runtime-note">
                    Plan {planLabel[billing.plan]} {billing.paymentMethodAttached ? 'with' : 'without'} payment method on file.
                  </p>

                  <form className="billing-form" onSubmit={handleSubscriptionSave}>
                    <label>
                      Plan
                      <select
                        value={subscriptionPlanDraft}
                        onChange={(event) => setSubscriptionPlanDraft(event.target.value as BillingPlan)}
                        disabled={busy}
                      >
                        <option value="starter">Starter</option>
                        <option value="pro">Pro</option>
                        <option value="studio">Studio</option>
                      </select>
                    </label>
                    <label>
                      Subscription status
                      <select
                        value={subscriptionStatusDraft}
                        onChange={(event) => setSubscriptionStatusDraft(event.target.value as SubscriptionStatus)}
                        disabled={busy}
                      >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="canceled">Canceled</option>
                      </select>
                    </label>
                    <label className="inline-checkbox">
                      <input
                        type="checkbox"
                        checked={paymentMethodAttachedDraft}
                        onChange={(event) => setPaymentMethodAttachedDraft(event.target.checked)}
                        disabled={busy}
                      />
                      Payment method on file
                    </label>
                    <button type="submit" disabled={busy}>
                      Save subscription
                    </button>
                  </form>

                  <form className="billing-form" onSubmit={handleAutoTopUpSave}>
                    <label className="inline-checkbox">
                      <input
                        type="checkbox"
                        checked={autoTopUpEnabledDraft}
                        onChange={(event) => setAutoTopUpEnabledDraft(event.target.checked)}
                        disabled={busy}
                      />
                      Auto-purchase credits when low
                    </label>
                    <label>
                      Auto top-up threshold (credits)
                      <input
                        type="number"
                        min={1}
                        value={autoTopUpThresholdDraft}
                        onChange={(event) => setAutoTopUpThresholdDraft(event.target.value)}
                        disabled={busy}
                      />
                    </label>
                    <label>
                      Auto top-up amount (credits)
                      <input
                        type="number"
                        min={1}
                        value={autoTopUpAmountDraft}
                        onChange={(event) => setAutoTopUpAmountDraft(event.target.value)}
                        disabled={busy}
                      />
                    </label>
                    <button type="submit" disabled={busy}>
                      Save auto top-up
                    </button>
                    {billing.lastAutoTopUpAt ? (
                      <p className="runtime-note">Last auto top-up: {toDateTime(billing.lastAutoTopUpAt)}</p>
                    ) : null}
                  </form>

                  <form className="billing-form" onSubmit={handleConnectByok}>
                    <label>
                      BYOK provider
                      <select
                        value={byokProviderDraft}
                        onChange={(event) => setByokProviderDraft(event.target.value as ByokProvider)}
                        disabled={busy}
                      >
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="other">Other</option>
                      </select>
                    </label>
                    <label>
                      API key
                      <input
                        type="password"
                        value={byokKeyDraft}
                        onChange={(event) => setByokKeyDraft(event.target.value)}
                        placeholder={billing.byokMaskedKey ? `Connected: ${billing.byokMaskedKey}` : 'Paste provider key'}
                        disabled={busy}
                      />
                    </label>
                    <div className="row-actions">
                      <button type="submit" disabled={busy || !byokKeyDraft.trim()}>
                        Connect BYOK
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={handleDisconnectByok}
                        disabled={busy || !billing.byokConnected}
                      >
                        Disconnect
                      </button>
                    </div>
                    <p className="runtime-note">
                      BYOK status: {billing.byokConnected ? `Connected (${providerLabel[billing.byokProvider ?? 'other']})` : 'Not connected'}
                    </p>
                  </form>
                </>
              ) : (
                <p className="empty-state">Loading billing profile...</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
