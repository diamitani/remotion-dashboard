import { Link } from 'react-router-dom';

type Props = {
  isAuthenticated: boolean;
};

export const LandingPage: React.FC<Props> = ({ isAuthenticated }) => {
  return (
    <div className="landing-shell">
      <header className="landing-nav">
        <p className="logo">MotionForge AI</p>
        <nav>
          <a href="#product">Product</a>
          <a href="#pricing">Pricing</a>
          <a href="#architecture">Architecture</a>
        </nav>
        <Link className="cta" to={isAuthenticated ? '/app' : '/login'}>
          {isAuthenticated ? 'Open Workspace' : 'Start Free'}
        </Link>
      </header>

      <main className="landing-main">
        <section className="hero" id="product">
          <p className="kicker">Video AI SaaS Scaffold</p>
          <h1>Prompt-to-Remotion editing for teams, agencies, and creator workflows.</h1>
          <p>
            This scaffold ships landing pages, auth gates, project workspaces, and a multi-tenant chat editor with a live Remotion preview panel.
          </p>
          <div className="hero-actions">
            <Link className="cta" to={isAuthenticated ? '/app' : '/login'}>
              {isAuthenticated ? 'Go to Projects' : 'Create Account'}
            </Link>
            <a className="ghost" href="#architecture">
              See platform model
            </a>
          </div>
        </section>

        <section className="card-grid" id="pricing">
          <article className="feature-card">
            <h2>Workspace isolation</h2>
            <p>Each user/project maps to isolated OpenCode workspace execution and revision history.</p>
          </article>
          <article className="feature-card">
            <h2>Shared Remotion runtime</h2>
            <p>Templates + libraries are pre-installed once in your worker image, then reused per job.</p>
          </article>
          <article className="feature-card">
            <h2>Token policies</h2>
            <p>Support platform-managed billing or bring-your-own-key, per project or subscription tier.</p>
          </article>
        </section>

        <section className="architecture" id="architecture">
          <h2>How it runs as SaaS</h2>
          <p>Frontend routes requests to your API gateway. Gateway dispatches prompt jobs to OpenCode workers that patch Remotion code and trigger renders.</p>
          <p>Users never access your worker host directly; they work through authenticated APIs and scoped project IDs.</p>
        </section>
      </main>
    </div>
  );
};
