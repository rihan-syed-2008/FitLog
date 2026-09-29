import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Compass, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-green)',
          marginBottom: '24px'
        }}
      >
        <Compass size={36} />
      </div>

      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '8px' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>
        Off Track! Page Not Found
      </h2>
      <p style={{ color: 'var(--text-dim)', maxWidth: '420px', marginBottom: '28px', lineHeight: 1.5 }}>
        The route you are looking for doesn't exist or has moved. Let's get you back on course.
      </p>

      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <Button variant="primary">
          <ArrowLeft size={16} /> Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
