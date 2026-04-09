import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh' }}>
      <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
        {/* Hero */}
        <div className="animate-fade-in-up">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(168, 85, 247, 0.2))',
            borderRadius: '20px',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 4px 32px rgba(245, 158, 11, 0.15)'
          }}>
            <Trophy size={40} color="#f59e0b" />
          </div>
          <h1 className="text-gradient" style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
            World Cup Pick'em
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 320, margin: '0 auto 2.5rem' }}>
            Classez les équipes, pronostiquez les matchs et grimpez dans le classement mondial.
          </p>
        </div>

        {/* Login card */}
        <div className="glass-panel animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Rejoindre le Pick'em
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Connectez-vous pour sauvegarder vos pronostics et apparaître dans le classement.
          </p>

          <button
            onClick={signInWithGoogle}
            className="btn"
            style={{
              width: '100%',
              padding: '0.85rem',
              background: 'white',
              color: '#1f2937',
              fontWeight: 700,
              gap: '0.75rem',
              fontSize: '0.95rem',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>
        </div>

        <p className="animate-fade-in-up" style={{ animationDelay: '0.2s', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          En vous connectant, vous acceptez de participer au Pick'em. Vos données sont sécurisées par Firebase.
        </p>
      </div>
    </div>
  );
};
