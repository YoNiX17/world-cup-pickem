import React, { useEffect, useState } from 'react';
import { fetchMatches, fetchStandings } from '../services/api';
import { MatchCard } from './MatchCard';
import type { MatchData } from './MatchCard';
import { Trophy, ListOrdered, CalendarDays, Zap, BarChart3, Save, LogOut, Check, ShieldCheck, ShieldAlert, Lock, Users } from 'lucide-react';
import { GroupRankingBoard } from './GroupRankingBoard';
import { Leaderboard } from './Leaderboard';
import { PlayerPicks } from './PlayerPicks';
import { useAuth } from '../contexts/AuthContext';
import { savePredictions, loadPredictions, validatePredictions, unvalidatePredictions } from '../services/firestore';
import type { GroupPrediction, MatchPrediction } from '../services/firestore';

interface TeamInfo {
  id: number;
  name: string;
  crest: string;
  tla: string;
}

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchPicks, setMatchPicks] = useState<Record<number, string | null>>({});
  const [groupPicks, setGroupPicks] = useState<GroupPrediction>({});
  const [competition] = useState('WC');
  const [view, setView] = useState<'groups' | 'matches' | 'leaderboard' | 'players'>('groups');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [validated, setValidated] = useState(false);
  const [validating, setValidating] = useState(false);
  const [locked, setLocked] = useState(false);
  const [teamMap, setTeamMap] = useState<Record<number, TeamInfo>>({});

  // Load team map from standings for player picks display
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const data = await fetchStandings('WC');
        if (data) {
          const map: Record<number, TeamInfo> = {};
          data.forEach((g: any) => {
            if (g.type === 'TOTAL' && g.table) {
              g.table.forEach((row: any) => {
                if (row.team) {
                  map[row.team.id] = {
                    id: row.team.id,
                    name: row.team.name,
                    crest: row.team.crest,
                    tla: row.team.tla,
                  };
                }
              });
            }
          });
          setTeamMap(map);
        }
      } catch (e) {
        // Silently fail
      }
    };
    loadTeams();
  }, []);

  // Check if first match has started
  useEffect(() => {
    const checkLock = async () => {
      try {
        const allMatches = await fetchMatches('WC');
        if (allMatches && allMatches.length > 0) {
          const firstMatch = allMatches.reduce((a: MatchData, b: MatchData) =>
            new Date(a.utcDate) < new Date(b.utcDate) ? a : b
          );
          if (new Date() >= new Date(firstMatch.utcDate)) {
            setLocked(true);
          }
        }
      } catch (e) {}
    };
    checkLock();
  }, []);

  // Load user predictions
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const data = await loadPredictions(user.uid);
      if (data) {
        setGroupPicks(data.groups || {});
        const mp: Record<number, string | null> = {};
        if (data.matches) {
          Object.entries(data.matches).forEach(([k, v]) => { mp[Number(k)] = v; });
        }
        setMatchPicks(mp);
        setValidated(data.validated || false);
      }
    };
    load();
  }, [user]);

  const loadMatchesData = async () => {
    if (view !== 'matches') return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMatches(competition);
      setMatches(data || []);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatchesData();
  }, [competition, view]);

  const canEdit = !locked && !validated;

  const handleMatchPick = (matchId: number, pick: string) => {
    if (!canEdit) return;
    setMatchPicks((prev) => ({
      ...prev,
      [matchId]: prev[matchId] === pick ? null : pick
    }));
    setSaved(false);
  };

  const handleGroupPredictionUpdate = (groups: GroupPrediction) => {
    if (!canEdit) return;
    setGroupPicks(groups);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!user || !canEdit) return;
    setSaving(true);
    try {
      const mp: MatchPrediction = {};
      Object.entries(matchPicks).forEach(([k, v]) => { if (v) mp[k] = v; });
      await savePredictions(user.uid, groupPicks, mp);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async () => {
    if (!user) return;
    setValidating(true);
    try {
      const mp: MatchPrediction = {};
      Object.entries(matchPicks).forEach(([k, v]) => { if (v) mp[k] = v; });
      await savePredictions(user.uid, groupPicks, mp);
      await validatePredictions(user.uid);
      setValidated(true);
    } catch (err) {
      console.error('Validate error:', err);
    } finally {
      setValidating(false);
    }
  };

  const handleUnvalidate = async () => {
    if (!user || locked) return;
    setValidating(true);
    try {
      await unvalidatePredictions(user.uid);
      setValidated(false);
    } catch (err) {
      console.error('Unvalidate error:', err);
    } finally {
      setValidating(false);
    }
  };

  const groupMatches = (matches: MatchData[]) => {
    const grouped: Record<string, MatchData[]> = {};
    matches.forEach((m) => {
      const g = m.group || m.stage || 'Autre';
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(m);
    });
    return grouped;
  };

  const grouped = groupMatches(matches);
  const picksCount = Object.values(matchPicks).filter(Boolean).length + Object.keys(groupPicks).length;

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="header">
        <div>
          <h1 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Trophy size={32} /> World Cup Pick'em
          </h1>
          <p className="header-subtitle">
            {user && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=1e293b&color=f8fafc&bold=true&size=24`}
                  alt="" style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--border)' }}
                />
                {user.displayName}
              </span>
            )}
            {picksCount > 0 && (
              <span className="picks-counter">
                <Zap size={10} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                {picksCount} pronostic{picksCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        <div className="header-controls">
          <div className="tab-switcher">
            <button onClick={() => setView('groups')} className={`tab-btn ${view === 'groups' ? 'active' : ''}`}>
              <ListOrdered size={15} /> Groupes
            </button>
            <button onClick={() => setView('matches')} className={`tab-btn ${view === 'matches' ? 'active' : ''}`}>
              <CalendarDays size={15} /> Matchs
            </button>
            <button onClick={() => setView('players')} className={`tab-btn ${view === 'players' ? 'active' : ''}`}>
              <Users size={15} /> Joueurs
            </button>
            <button onClick={() => setView('leaderboard')} className={`tab-btn ${view === 'leaderboard' ? 'active' : ''}`}>
              <BarChart3 size={15} /> Classement
            </button>
          </div>

          {(view === 'groups' || view === 'matches') && !locked && (
            <>
              {!validated ? (
                <>
                  <button className="btn btn-save" onClick={handleSave} disabled={saving}>
                    {saved ? <><Check size={15} /> Sauvé !</> : saving ? 'Sauvegarde...' : <><Save size={15} /> Sauver</>}
                  </button>
                  <button className="btn btn-validate" onClick={handleValidate} disabled={validating}>
                    {validating ? 'Validation...' : <><ShieldCheck size={15} /> Valider</>}
                  </button>
                </>
              ) : (
                <button className="btn btn-unvalidate" onClick={handleUnvalidate} disabled={validating}>
                  <ShieldAlert size={15} /> Modifier
                </button>
              )}
            </>
          )}

          <button className="icon-btn" onClick={logout} title="Se déconnecter">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Status banners */}
      {locked && (view === 'groups' || view === 'matches') && (
        <div className="locked-banner">
          <Lock size={16} />
          <span>La compétition a commencé. Les pronostics sont verrouillés.</span>
        </div>
      )}

      {validated && !locked && (view === 'groups' || view === 'matches') && (
        <div className="validated-banner">
          <ShieldCheck size={16} />
          <span>Vos pronostics sont <strong>validés</strong>. Cliquez "Modifier" pour les changer avant le premier match.</span>
        </div>
      )}

      {/* Content */}
      {view === 'leaderboard' ? (
        <Leaderboard />
      ) : view === 'players' ? (
        <PlayerPicks teamMap={teamMap} />
      ) : view === 'groups' ? (
        <GroupRankingBoard
          competition={competition}
          onPredictionUpdate={handleGroupPredictionUpdate}
          initialPredictions={groupPicks}
          disabled={!canEdit}
        />
      ) : (
        <div>
          {error ? (
            <div className="error-message"><strong>Erreur :</strong> {error}</div>
          ) : loading ? (
            <div className="loading animate-fade-in-up">
              <div className="loading-spinner"></div>
              <span>Chargement des matchs...</span>
            </div>
          ) : matches.length === 0 ? (
            <div className="empty-state animate-fade-in-up">
              <CalendarDays size={48} />
              <p>Aucun match trouvé pour cette compétition.</p>
            </div>
          ) : (
            <div>
              {Object.entries(grouped).map(([groupName, groupMatches], index) => (
                <div key={groupName} style={{ marginBottom: '2.5rem' }} className={`animate-fade-in-up animate-delay-${(index % 4) + 1}`}>
                  <div className="section-heading">
                    <h2>{groupName.replace(/_/g, ' ')}</h2>
                    <span className="section-heading-badge">{groupMatches.length} matchs</span>
                  </div>
                  <div className="matches-grid">
                    {groupMatches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        pick={matchPicks[match.id] || null}
                        onPick={handleMatchPick}
                        disabled={!canEdit}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
