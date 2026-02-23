import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LoginInput } from '../types/platform';

type Props = {
  onLogin: (credentials: LoginInput) => Promise<void>;
  loading: boolean;
  error: string | null;
};

export const LoginPage: React.FC<Props> = ({ onLogin, loading, error }) => {
  const [email, setEmail] = useState('creator@studio.ai');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      return;
    }
    await onLogin({ email: email.trim(), password });
  };

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <h1>Sign in to MotionForge AI</h1>
        <p>Use this scaffold auth now. Replace with Azure AD B2C or your identity provider in production.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" disabled={loading || !email || !password}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="muted-link">
          Return to <Link to="/">homepage</Link>
        </p>
      </section>
    </div>
  );
};
