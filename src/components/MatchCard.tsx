import React from 'react';
import { Lock, MapPin } from 'lucide-react';
import type { MatchData } from '../services/api';

// Re-export for backward compatibility
export type { MatchData } from '../services/api';

interface Props {
  match: MatchData;
  pick: string | null;
  onPick: (matchId: number, pick: string) => void;
  disabled?: boolean;
}

export const MatchCard: React.FC<Props> = ({ match, pick, onPick, disabled }) => {
  const isFinished = match.status === 'FINISHED';
  const isTimed = match.status === 'TIMED';
  const isLive = match.status === 'IN_PLAY';

  const dateObj = new Date(match.utcDate);
  const timeStr = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = dateObj.toLocaleDateString('fr-FR', { weekday: 'short', month: 'short', day: 'numeric' });

  const homeScore = match.score?.fullTime?.home ?? '-';
  const awayScore = match.score?.fullTime?.away ?? '-';
  const htHome = match.score?.halfTime?.home;
  const htAway = match.score?.halfTime?.away;
  const hasHalfTime = htHome !== null && htHome !== undefined && htAway !== null && htAway !== undefined;

  const statusClass = isLive ? 'live' : match.status?.toLowerCase() || '';

  return (
    <div className={`match-card ${disabled ? 'match-card-locked' : ''}`} id={`match-${match.id}`}>
      {/* Header row */}
      <div className="match-card-header">
        <span className={`match-status ${statusClass}`}>
          {isLive && (
            <>
              <span className="live-dot"></span>
              {match.elapsed ? `${match.elapsed}'` : 'EN DIRECT'}
            </>
          )}
          {isFinished && 'Terminé'}
          {isTimed && `${dateStr} · ${timeStr}`}
          {!isFinished && !isTimed && !isLive && (match.statusShort || match.status)}
        </span>
        <span className="match-group-label">
          {match.round || match.group?.replace(/_/g, ' ') || match.stage?.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Teams */}
      <div className="match-teams">
        <div className="team">
          {match.homeTeam?.crest ? (
            <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="team-crest" loading="lazy" />
          ) : <div className="team-crest-placeholder"></div>}
          <span className="team-label">{match.homeTeam?.name || 'TBD'}</span>
        </div>
        
        <div className="vs-separator">
          {isFinished || isLive ? (
            <>
              <span className="vs-score">{homeScore} — {awayScore}</span>
              {hasHalfTime && isFinished && (
                <span className="vs-halftime">MT: {htHome} - {htAway}</span>
              )}
            </>
          ) : (
            <span className="vs-text">VS</span>
          )}
        </div>

        <div className="team">
          {match.awayTeam?.crest ? (
            <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="team-crest" loading="lazy" />
          ) : <div className="team-crest-placeholder"></div>}
          <span className="team-label">{match.awayTeam?.name || 'TBD'}</span>
        </div>
      </div>

      {/* Match info (venue, referee) */}
      {(match.venue || match.referee) && (
        <div className="match-info-row">
          {match.venue && (
            <span className="match-info-item">
              <MapPin size={11} />
              {match.venue}{match.city ? `, ${match.city}` : ''}
            </span>
          )}
          {match.referee && (
            <span className="match-info-item">
              Arbitre: {match.referee}
            </span>
          )}
        </div>
      )}

      {/* Pick'em buttons */}
      {!isFinished && !isLive && (
        <div className={`picks ${disabled ? 'picks-disabled' : ''}`}>
          {disabled && <Lock size={12} className="picks-lock-icon" />}
          <button 
            className={`pick-btn ${pick === 'HOME' ? 'selected' : ''}`}
            onClick={() => !disabled && onPick(match.id, 'HOME')}
            disabled={disabled}
          >
            1
          </button>
          <button 
            className={`pick-btn ${pick === 'DRAW' ? 'selected' : ''}`}
            onClick={() => !disabled && onPick(match.id, 'DRAW')}
            disabled={disabled}
          >
            N
          </button>
          <button 
            className={`pick-btn ${pick === 'AWAY' ? 'selected' : ''}`}
            onClick={() => !disabled && onPick(match.id, 'AWAY')}
            disabled={disabled}
          >
            2
          </button>
        </div>
      )}
    </div>
  );
};
