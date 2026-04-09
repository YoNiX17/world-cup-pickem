import axios from 'axios';

// ══════════════════════════════════════════════
// football-data.org v4 — https://www.football-data.org
// Free tier: 10 req/min
// ══════════════════════════════════════════════

const isProd = import.meta.env.PROD;

const api = axios.create({
  baseURL: isProd ? 'https://api.football-data.org/v4/' : '/api/v4/',
});

api.interceptors.request.use((config) => {
  const key = localStorage.getItem('FOOTBALL_DATA_KEY') || '';
  config.headers['X-Auth-Token'] = key;
  return config;
});

// ══════════════════════════════════════════════
// Competition codes (football-data.org uses string codes)
// ══════════════════════════════════════════════

const COMPETITION_CODES: Record<string, string> = {
  'WC': 'WC',     // FIFA World Cup
  'EC': 'EC',     // European Championship
  'CL': 'CL',     // Champions League
  'PL': 'PL',     // Premier League
};

// ══════════════════════════════════════════════
// Matches
// ══════════════════════════════════════════════

export interface MatchData {
  id: number;
  utcDate: string;
  status: string;
  statusShort: string;
  elapsed: number | null;
  stage: string;
  group: string;
  venue: string;
  city: string;
  referee: string;
  round: string;
  homeTeam: { id: number; name: string; crest: string };
  awayTeam: { id: number; name: string; crest: string };
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
}

const STATUS_SHORT_MAP: Record<string, string> = {
  'SCHEDULED': 'NS',
  'TIMED': 'NS',
  'IN_PLAY': 'LIVE',
  'PAUSED': 'HT',
  'FINISHED': 'FT',
  'POSTPONED': 'PST',
  'CANCELLED': 'CANC',
  'SUSPENDED': 'SUSP',
};

const mapMatch = (m: any): MatchData => {
  const referees = m.referees || [];
  const mainRef = referees.find((r: any) => r.type === 'REFEREE') || referees[0];

  return {
    id: m.id,
    utcDate: m.utcDate,
    status: m.status,
    statusShort: STATUS_SHORT_MAP[m.status] || m.status,
    elapsed: m.minute ?? null,
    stage: m.stage || '',
    group: m.group || '',
    venue: m.venue || '',
    city: '',
    referee: mainRef?.name || '',
    round: m.matchday ? `Journée ${m.matchday}` : (m.stage?.replace(/_/g, ' ') || ''),
    homeTeam: {
      id: m.homeTeam?.id || 0,
      name: m.homeTeam?.name || 'TBD',
      crest: m.homeTeam?.crest || '',
    },
    awayTeam: {
      id: m.awayTeam?.id || 0,
      name: m.awayTeam?.name || 'TBD',
      crest: m.awayTeam?.crest || '',
    },
    score: {
      fullTime: {
        home: m.score?.fullTime?.home ?? null,
        away: m.score?.fullTime?.away ?? null,
      },
      halfTime: {
        home: m.score?.halfTime?.home ?? null,
        away: m.score?.halfTime?.away ?? null,
      },
    },
  };
};

export const fetchMatches = async (competitionCode: string = 'WC'): Promise<MatchData[]> => {
  const code = COMPETITION_CODES[competitionCode] || 'WC';
  try {
    const response = await api.get(`competitions/${code}/matches`);
    console.log('[API] fetchMatches response:', response.data);
    const matches = response.data.matches || [];
    return matches.map(mapMatch);
  } catch (error) {
    console.error('[API] fetchMatches error:', error);
    handleApiError(error, competitionCode);
    return [];
  }
};

// ══════════════════════════════════════════════
// Standings
// ══════════════════════════════════════════════

export interface StandingGroup {
  group: string;
  type: string;
  table: {
    position: number;
    team: { id: number; name: string; crest: string; tla: string };
    stats: {
      played: number;
      won: number;
      draw: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDifference: number;
      points: number;
      form: string;
    };
  }[];
}

export const fetchStandings = async (competitionCode: string = 'WC'): Promise<StandingGroup[]> => {
  const code = COMPETITION_CODES[competitionCode] || 'WC';
  try {
    const response = await api.get(`competitions/${code}/standings`);
    console.log('[API] fetchStandings response:', response.data);

    const standings = response.data.standings || [];

    return standings
      .filter((s: any) => s.type === 'TOTAL')
      .map((s: any) => ({
        group: s.group || s.stage || '',
        type: s.type,
        table: (s.table || []).map((row: any) => ({
          position: row.position,
          team: {
            id: row.team.id,
            name: row.team.name,
            crest: row.team.crest || '',
            tla: row.team.tla || row.team.name?.substring(0, 3).toUpperCase() || '',
          },
          stats: {
            played: row.playedGames || 0,
            won: row.won || 0,
            draw: row.draw || 0,
            lost: row.lost || 0,
            goalsFor: row.goalsFor || 0,
            goalsAgainst: row.goalsAgainst || 0,
            goalDifference: row.goalDifference || 0,
            points: row.points || 0,
            form: row.form || '',
          },
        })),
      }));
  } catch (error) {
    console.error('[API] fetchStandings error:', error);
    handleApiError(error, competitionCode);
    return [];
  }
};

// ══════════════════════════════════════════════
// Error handling
// ══════════════════════════════════════════════

const handleApiError = (error: any, competitionCode: string) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || '';
    if (status === 403) {
      throw new Error("Clé API invalide ou ressource restreinte. Vérifiez votre clé football-data.org.");
    }
    if (status === 429) {
      throw new Error("Limite de requêtes atteinte (10/min). Réessayez dans une minute.");
    }
    if (status === 404) {
      throw new Error(`Compétition "${competitionCode}" non trouvée.`);
    }
    if (message) {
      throw new Error(message);
    }
  }
  throw new Error(`Erreur de connexion à l'API pour ${competitionCode}.`);
};

export const setApiKey = (key: string) => {
  localStorage.setItem('FOOTBALL_DATA_KEY', key);
};

export const getApiKey = (): string | null => {
  return localStorage.getItem('FOOTBALL_DATA_KEY');
};

export const hasApiKeyConfigured = (): boolean => {
  return !!localStorage.getItem('FOOTBALL_DATA_KEY');
};

export default api;
