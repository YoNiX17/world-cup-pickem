import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../services/firestore';
import type { LeaderboardEntry } from '../services/firestore';
import { Crown, Medal, Award, Trophy, TrendingUp } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getLeaderboard();
        setEntries(data);
      } catch (err) {
        console.error('Leaderboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="loading animate-fade-in-up">
        <div className="loading-spinner"></div>
        <span>Chargement du classement...</span>
      </div>
    );
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown size={18} color="#f59e0b" />;
    if (index === 1) return <Medal size={18} color="#94a3b8" />;
    if (index === 2) return <Award size={18} color="#cd7f32" />;
    return null;
  };

  const getRankBadgeClass = (index: number) => {
    if (index === 0) return 'rank-gold';
    if (index === 1) return 'rank-silver';
    if (index === 2) return 'rank-bronze';
    return '';
  };

  return (
    <div className="animate-fade-in-up">
      <div className="info-banner">
        <TrendingUp size={18} />
        <span>Le classement se met à jour en temps réel quand les résultats tombent. <strong>3 pts</strong> par bon pronostic match, jusqu'à <strong>5 pts</strong> par position de groupe exacte.</span>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <Trophy size={48} />
          <p>Aucun joueur n'a encore de points. Faites vos pronostics !</p>
        </div>
      ) : (
        <div className="leaderboard-container">
          {/* Top 3 podium */}
          {entries.length >= 3 && (
            <div className="podium animate-fade-in-up">
              {[1, 0, 2].map((podiumIndex) => {
                const entry = entries[podiumIndex];
                if (!entry) return null;
                return (
                  <div key={entry.uid} className={`podium-card podium-${podiumIndex + 1}`}>
                    <div className="podium-rank">{getRankIcon(podiumIndex)}</div>
                    <img
                      src={entry.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.displayName)}&background=1e293b&color=f8fafc&bold=true`}
                      alt={entry.displayName}
                      className="podium-avatar"
                    />
                    <span className="podium-name">{entry.displayName}</span>
                    <span className="podium-points">{entry.totalPoints} pts</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full list */}
          <div className="leaderboard-list glass-panel" style={{ padding: 0, overflow: 'hidden', marginTop: '1.5rem' }}>
            <div className="leaderboard-header-row">
              <span>#</span>
              <span>Joueur</span>
              <span>Groupes</span>
              <span>Matchs</span>
              <span>Total</span>
            </div>
            {entries.map((entry, index) => (
              <div
                key={entry.uid}
                className={`leaderboard-row ${getRankBadgeClass(index)} animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <span className="leaderboard-rank">{index + 1}</span>
                <div className="leaderboard-player">
                  <img
                    src={entry.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.displayName)}&background=1e293b&color=f8fafc&bold=true&size=32`}
                    alt={entry.displayName}
                    className="leaderboard-avatar"
                  />
                  <span>{entry.displayName}</span>
                </div>
                <span className="leaderboard-stat">{entry.groupPoints}</span>
                <span className="leaderboard-stat">{entry.matchPoints}</span>
                <span className="leaderboard-total">{entry.totalPoints}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
