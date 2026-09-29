import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';

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
        className="activity-icon activity-icon-track"
        style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', marginBottom: 24 }}
        aria-hidden="true"
      >
        <MapPin size={30} />
      </div>

      <h1
        className="num"
        style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1, marginBottom: 8 }}
      >
        404
      </h1>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>
        Off track — page not found
      </h2>
      <p style={{ color: 'var(--ink-soft)', maxWidth: 400, lineHeight: 1.55, marginBottom: 28, fontSize: '0.925rem' }}>
        The route you are looking for doesn't exist or has moved. Let's get you back on course.
      </p>

      <Link to="/dashboard" className="btn btn-primary">
        <ArrowLeft size={16} aria-hidden="true" /> Return to Dashboard
      </Link>
    </div>
  );
}
