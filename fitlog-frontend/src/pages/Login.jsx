import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import { getErrorMessage } from '../utils/errors';

function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchParams] = useSearchParams();
  const oauthToken = searchParams.get('token');
  const oauthError = searchParams.get('error');

  const { login, handleOAuthSuccess } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (oauthToken) {
      setLoading(true);
      handleOAuthSuccess(oauthToken)
        .then(() => {
          toast.success('Successfully signed in with Google!');
          navigate('/dashboard', { replace: true });
        })
        .catch((err) => {
          const msg = getErrorMessage(err);
          setError(msg);
          toast.error('Google sign-in error: ' + msg);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (oauthError) {
      setError(oauthError);
      toast.error(oauthError);
    }
  }, [oauthToken, oauthError]);

  const handleGoogleLogin = () => {
    // Redirect to backend OAuth2 Google authorization endpoint
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in">
        {/* Brand mark */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="auth-brand-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your training log</p>
        </div>

        {error && (
          <div className="error-banner" style={{ marginBottom: 20 }} role="alert">
            {error}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="btn btn-secondary w-full"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '11px 16px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          disabled={loading}
          aria-label="Continue with Google"
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, backgroundColor: 'var(--rule)' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            or with email
          </span>
          <div style={{ flex: 1, height: 1, backgroundColor: 'var(--rule)' }} />
        </div>

        {/* Existing Email / Password Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
          <Field
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
            disabled={loading}
          />
          <Field
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            required
            disabled={loading}
          />

          <Button type="submit" variant="primary" loading={loading} style={{ width: '100%', marginTop: 6 }}>
            Sign In
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 22, fontSize: '0.875rem', color: 'var(--ink-soft)' }}>
          No account?{' '}
          <Link to="/register" className="auth-link">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
