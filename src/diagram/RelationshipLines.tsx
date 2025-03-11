import React from 'react';
import { Relationship, Table } from '../types/index';

interface RelationshipLinesProps {
  relationships: Relationship[];
  tables: Table[];
}

const RelationshipLines: React.FC<RelationshipLinesProps> = ({ relationships, tables }) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {relationships.map(rel => {
        const sourceTable = tables.find(t => t.id === rel.source);
        const targetTable = tables.find(t => t.id === rel.target);
        
        if (!sourceTable || !targetTable) return null;
        
        const sourceX = sourceTable.position.x + 150;
        const sourceY = sourceTable.position.y + 50;
        const targetX = targetTable.position.x;
        const targetY = targetTable.position.y + 50;
        
        return (
          <g key={rel.id}>
            <line
              x1={sourceX}
              y1={sourceY}
              x2={targetX}
              y2={targetY}
              stroke="black"
              strokeWidth="2"
              strokeDasharray={rel.type === 'ManyToMany' ? "5,5" : "none"}
            />
            
            {/* Add column names to the relationship line */}
            <text 
              x={(sourceX + targetX) / 2} 
              y={(sourceY + targetY) / 2 - 20}
              className="text-xs"
              textAnchor="middle"
              fill="black"
            >
              {`${sourceTable.name}.${rel.sourceField} → ${targetTable.name}.${rel.targetField}`}
            </text>
            
            {/* Source side marker */}
            {rel.type === 'ManyToOne' || rel.type === 'ManyToMany' ? (
              <circle 
                cx={sourceX-5} 
                cy={sourceY} 
                r="5" 
                fill="black" 
              />
            ) : null}
            
            {/* Target side marker */}
            {rel.type === 'OneToMany' || rel.type === 'ManyToMany' ? (
              <polygon 
                points={`${targetX},${targetY} ${targetX-10},${targetY-5} ${targetX-10},${targetY+5}`} 
                fill="black" 
              />
            ) : rel.type === 'OneToOne' ? (
              <rect
                x={targetX-10}
                y={targetY-5}
                width="10"
                height="10"
                fill="white"
                stroke="black"
              />
            ) : null}
            
            {/* Relationship label */}
            <rect
              x={(sourceX + targetX) / 2 - 40}
              y={(sourceY + targetY) / 2 - 20}
              width="80"
              height="20"
              fill="white"
              stroke="gray"
              rx="5"
            />
            <text 
              x={(sourceX + targetX) / 2} 
              y={(sourceY + targetY) / 2 - 5}
              className="text-xs"
              textAnchor="middle"
            >
              {rel.type}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default RelationshipLines;