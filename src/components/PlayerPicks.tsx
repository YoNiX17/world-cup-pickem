import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { UserPredictions, GroupPrediction } from '../services/firestore';
import { Users, ChevronDown, ChevronUp, ShieldCheck, Clock } from 'lucide-react';

interface PlayerData {
  uid: string;
  displayName: string;
  photoURL: string;
  predictions: UserPredictions | null;
}

// We need team name mapping — we'll receive it from the parent
interface TeamInfo {
  id: number;
  name: string;
  crest: string;
  tla: string;
}

interface Props {
  teamMap: Record<number, TeamInfo>; // teamId -> team info
}

export const PlayerPicks: React.FC<Props> = ({ teamMap }) => {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        // Load all users
        const usersSnap = await getDocs(collection(db, 'pickem_users'));
        const users = usersSnap.docs.map(d => d.data());

        // Load all predictions
        const predsSnap = await getDocs(collection(db, 'pickem_predictions'));
        const predsMap: Record<string, UserPredictions> = {};
        predsSnap.docs.forEach(d => {
          const data = d.data() as UserPredictions;
          predsMap[data.uid] = data;
        });

        const playerList: PlayerData[] = users.map(u => ({
          uid: u.uid,
          displayName: u.displayName || 'Anonyme',
          photoURL: u.photoURL,
          predictions: predsMap[u.uid] || null,
        }));

        // Sort: validated first, then by name
        playerList.sort((a, b) => {
          const aVal = a.predictions?.validated ? 1 : 0;
          const bVal = b.predictions?.validated ? 1 : 0;
          if (bVal !== aVal) return bVal - aVal;
          return a.displayName.localeCompare(b.displayName);
        });

        setPlayers(playerList);
      } catch (err) {
        console.error('Error loading players:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPlayers();
  }, []);

  const toggleExpand = (uid: string) => {
    setExpandedPlayer(prev => prev === uid ? null : uid);
  };

  const renderGroupPrediction = (groups: GroupPrediction) => {
    const groupNames = Object.keys(groups).sort();
    return (
      <div className="player-picks-groups">
        {groupNames.map(groupName => {
          const teamIds = groups[groupName];
          const prettyName = groupName.replace('GROUP_', 'Gr. ').replace('_', ' ');
          return (
            <div key={groupName} className="player-picks-group-card">
              <div className="player-picks-group-title">{prettyName}</div>
              {teamIds.map((teamId, idx) => {
                const team = teamMap[teamId];
                return (
                  <div key={teamId} className="player-picks-team-row">
                    <span className={`position-badge-sm position-${idx + 1}`}>{idx + 1}</span>
                    {team?.crest && <img src={team.crest} alt="" className="player-picks-crest" />}
                    <span className="player-picks-team-name">{team?.tla || team?.name || `#${teamId}`}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading animate-fade-in-up">
        <div className="loading-spinner"></div>
        <span>Chargement des joueurs...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="info-banner">
        <Users size={18} />
        <span>Consultez les pronostics des autres joueurs. Seuls les joueurs ayant <strong>validé</strong> leurs pronos sont visibles en détail.</span>
      </div>

      {players.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <p>Aucun joueur inscrit pour le moment.</p>
        </div>
      ) : (
        <div className="players-list">
          {players.map((player, index) => {
            const isExpanded = expandedPlayer === player.uid;
            const isValidated = player.predictions?.validated;
            const groupCount = player.predictions?.groups ? Object.keys(player.predictions.groups).length : 0;
            const matchCount = player.predictions?.matches ? Object.values(player.predictions.matches).filter(Boolean).length : 0;

            return (
              <div
                key={player.uid}
                className={`player-card animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div className="player-card-header" onClick={() => isValidated && toggleExpand(player.uid)}>
                  <div className="player-card-info">
                    <img
                      src={player.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.displayName)}&background=1e293b&color=f8fafc&bold=true&size=36`}
                      alt="" className="player-card-avatar"
                    />
                    <div>
                      <span className="player-card-name">{player.displayName}</span>
                      <div className="player-card-stats">
                        {groupCount > 0 && <span>{groupCount} groupes</span>}
                        {matchCount > 0 && <span>{matchCount} matchs</span>}
                      </div>
                    </div>
                  </div>
                  <div className="player-card-actions">
                    {isValidated ? (
                      <>
                        <span className="player-validated-badge"><ShieldCheck size={12} /> Validé</span>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </>
                    ) : (
                      <span className="player-pending-badge"><Clock size={12} /> En cours</span>
                    )}
                  </div>
                </div>

                {isExpanded && isValidated && player.predictions?.groups && (
                  <div className="player-card-body">
                    {renderGroupPrediction(player.predictions.groups)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
