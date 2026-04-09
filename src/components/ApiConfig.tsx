import React, { useState } from 'react';
import { KeyRound, ArrowRight, Globe, ExternalLink } from 'lucide-react';
import { setApiKey } from '../services/api';

interface Props {
  onValidate: () => void;
}

export const ApiConfig: React.FC<Props> = ({ onValidate }) => {
  const [key, setKey] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      setApiKey(key.trim());
      onValidate();
    }
  };

  return (
    <div style={{ maxWidth: 460, width: '100%', margin: '0 auto' }}>
      <div className="glass-panel animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <KeyRound size={18} color="var(--primary)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Clé football-data.org</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Pour récupérer les matchs et classements en temps réel, vous avez besoin d'une clé football-data.org gratuite (10 requêtes/min).
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="input"
              placeholder="Collez votre clé football-data.org..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              required
              autoComplete="off"
              style={{ paddingLeft: '2.75rem' }}
            />
            <Globe 
              size={16} 
              style={{ 
                position: 'absolute', left: '1rem', top: '50%', 
                transform: 'translateY(-50%)',
                color: isFocused ? 'var(--primary)' : 'var(--text-dim)',
                transition: 'color 250ms ease'
              }} 
            />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', padding: '0.8rem' }}>
            Continuer <ArrowRight size={16} />
          </button>
        </form>

        <a
          href="https://www.football-data.org/client/register"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            marginTop: '1rem',
            fontSize: '0.75rem',
            color: 'var(--primary)',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Créer un compte gratuit <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};
