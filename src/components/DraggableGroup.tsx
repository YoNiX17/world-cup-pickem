import React from 'react';
import ReactDOM from 'react-dom';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Lock } from 'lucide-react';

interface TeamData {
  id: number;
  name: string;
  crest: string;
  tla: string;
}

interface Props {
  groupName: string;
  teams: TeamData[];
  disabled?: boolean;
}

// Render dragged item in a portal so it's never clipped by parent overflow
const PortalAwareDraggable: React.FC<{
  provided: any;
  snapshot: any;
  children: React.ReactNode;
}> = ({ provided, snapshot, children }) => {
  const child = (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={provided.draggableProps.style}
    >
      {children}
    </div>
  );

  if (!snapshot.isDragging) return child;
  // Portal the dragging element to body so it's never clipped
  return ReactDOM.createPortal(child, document.body);
};

export const DraggableGroup: React.FC<Props> = ({ groupName, teams, disabled }) => {
  const prettyName = groupName
    .replace('GROUP_', 'Groupe ')
    .replace('_', ' ');

  return (
    <div className={`group-card ${disabled ? 'group-card-locked' : ''}`}>
      <div className="group-card-header">
        <span className="group-card-title">{prettyName}</span>
        <span className="group-card-count">
          {disabled && <Lock size={10} style={{ marginRight: 4 }} />}
          {teams.length} équipes
        </span>
      </div>
      
      <Droppable droppableId={groupName} isDropDisabled={disabled}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`droppable-area ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
          >
            {teams.map((team, index) => (
              <Draggable 
                key={team.id.toString()} 
                draggableId={team.id.toString()} 
                index={index}
                isDragDisabled={disabled}
              >
                {(provided, snapshot) => (
                  <PortalAwareDraggable provided={provided} snapshot={snapshot}>
                    <div className={`draggable-team ${snapshot.isDragging ? 'dragging' : ''} ${disabled ? 'team-locked' : ''}`}>
                      {!disabled && <GripVertical size={14} color="var(--text-dim)" style={{ flexShrink: 0, opacity: 0.4 }} />}
                      {disabled && <Lock size={12} color="var(--text-dim)" style={{ flexShrink: 0, opacity: 0.3 }} />}
                      <div className={`position-badge position-${index + 1}`}>
                        {index + 1}
                      </div>
                      {team.crest ? (
                        <img src={team.crest} alt={team.tla} className="team-crest-small" loading="lazy" />
                      ) : (
                        <div className="team-crest-small placeholder"></div>
                      )}
                      <span className="team-name">{team.name}</span>
                      {index < 2 && (
                        <span className="qualified-tag">Qualifié</span>
                      )}
                    </div>
                  </PortalAwareDraggable>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
