import React, { useEffect, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { fetchStandings } from '../services/api';
import { DraggableGroup } from './DraggableGroup';
import { Info, Lock } from 'lucide-react';
import type { GroupPrediction } from '../services/firestore';

interface TeamStats {
  position: number;
  team: { id: number; name: string; crest: string; tla: string };
}

interface GroupStanding {
  group: string;
  table: TeamStats[];
}

interface Props {
  competition: string;
  onPredictionUpdate?: (groups: GroupPrediction) => void;
  initialPredictions?: GroupPrediction;
  disabled?: boolean;
}

export const GroupRankingBoard: React.FC<Props> = ({ competition, onPredictionUpdate, initialPredictions, disabled }) => {
  const [standings, setStandings] = useState<GroupStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStandings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchStandings(competition);
        if (!data || data.length === 0) {
          setError("Aucun classement disponible pour cette compétition actuellement.");
        } else {
          const validGroups = data.filter((g: any) => g.type === 'TOTAL');
          
          if (initialPredictions && Object.keys(initialPredictions).length > 0) {
            const reorderedGroups = validGroups.map((group: GroupStanding) => {
              const predOrder = initialPredictions[group.group];
              if (predOrder && predOrder.length > 0) {
                const reordered = predOrder
                  .map(teamId => group.table.find(t => t.team.id === teamId))
                  .filter(Boolean) as TeamStats[];
                const missing = group.table.filter(t => !predOrder.includes(t.team.id));
                return { ...group, table: [...reordered, ...missing] };
              }
              return group;
            });
            setStandings(reorderedGroups);
          } else {
            setStandings(validGroups);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Erreur inconnue.');
      } finally {
        setLoading(false);
      }
    };
    loadStandings();
  }, [competition]);

  useEffect(() => {
    if (standings.length === 0 || !onPredictionUpdate) return;
    const groupPreds: GroupPrediction = {};
    standings.forEach(group => {
      groupPreds[group.group] = group.table.map(row => row.team.id);
    });
    onPredictionUpdate(groupPreds);
  }, [standings]);

  const onDragEnd = (result: DropResult) => {
    if (disabled) return;
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    setStandings((prev) => {
      const newStandings = [...prev];
      const sourceGroupIndex = newStandings.findIndex(g => g.group === source.droppableId);
      const destGroupIndex = newStandings.findIndex(g => g.group === destination.droppableId);
      if (sourceGroupIndex !== destGroupIndex) return prev;

      const group = newStandings[sourceGroupIndex];
      const newTable = Array.from(group.table);
      const [reorderedItem] = newTable.splice(source.index, 1);
      newTable.splice(destination.index, 0, reorderedItem);

      newStandings[sourceGroupIndex] = { ...group, table: newTable };
      return newStandings;
    });
  };

  if (error) {
    return <div className="error-message"><strong>Erreur :</strong> {error}</div>;
  }

  if (loading) {
    return (
      <div className="loading animate-fade-in-up">
        <div className="loading-spinner"></div>
        <span>Récupération des groupes...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="info-banner">
        {disabled ? (
          <>
            <Lock size={18} />
            <span>Vos pronostics sont verrouillés. Vous ne pouvez plus modifier les classements.</span>
          </>
        ) : (
          <>
            <Info size={18} />
            <span>Glissez et déposez les équipes pour prédire le classement. <strong>5 pts</strong> par position exacte, <strong>3 pts</strong> si qualifié mais mauvais ordre. N'oubliez pas de <strong>Sauvegarder</strong> puis <strong>Valider</strong> !</span>
          </>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="matches-grid">
          {standings.map((group, index) => (
            <div key={group.group} className={`animate-fade-in-up animate-delay-${(index % 4) + 1}`}>
              <DraggableGroup
                groupName={group.group}
                teams={group.table.map(row => row.team)}
                disabled={disabled}
              />
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};
